import { DATAREV } from "./datarev";
import type { L, Locale } from "./framework";
import { t } from "./i18n";

/**
 * TRANSACTIONAL EMAIL COPY
 * ========================
 * Pure functions: locale and a few strings in, subject/html/text out. No env
 * reads, no network, no clock — which is what makes every line of copy here
 * testable without a mail provider.
 *
 * Three rules shape this file:
 *
 *   1. NO RESULTS IN THE BODY. Scores, levels and gaps are deliberately absent.
 *      The report sits behind the paywall on /results; mailing the numbers
 *      would hand over the thing being sold and leave a copy in an inbox that
 *      no entitlement check can reach. Every template links back instead.
 *
 *   2. BOTH LANGUAGES, ALWAYS. Copy lives in `L` pairs so a missing
 *      translation is a type error rather than an English email landing in a
 *      Spanish inbox. The lead's own locale rides along on the capture payload.
 *
 *   3. EMAIL CLIENTS ARE NOT BROWSERS. Inline styles only, one nested div, no
 *      stylesheet, no external image, no web font. Outlook and Gmail strip
 *      `<style>` blocks and classes; anything that matters has to sit in a
 *      `style` attribute or it does not survive the trip.
 */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Mirrors the `kind` enum on /api/consultation. */
export type ConsultationKind = "guided_full" | "results_review";

export interface LeadConfirmationInput {
  locale: Locale;
  /** Whatever name the lead gave us, if any. Untrusted: escaped before use. */
  name?: string;
  /** Deep link back into the app — never the results themselves. */
  reportUrl: string;
}

export interface ConsultationEmailInput {
  locale: Locale;
  name?: string;
  kind: ConsultationKind;
  /** Optional: a consultation can be requested before any assessment exists. */
  reportUrl?: string;
}

/* ----------------------------------------------------------------- escaping */

/**
 * Names arrive from a public form and from Google profile metadata, then get
 * interpolated straight into markup. Mail clients sanitise aggressively, but
 * "the client will probably strip it" is not a security control — escaping at
 * the point of interpolation is.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * First name only, capped and stripped of anything that reads as markup or a
 * control character. A greeting is a courtesy; it is not worth letting a
 * 160-character display name wreck the layout.
 */
function greetingName(raw: string | undefined): string | null {
  if (!raw) return null;
  const first = raw.trim().split(/\s+/)[0] ?? "";
  const clean = first.replace(/[^\p{L}\p{N}'’-]/gu, "").slice(0, 40);
  return clean.length > 0 ? clean : null;
}

/* -------------------------------------------------------------------- copy */

const GREETING: { named: L; anonymous: L } = {
  named: { es: "Hola", en: "Hi" },
  anonymous: { es: "Hola,", en: "Hello," },
};

const SIGN_OFF: L = {
  es: "El equipo de DataRev",
  en: "The DataRev team",
};

const LEAD = {
  subject: {
    es: "Tu diagnóstico de madurez está listo",
    en: "Your maturity assessment is ready",
  },
  heading: {
    es: "Tu diagnóstico está listo",
    en: "Your assessment is ready",
  },
  intro: {
    es: "Gracias por responder el diagnóstico de madurez en Datos e IA. Guardamos tus respuestas: tu reporte queda disponible en este enlace, cuando quieras volver a él.",
    en: "Thanks for completing the Data and AI maturity assessment. Your answers are saved — your report stays at this link, ready whenever you want to come back to it.",
  },
  ctaLabel: {
    es: "Abrir mi reporte",
    en: "Open my report",
  },
  next: {
    es: "Qué sigue: un consultor de DataRev revisa tu resultado y te escribe en el siguiente día hábil con una lectura breve y la prioridad que sugerimos atacar primero. Si prefieres adelantarte, responde a este correo.",
    en: "What happens next: a DataRev consultant reviews your result and emails you within the next business day with a short read of it and the priority we would tackle first. If you would rather move sooner, just reply to this message.",
  },
} satisfies Record<string, L>;

const CONSULTATION = {
  subject: {
    guided_full: {
      es: "Recibimos tu solicitud de sesión guiada",
      en: "We received your guided session request",
    },
    results_review: {
      es: "Recibimos tu solicitud de llamada",
      en: "We received your call request",
    },
  },
  heading: {
    guided_full: {
      es: "Solicitud recibida",
      en: "Request received",
    },
    results_review: {
      es: "Solicitud recibida",
      en: "Request received",
    },
  },
  intro: {
    guided_full: {
      es: "Recibimos tu solicitud para responder el diagnóstico completo en vivo con un consultor de DataRev. Es una sesión de una hora, sin costo y sin compromiso.",
      en: "We received your request to run the complete assessment live with a DataRev consultant. It is a one-hour session, free and with no strings attached.",
    },
    results_review: {
      es: "Recibimos tu solicitud para revisar tu reporte con un consultor de DataRev. Es una llamada de 30 minutos, sin costo y sin compromiso.",
      en: "We received your request to review your report with a DataRev consultant. It is a 30-minute call, free and with no strings attached.",
    },
  },
  next: {
    es: "Qué sigue: te escribimos para confirmar horario, normalmente el mismo día hábil. Si ya tienes un par de horarios que te acomoden, responde a este correo con ellos y los tomamos.",
    en: "What happens next: we will email you to confirm a slot, usually the same business day. If you already have a couple of times that suit you, reply with them and we will take them.",
  },
  ctaLabel: {
    es: "Ver mi reporte",
    en: "See my report",
  },
} satisfies Record<string, unknown>;

/* ------------------------------------------------------------------ layout */

// Pulled from the app's own tokens (globals.css) so the mail does not look like
// it came from somewhere else. Hex literals rather than CSS variables: `var()`
// is unsupported across most mail clients.
const INK = "#04081f";
const MUTED = "#5b6480";
const RULE = "#dfe6f5";
const ACCENT = "#1763ff";
const PAGE_BG = "#f5f8ff";
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

interface Layout {
  heading: string;
  /** Paragraphs above the call to action. Already escaped. */
  lead: string[];
  cta?: { label: string; url: string };
  /** Paragraphs below the call to action — the "what happens next" part. */
  tail: string[];
  signOff: string;
}

/** Contact block, identical in both languages — these are proper nouns. */
const FOOTER_TEXT = `${DATAREV.fullName} · ${DATAREV.site.replace("https://", "")} · ${DATAREV.email} · ${DATAREV.phone}`;

function paragraphs(items: string[]): string {
  return items.map((p) => `<p style="margin:0 0 16px;">${p}</p>`).join("");
}

function renderHtml({ heading, lead, cta, tail, signOff }: Layout): string {
  // The button is an anchor, not a <button>: mail clients drop form controls,
  // and a padded inline-block anchor renders everywhere including Outlook.
  const button = cta
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${escapeHtml(cta.label)}</a></p>`
    : "";

  return [
    `<div style="margin:0;padding:24px 12px;background:${PAGE_BG};">`,
    `<div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border:1px solid ${RULE};border-radius:14px;color:${INK};font-family:${FONT};font-size:16px;line-height:1.6;">`,
    `<p style="margin:0 0 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">${escapeHtml(DATAREV.name)}</p>`,
    `<h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;font-weight:600;color:${INK};">${escapeHtml(heading)}</h1>`,
    paragraphs(lead),
    button,
    paragraphs(tail),
    `<p style="margin:24px 0 0;">${escapeHtml(signOff)}</p>`,
    `<hr style="border:none;border-top:1px solid ${RULE};margin:28px 0 16px;">`,
    `<p style="margin:0;font-size:13px;color:${MUTED};">${escapeHtml(FOOTER_TEXT)}</p>`,
    `</div>`,
    `</div>`,
  ].join("");
}

function renderText({ heading, lead, cta, tail, signOff }: Layout): string {
  // A text/plain alternative is not decoration: clients that refuse HTML, and
  // spam filters scoring HTML-only mail, both hold it against us. The link
  // keeps its position in the reading order rather than being dumped at the end.
  const lines = [heading, "", ...lead.flatMap((p) => [p, ""])];
  if (cta) lines.push(`${cta.label}: ${cta.url}`, "");
  lines.push(...tail.flatMap((p) => [p, ""]), signOff, "", FOOTER_TEXT);
  return lines.join("\n");
}

function openingLine(locale: Locale, name: string | undefined): string {
  const first = greetingName(name);
  return first
    ? `${t(GREETING.named, locale)} ${first},`
    : t(GREETING.anonymous, locale);
}

/* --------------------------------------------------------------- templates */

/**
 * "We have your assessment." Sent the moment a lead is captured — the whole
 * point being that the visitor hears from DataRev while they are still on the
 * page, not whenever someone next reads the leads table.
 */
export function buildLeadConfirmationEmail(
  input: LeadConfirmationInput,
): RenderedEmail {
  const { locale, reportUrl } = input;

  // Escaped once, here: every string below is either our own copy or the
  // sanitised first name, so the renderers can treat them as trusted markup.
  const layout: Layout = {
    heading: t(LEAD.heading, locale),
    lead: [
      escapeHtml(openingLine(locale, input.name)),
      escapeHtml(t(LEAD.intro, locale)),
    ],
    cta: { label: t(LEAD.ctaLabel, locale), url: reportUrl },
    tail: [escapeHtml(t(LEAD.next, locale))],
    signOff: t(SIGN_OFF, locale),
  };

  return {
    subject: t(LEAD.subject, locale),
    html: renderHtml(layout),
    text: renderText(layout),
  };
}

/**
 * "We have your request, here is when you will hear back." The expectation —
 * same business day — matches what the UI already promises in `guidedRequestNote`,
 * because a mail that contradicts the page it came from costs more than no mail.
 */
export function buildConsultationRequestEmail(
  input: ConsultationEmailInput,
): RenderedEmail {
  const { locale, kind, reportUrl } = input;

  const layout: Layout = {
    heading: t(CONSULTATION.heading[kind], locale),
    lead: [
      escapeHtml(openingLine(locale, input.name)),
      escapeHtml(t(CONSULTATION.intro[kind], locale)),
    ],
    tail: [escapeHtml(t(CONSULTATION.next, locale))],
    // No report link when the request arrived before any assessment existed:
    // a button leading to an empty report is worse than no button.
    cta: reportUrl
      ? { label: t(CONSULTATION.ctaLabel, locale), url: reportUrl }
      : undefined,
    signOff: t(SIGN_OFF, locale),
  };

  return {
    subject: t(CONSULTATION.subject[kind], locale),
    html: renderHtml(layout),
    text: renderText(layout),
  };
}
