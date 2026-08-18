import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DATAREV } from "./datarev";
import {
  emailConfigured,
  getResend,
  redactEmails,
  reportUrl,
  sendConsultationRequestReceived,
  sendLeadConfirmation,
} from "./email";
import {
  buildConsultationRequestEmail,
  buildLeadConfirmationEmail,
  escapeHtml,
  type ConsultationKind,
  type RenderedEmail,
} from "./emailTemplates";
import type { Locale } from "./framework";

/**
 * Resend is mocked at the module boundary — no test here opens a socket, and
 * none of them needs an API key that works. `vi.hoisted` is what lets the spy
 * be referenced from the (hoisted) mock factory.
 */
const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
    constructor(key?: string) {
      // Mirrors the real SDK, which throws on a missing key. That throw is the
      // whole reason `getResend()` has to be lazy.
      if (!key) throw new Error("Missing API key.");
    }
  },
}));

const LEAD_EMAIL = "ana.perez@empresa-cliente.mx";
const LOCALES: Locale[] = ["es", "en"];

/** Both credentials present, in the shape a real deploy would have them. */
function configureEmail(key = "re_test_placeholder"): void {
  vi.stubEnv("RESEND_API_KEY", key);
  vi.stubEnv("EMAIL_FROM", "DataRev <diagnostico@datarev.solutions>");
}

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("emailConfigured", () => {
  it("is false with no API key, so nothing downstream assumes mail works", () => {
    vi.stubEnv("RESEND_API_KEY", undefined);
    vi.stubEnv("EMAIL_FROM", "DataRev <diagnostico@datarev.solutions>");
    expect(emailConfigured()).toBe(false);
  });

  it("is false with a key but no verified from-address", () => {
    // Resend refuses any `from` outside a verified domain; reporting
    // "configured" here would only move the failure to send time.
    vi.stubEnv("RESEND_API_KEY", "re_test_placeholder");
    vi.stubEnv("EMAIL_FROM", undefined);
    expect(emailConfigured()).toBe(false);
  });

  it("is true once both variables are present", () => {
    configureEmail();
    expect(emailConfigured()).toBe(true);
  });

  it("treats empty or whitespace-only values as unset", () => {
    vi.stubEnv("RESEND_API_KEY", "   ");
    vi.stubEnv("EMAIL_FROM", "DataRev <diagnostico@datarev.solutions>");
    expect(emailConfigured()).toBe(false);

    vi.stubEnv("RESEND_API_KEY", "re_test_placeholder");
    vi.stubEnv("EMAIL_FROM", "");
    expect(emailConfigured()).toBe(false);
  });
});

describe("getResend", () => {
  it("returns null instead of throwing when unconfigured", () => {
    // The point of the lazy design: importing this module during a build with
    // no mail credentials must not blow up.
    vi.stubEnv("RESEND_API_KEY", undefined);
    expect(getResend()).toBeNull();
  });

  it("builds a client when configured and reuses it for the same key", () => {
    configureEmail("re_reuse_key");
    const first = getResend();
    expect(first).not.toBeNull();
    expect(getResend()).toBe(first);
  });

  it("rebuilds when the key changes, so a rotated key takes effect", () => {
    configureEmail("re_key_one");
    const first = getResend();
    configureEmail("re_key_two");
    expect(getResend()).not.toBe(first);
  });
});

describe("reportUrl", () => {
  it("links to /results on the configured site", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://diagnostico.datarev.solutions");
    expect(reportUrl()).toBe("https://diagnostico.datarev.solutions/results");
  });

  it("tolerates a trailing slash on the configured site url", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://datarev.solutions/");
    expect(reportUrl()).toBe("https://datarev.solutions/results");
  });

  it("falls back to the brand site rather than emitting a relative link", () => {
    // A relative path is meaningless inside an inbox.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
    expect(reportUrl()).toBe(`${DATAREV.site}/results`);
  });

  it("url-encodes the share code so the link survives a mail client", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://datarev.solutions");
    expect(reportUrl("v1~full~34+2/1~5555~es")).toBe(
      "https://datarev.solutions/results?r=v1~full~34%2B2%2F1~5555~es",
    );
  });
});

describe("sending without configuration", () => {
  it("reports not_configured instead of throwing, and calls no provider", async () => {
    vi.stubEnv("RESEND_API_KEY", undefined);
    vi.stubEnv("EMAIL_FROM", undefined);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const outcome = await sendLeadConfirmation({
      to: LEAD_EMAIL,
      locale: "es",
    });

    expect(outcome).toEqual({ sent: false, reason: "not_configured" });
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("send failures never throw", () => {
  it("swallows a provider rejection and reports it", async () => {
    configureEmail();
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        statusCode: 422,
        message: `You can only send testing emails to your own address (${LEAD_EMAIL})`,
      },
    });

    const outcome = await sendLeadConfirmation({
      to: LEAD_EMAIL,
      locale: "en",
    });

    expect(outcome).toEqual({ sent: false, reason: "rejected" });
    expect(errorLog).toHaveBeenCalled();
  });

  it("swallows a thrown transport error and reports it", async () => {
    configureEmail();
    vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockRejectedValue(new Error("fetch failed: ECONNRESET"));

    await expect(
      sendLeadConfirmation({ to: LEAD_EMAIL, locale: "es" }),
    ).resolves.toEqual({ sent: false, reason: "transport_error" });
  });

  it("swallows a non-Error rejection too", async () => {
    configureEmail();
    vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockRejectedValue({ weird: true });

    await expect(
      sendConsultationRequestReceived({
        to: LEAD_EMAIL,
        locale: "en",
        kind: "guided_full",
      }),
    ).resolves.toEqual({ sent: false, reason: "transport_error" });
  });
});

describe("recipient privacy", () => {
  it("puts the address in `to` and nowhere else in the payload", async () => {
    configureEmail();
    await sendLeadConfirmation({
      to: LEAD_EMAIL,
      locale: "es",
      name: "Ana Pérez",
      shareCode: "v1~full~1~1~es",
      leadId: "3f1c9c9e-0000-4000-8000-000000000001",
    });

    const [payload] = sendMock.mock.calls[0] as [Record<string, unknown>];
    expect(payload.to).toBe(LEAD_EMAIL);

    const rest = { ...payload, to: undefined };
    expect(JSON.stringify(rest)).not.toContain(LEAD_EMAIL);
  });

  it("keeps the address out of the log when the provider quotes it back", async () => {
    configureEmail();
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        statusCode: 422,
        message: `Address ${LEAD_EMAIL} is suppressed`,
      },
    });

    await sendLeadConfirmation({ to: LEAD_EMAIL, locale: "es" });

    const logged = JSON.stringify(errorLog.mock.calls);
    expect(logged).not.toContain(LEAD_EMAIL);
    expect(logged).toContain("validation_error");
  });

  it("never writes the API key into a log line", async () => {
    configureEmail("re_super_secret_key");
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockRejectedValue(new Error("boom"));

    await sendLeadConfirmation({ to: LEAD_EMAIL, locale: "en" });

    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(
      "re_super_secret_key",
    );
  });
});

describe("redactEmails", () => {
  it("removes address-shaped text while keeping the rest readable", () => {
    expect(redactEmails(`rate limited for ${LEAD_EMAIL}`)).toBe(
      "rate limited for [redacted-email]",
    );
  });

  it("removes every address, not just the first", () => {
    const redacted = redactEmails("a@b.com, c@d.mx failed");
    expect(redacted).not.toContain("@");
  });

  it("leaves text with no address untouched", () => {
    expect(redactEmails("rate_limit_exceeded")).toBe("rate_limit_exceeded");
  });
});

describe("send payload", () => {
  it("sends the locale the visitor actually used", async () => {
    configureEmail();
    await sendLeadConfirmation({ to: LEAD_EMAIL, locale: "en" });
    const [payload] = sendMock.mock.calls[0] as [Record<string, unknown>];
    expect(payload.subject).toBe(
      buildLeadConfirmationEmail({ locale: "en", reportUrl: "x" }).subject,
    );

    sendMock.mockClear();
    await sendLeadConfirmation({ to: LEAD_EMAIL, locale: "es" });
    const [spanish] = sendMock.mock.calls[0] as [Record<string, unknown>];
    expect(spanish.subject).toBe(
      buildLeadConfirmationEmail({ locale: "es", reportUrl: "x" }).subject,
    );
  });

  it("passes an idempotency key derived from the lead id, never the address", async () => {
    // `capture_lead` upserts, so the same visitor can hit the route twice —
    // the key is what stops that becoming two identical emails.
    configureEmail();
    await sendLeadConfirmation({
      to: LEAD_EMAIL,
      locale: "es",
      leadId: "3f1c9c9e-0000-4000-8000-000000000001",
    });

    const options = sendMock.mock.calls[0][1] as { idempotencyKey?: string };
    expect(options.idempotencyKey).toBe(
      "lead-confirmation/3f1c9c9e-0000-4000-8000-000000000001",
    );
    expect(options.idempotencyKey).not.toContain("@");
  });

  it("omits the idempotency key when there is no id to key on", async () => {
    configureEmail();
    await sendLeadConfirmation({ to: LEAD_EMAIL, locale: "es" });
    expect(sendMock.mock.calls[0][1]).toBeUndefined();
  });

  it("sends both an HTML and a plain-text body", async () => {
    configureEmail();
    await sendLeadConfirmation({ to: LEAD_EMAIL, locale: "es" });
    const [payload] = sendMock.mock.calls[0] as [Record<string, string>];
    expect(payload.html).toContain("<");
    expect(payload.text.length).toBeGreaterThan(0);
    expect(payload.text).not.toContain("<div");
  });
});

/* --------------------------------------------------------------- templates */

/**
 * A rendered email must never carry an unsubstituted slot. These are the
 * strings that show up when interpolation silently fails.
 */
const PLACEHOLDER_LEAKS = [
  "undefined",
  "null",
  "NaN",
  "[object Object]",
  "{{",
  "${",
  "%s",
];

function expectNoPlaceholders(email: RenderedEmail): void {
  for (const part of [email.subject, email.html, email.text]) {
    expect(part.length).toBeGreaterThan(0);
    for (const leak of PLACEHOLDER_LEAKS) {
      expect(part, `"${leak}" leaked into a rendered email`).not.toContain(
        leak,
      );
    }
  }
}

describe("buildLeadConfirmationEmail", () => {
  const REPORT = "https://datarev.solutions/results?r=v1~full~1~1~es";

  it.each(LOCALES)("renders cleanly in %s", (locale) => {
    const email = buildLeadConfirmationEmail({
      locale,
      name: "Ana Pérez",
      reportUrl: REPORT,
    });
    expectNoPlaceholders(email);
    expect(email.html).toContain(REPORT);
    expect(email.text).toContain(REPORT);
    expect(email.html).toContain("Ana");
  });

  it("renders cleanly with no name at all", () => {
    // Google sign-in can hand us a lead with an address and nothing else.
    for (const locale of LOCALES) {
      expectNoPlaceholders(
        buildLeadConfirmationEmail({ locale, reportUrl: REPORT }),
      );
    }
  });

  it("renders cleanly when the name is blank or punctuation only", () => {
    for (const name of ["", "   ", "!!!"]) {
      const email = buildLeadConfirmationEmail({
        locale: "es",
        name,
        reportUrl: REPORT,
      });
      expectNoPlaceholders(email);
    }
  });

  it("actually differs between languages", () => {
    const es = buildLeadConfirmationEmail({ locale: "es", reportUrl: REPORT });
    const en = buildLeadConfirmationEmail({ locale: "en", reportUrl: REPORT });
    expect(es.subject).not.toBe(en.subject);
    expect(es.html).not.toBe(en.html);
  });

  it("escapes a name that contains markup", () => {
    const email = buildLeadConfirmationEmail({
      locale: "es",
      name: "<script>alert(1)</script>",
      reportUrl: REPORT,
    });
    expect(email.html).not.toContain("<script");
  });

  it("carries DataRev's real contact details, never invented ones", () => {
    // Read from the brand constants rather than hard-coded here: the point is
    // that the footer tracks `datarev.ts`, not that it matches a literal.
    const email = buildLeadConfirmationEmail({ locale: "es", reportUrl: REPORT });
    expect(email.html).toContain(DATAREV.email);
    expect(email.text).toContain(DATAREV.phone);
    expect(email.text).toContain(DATAREV.fullName);
  });
});

describe("buildConsultationRequestEmail", () => {
  const KINDS: ConsultationKind[] = ["guided_full", "results_review"];

  it.each(LOCALES)("renders cleanly in %s for both kinds", (locale) => {
    for (const kind of KINDS) {
      const email = buildConsultationRequestEmail({
        locale,
        kind,
        name: "Ana",
        reportUrl: "https://datarev.solutions/results",
      });
      expectNoPlaceholders(email);
    }
  });

  it("renders cleanly with no report link, which is the pre-assessment case", () => {
    for (const locale of LOCALES) {
      for (const kind of KINDS) {
        const email = buildConsultationRequestEmail({ locale, kind });
        expectNoPlaceholders(email);
        expect(email.html).not.toContain("href=\"\"");
      }
    }
  });

  it("distinguishes the one-hour session from the 30-minute review", () => {
    const guided = buildConsultationRequestEmail({
      locale: "es",
      kind: "guided_full",
    });
    const review = buildConsultationRequestEmail({
      locale: "es",
      kind: "results_review",
    });
    expect(guided.text).not.toBe(review.text);
  });

  it("sets an expectation for when someone replies", () => {
    expect(
      buildConsultationRequestEmail({ locale: "es", kind: "guided_full" }).text,
    ).toContain("día hábil");
    expect(
      buildConsultationRequestEmail({ locale: "en", kind: "guided_full" }).text,
    ).toContain("business day");
  });
});

describe("escapeHtml", () => {
  it("neutralises every character that could break out of markup", () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;",
    );
  });
});
