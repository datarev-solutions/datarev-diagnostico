import { Resend } from "resend";
import { DATAREV } from "./datarev";
import type { Locale } from "./framework";
import {
  buildConsultationRequestEmail,
  buildLeadConfirmationEmail,
  type ConsultationKind,
  type RenderedEmail,
} from "./emailTemplates";

/**
 * TRANSACTIONAL EMAIL — RESEND CLIENT AND SEND WRAPPER
 * ====================================================
 * The one place that reads mail credentials, deliberately shaped like
 * `stripe.ts`. Four rules:
 *
 *   1. NOTHING THROWS AT MODULE LOAD. `new Resend()` throws on a missing key,
 *      so the client is built lazily and only when a key exists. `next build`
 *      imports every route module; an eager client would take a preview deploy
 *      down over a feature nobody has switched on yet.
 *
 *   2. A SEND NEVER BREAKS THE CALLER. Every exported send returns an outcome
 *      and swallows failures. Capturing the lead is the thing that matters —
 *      the email is a nice-to-have on top, and a visitor must never see an
 *      error because a mail provider had a bad minute.
 *
 *   3. THE RECIPIENT ADDRESS GOES IN `to` AND NOWHERE ELSE. It is PII. It is
 *      not in a log line, not in analytics, and not in an error string —
 *      provider messages get scrubbed before they reach the console, because
 *      Resend cheerfully echoes the address back inside validation errors.
 *
 *   4. THE KEY IS NEVER LOGGED. Not on success, not on failure, not truncated.
 */

/** What a send attempt did. Callers may ignore it; nothing here throws. */
export type SendOutcome =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "rejected" | "transport_error" };

/**
 * Memoised per key, same as `stripe.ts`: pairing the instance with the key it
 * was built from means a rotated secret (or a test stubbing env) rebuilds the
 * client instead of handing back one holding the old credential.
 */
let cached: { key: string; client: Resend } | null = null;

/** Logged at most once per process — see `logMissingConfig`. */
let warnedMissingConfig = false;

function apiKey(): string | undefined {
  // Trimmed: a key pasted into a dashboard field routinely arrives with a
  // trailing newline, which Resend rejects as malformed rather than missing.
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? key : undefined;
}

/**
 * The verified-domain address every message is sent from. Resend refuses any
 * `from` outside a domain you have verified, so a wrong value here fails every
 * send — which is why it is part of the capability check below.
 */
function fromAddress(): string | undefined {
  const from = process.env.EMAIL_FROM?.trim();
  return from ? from : undefined;
}

/**
 * Can this deployment actually send mail?
 *
 * Both vars, not just the key: with a key and no `EMAIL_FROM` there is nothing
 * to send from, so reporting "configured" would only move the failure later,
 * into a provider 422 nobody is watching.
 */
export function emailConfigured(): boolean {
  return Boolean(apiKey() && fromAddress());
}

/**
 * The Resend client, or null when unconfigured.
 *
 * Null rather than a throw is what makes the "email is off" branch impossible
 * to forget: TypeScript will not let a caller touch the client without first
 * handling the null.
 */
export function getResend(): Resend | null {
  const key = apiKey();
  if (!key) return null;

  if (cached?.key === key) return cached.client;

  const client = new Resend(key);
  cached = { key, client };
  return client;
}

/* ------------------------------------------------------------------- links */

/**
 * Base URL for links in an email. `NEXT_PUBLIC_SITE_URL` is what the Stripe
 * routes already use for redirects; the brand constant is the fallback so a
 * half-configured deploy still sends a working link rather than a relative
 * path, which is meaningless inside an inbox.
 */
function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
    /\/+$/,
    "",
  );
  return configured || DATAREV.site;
}

/**
 * Link back to the visitor's own report.
 *
 * The share code only rehydrates their answers in the browser — exactly what
 * the in-app "copy link" button produces. The paywall still runs on /results,
 * so this links to the report without mailing the results themselves.
 */
export function reportUrl(shareCode?: string): string {
  const base = `${siteUrl()}/results`;
  return shareCode ? `${base}?r=${encodeURIComponent(shareCode)}` : base;
}

/* ---------------------------------------------------------------- redaction */

const EMAIL_PATTERN = /[^\s<>@,;:"]+@[^\s<>@,;:"]+\.[a-z]{2,}/gi;

/**
 * Strip anything address-shaped out of text bound for a log.
 *
 * Resend's validation errors quote the offending recipient verbatim
 * ("You can only send testing emails to your own address (someone@…)"), so
 * logging a provider message as-is would leak a lead's address into whatever
 * ships the logs. Redacting at the boundary makes the rule enforced rather
 * than merely intended.
 */
export function redactEmails(text: string): string {
  return text.replace(EMAIL_PATTERN, "[redacted-email]");
}

/** A short, PII-free description of why a send failed. */
function describeError(error: unknown): string {
  if (error instanceof Error) return redactEmails(error.message).slice(0, 200);
  if (typeof error === "string") return redactEmails(error).slice(0, 200);
  return "unknown_error";
}

function logMissingConfig(template: string): void {
  // Once per process. An unconfigured deploy is a steady state, not an
  // incident — a warning on every single lead would bury the real errors.
  if (warnedMissingConfig) return;
  warnedMissingConfig = true;
  console.warn(
    `[email] RESEND_API_KEY or EMAIL_FROM is unset — no transactional email will be sent (first skipped: ${template})`,
  );
}

/* -------------------------------------------------------------------- send */

interface SendArgs {
  /** Recipient. Stays in `to`; never reaches a log line. */
  to: string;
  email: RenderedEmail;
  /** Template name, for logs. Carries no personal data. */
  template: string;
  locale: Locale;
  /**
   * Optional dedupe key. `capture_lead` upserts, so the same visitor can hit
   * the route twice (form submit, then the Google path on /results) — without
   * a key that is two identical emails inside a minute.
   */
  idempotencyKey?: string;
}

/**
 * The single exit point to the mail provider. Returns, never throws:
 * every caller of this module runs on a path where the user-visible operation
 * has already succeeded.
 */
async function send({
  to,
  email,
  template,
  locale,
  idempotencyKey,
}: SendArgs): Promise<SendOutcome> {
  const client = getResend();
  const from = fromAddress();

  if (!client || !from) {
    logMissingConfig(template);
    return { sent: false, reason: "not_configured" };
  }

  try {
    const { error } = await client.emails.send(
      {
        from,
        to,
        // Replies land with a human. A no-reply address on a message that ends
        // in "just reply to this" would be a small, avoidable lie.
        replyTo: DATAREV.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    );

    if (error) {
      // `error.name` is Resend's stable error code; `message` is free text that
      // can quote the recipient, hence the scrub.
      console.error("[email] provider rejected send", {
        template,
        locale,
        code: error.name,
        status: error.statusCode,
        detail: redactEmails(error.message ?? "").slice(0, 200),
      });
      return { sent: false, reason: "rejected" };
    }

    return { sent: true };
  } catch (error: unknown) {
    // Network failure, DNS, an aborted request — anything the SDK does not
    // convert into an `error` field.
    console.error("[email] send failed", {
      template,
      locale,
      detail: describeError(error),
    });
    return { sent: false, reason: "transport_error" };
  }
}

/* --------------------------------------------------------------- callables */

export interface LeadConfirmationArgs {
  to: string;
  locale: Locale;
  name?: string;
  /** Encoded assessment state, when the lead arrived with one. */
  shareCode?: string;
  /** `capture_lead`'s id, used only as a dedupe key. Not personal data. */
  leadId?: string | null;
}

/** "We have your assessment, here is your report, here is what happens next." */
export async function sendLeadConfirmation(
  args: LeadConfirmationArgs,
): Promise<SendOutcome> {
  const email = buildLeadConfirmationEmail({
    locale: args.locale,
    name: args.name,
    reportUrl: reportUrl(args.shareCode),
  });

  return send({
    to: args.to,
    email,
    template: "lead_confirmation",
    locale: args.locale,
    idempotencyKey: args.leadId
      ? `lead-confirmation/${args.leadId}`
      : undefined,
  });
}

export interface ConsultationEmailArgs {
  to: string;
  locale: Locale;
  name?: string;
  kind: ConsultationKind;
  shareCode?: string;
  consultationId?: string | null;
}

/**
 * "We have your request and here is when we reply."
 *
 * Lives here rather than in the consultation route so both entry points share
 * one client, one redaction rule and one failure policy.
 */
export async function sendConsultationRequestReceived(
  args: ConsultationEmailArgs,
): Promise<SendOutcome> {
  const email = buildConsultationRequestEmail({
    locale: args.locale,
    name: args.name,
    kind: args.kind,
    reportUrl: args.shareCode ? reportUrl(args.shareCode) : undefined,
  });

  return send({
    to: args.to,
    email,
    template: "consultation_received",
    locale: args.locale,
    idempotencyKey: args.consultationId
      ? `consultation-received/${args.consultationId}`
      : undefined,
  });
}
