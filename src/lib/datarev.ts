import type { L } from "./framework";

/**
 * Brand constants, taken from the live site (datarev.solutions), the Spanish
 * services deck and the pitch PDF.
 *
 * Phone number: the pitch PDF carries +52 (55) 6382-7421 while the live site and
 * the main deck carry +52 (55) 9199-6815. Dante confirmed 9199-6815 on
 * 2026-08-05 — that is the number, the one in the pitch PDF is stale.
 */
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
 * Calendly targets. The 60-minute guided assessment is a separate event type
 * that has to exist in Calendly; until it does, this falls back to the public
 * 30-minute link so the CTA is never dead.
 */
export const BOOKING = {
  /** Guided full assessment, run live with a consultant. One hour, free. */
  guided:
    process.env.NEXT_PUBLIC_CALENDLY_GUIDED_URL ??
    "https://calendly.com/admin-datarev/30min",
  /** Short call to walk through an already-finished report. */
  review:
    process.env.NEXT_PUBLIC_CALENDLY_REVIEW_URL ??
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
