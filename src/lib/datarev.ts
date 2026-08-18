import type { L } from "./framework";

/**
 * Brand constants, taken from the live site (datarev.solutions), the Spanish
 * services deck and the pitch PDF.
 *
 * Phone number: the pitch PDF carries +52 (55) 6382-7421 while the live site and
 * the main deck carry +52 (55) 9199-6815. Dante confirmed 9199-6815 on
 * 2026-08-05 — that is the number, the one in the pitch PDF is stale.
 */
/**
 * DataRev's own service brochure — the ES/EN PDF decks from the pitch deck
 * (`DataRev Esp.pdf` / `DataRev Eng.pdf`), served locally under /brochure so
 * the download never depends on a Drive share link staying valid.
 */
export const BROCHURE = {
  es: "/brochure/datarev-es.pdf",
  en: "/brochure/datarev-en.pdf",
} as const;

export const DATAREV = {
  name: "DataRev",
  fullName: "DataRev — Data Revolution",
  site: "https://datarev.solutions",
  email: "hello@datarev.solutions",
  phone: "+52 (55) 9199-6815",
  phoneHref: "tel:+525591996815",
  city: "Ciudad de México",
} as const;

/** The only event type published on `calendly.com/admin-datarev` today. */
const THIRTY_MINUTE_EVENT = "https://calendly.com/admin-datarev/30min";

/**
 * Anything that is not a Calendly URL cannot drive the inline widget, so it is
 * treated as "not configured" rather than embedded and left to fail. A typo in
 * an env var (a missing scheme, a Meet link pasted by mistake) then degrades to
 * the mailto instead of rendering an empty box where the calendar should be.
 */
function calendlyUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    const calendly =
      parsed.protocol === "https:" &&
      (parsed.hostname === "calendly.com" ||
        parsed.hostname.endsWith(".calendly.com"));
    return calendly ? parsed.toString() : null;
  } catch {
    return null;
  }
}

const guidedUrl = calendlyUrl(process.env.NEXT_PUBLIC_CALENDLY_GUIDED_URL);

/**
 * Calendly targets. Embedded inline in the page rather than opened in a new
 * tab or handed to a mail client: at the moment someone decides to talk to us,
 * every extra hop is a chance to not do it.
 *
 * THE 60-MINUTE MISMATCH — open as of 2026-08-18. The guided assessment is
 * offered as a full hour (confirmed 2026-08-06), yet the only event type that
 * exists in Calendly is 30 minutes. The two cannot both be honoured, so:
 *
 *   - `NEXT_PUBLIC_CALENDLY_GUIDED_URL` set → that event is embedded and
 *     `guidedIsFullHour` is true. Copy and calendar agree, nothing to explain.
 *   - unset → the 30-minute event is embedded anyway, because a bookable slot
 *     today beats a callback promise tomorrow, and `guidedIsFullHour` is false
 *     so the UI says out loud that the slot on offer is half an hour. What is
 *     not allowed is taking a 30-minute booking under one-hour copy in silence.
 *
 * Create the 60-minute event type in Calendly, set the env var, and the notice
 * disappears on its own.
 *
 * The review call really is 30 minutes, so that one needs no such caveat.
 */
export const BOOKING = {
  /** Guided full assessment, run live with a consultant. One hour, free. */
  guided: guidedUrl ?? calendlyUrl(THIRTY_MINUTE_EVENT),
  /** True only once a real 60-minute event type is wired up. */
  guidedIsFullHour: guidedUrl !== null,
  /** Short call to walk through an already-finished report. */
  review:
    calendlyUrl(process.env.NEXT_PUBLIC_CALENDLY_REVIEW_URL) ??
    calendlyUrl(THIRTY_MINUTE_EVENT),
} as const;

/** Copy that is specific to DataRev rather than to the assessment itself. */
export const BRAND_COPY = {
  tagline: {
    es: "De los datos a los resultados",
    en: "From data to results",
  },
  promise: {
    es: "Tú lideras la Revolución. Nosotros la hacemos realidad.",
    en: "You lead the Revolution. We make it real.",
  },
  positioning: {
    es: "No vendemos transformación. Entregamos progreso.",
    en: "We don't sell transformation. We deliver progress.",
  },
} satisfies Record<string, L>;

/**
 * The three numbers DataRev leads with in every deck. Kept here so the landing
 * page and the report cite the same figures.
 */
export const MARKET_STATS: {
  value: string;
  source: string;
  claim: L;
}[] = [
  {
    value: "88%",
    source: "McKinsey, 2025",
    claim: {
      es: "de las organizaciones ya usa IA en al menos una función del negocio.",
      en: "of organisations already use AI in at least one business function.",
    },
  },
  {
    value: "95%",
    source: "MIT, 2025",
    claim: {
      es: "de los pilotos de IA generativa no logran impacto medible en el negocio.",
      en: "of generative-AI pilots fail to deliver measurable business impact.",
    },
  },
  {
    value: "30%",
    source: "Gartner",
    claim: {
      es: "de los proyectos se abandona después del POC por mala calidad de datos.",
      en: "of projects are abandoned after the POC due to poor data quality.",
    },
  },
];
