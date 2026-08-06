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

/**
 * Calendly targets.
 *
 * The guided assessment is offered as a full hour (confirmed 2026-08-06), but
 * `calendly.com/admin-datarev` currently exposes only a 30-minute event type.
 * Falling back to that link would promise an hour and then open a page saying
 * thirty minutes — at the exact moment the visitor decides to trust us.
 *
 * So the guided path deliberately has NO fallback. When the 60-minute event
 * does not exist, the CTA records the request and promises a callback instead
 * of opening a mismatched calendar. Set the env var and it becomes one-click.
 *
 * The review call really is 30 minutes, so that one links out as normal.
 */
const guidedUrl = process.env.NEXT_PUBLIC_CALENDLY_GUIDED_URL?.trim();

export const BOOKING = {
  /** Guided full assessment, run live with a consultant. One hour, free. */
  guided: guidedUrl || null,
  /** True once the 60-minute event type exists and is wired up. */
  guidedIsBookable: Boolean(guidedUrl),
  /** Short call to walk through an already-finished report. */
  review:
    process.env.NEXT_PUBLIC_CALENDLY_REVIEW_URL?.trim() ||
    "https://calendly.com/admin-datarev/30min",
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
