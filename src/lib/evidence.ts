import type { L } from "./framework";
import type { Department, Industry } from "./useCases";

/**
 * PUBLISHED EVIDENCE BEHIND THE SCORES
 * ====================================
 * The impact and difficulty numbers in the use-case catalogue are not opinions
 * dressed as data. This file holds the published statistics they are derived
 * from, each one tagged with its source, sample and date, so a client can audit
 * where a number came from instead of taking it on faith.
 *
 * What is measured and what is derived is stated per item. Nothing here claims
 * to be DataRev's own delivery history — that data does not exist yet.
 *
 * Currency: everything below was published between June and October 2025.
 * Older, widely-circulated figures (McKinsey's 2022 Digital Quotient, the
 * "87% of models never reach production" line) are deliberately NOT used: they
 * predate generative AI in production and would misprice every agentic case.
 */

export interface Source {
  id: string;
  org: string;
  title: string;
  published: string;
  /** Sample and method, so the reader can weigh it. */
  basis: L;
  url: string;
}

export const SOURCES: Source[] = [
  {
    id: "cisco2025",
    org: "Cisco",
    title: "AI Readiness Index 2025 — Realizing the Value of AI",
    published: "2025-10",
    basis: {
      es: "8,039 líderes responsables de IA en empresas de 500+ empleados, 30 mercados, 26 industrias. Campo en agosto 2025, análisis por un tercero independiente. Significancia ±1% al 95%.",
      en: "8,039 leaders responsible for AI in organizations with 500+ employees, 30 markets, 26 industries. Fieldwork August 2025, analysed by an independent third party. Significant to ±1% at 95%.",
    },
    url: "https://www.cisco.com/c/dam/m/en_us/solutions/ai/readiness-index/2025-m10/documents/cisco-ai-readiness-index-2025-realizing-the-value-of-ai.pdf",
  },
  {
    id: "nanda2025",
    org: "MIT Project NANDA",
    title: "The GenAI Divide: State of AI in Business 2025",
    published: "2025-07",
    basis: {
      es: "300+ despliegues públicos, 52 entrevistas ejecutivas estructuradas, 153 respuestas de encuesta.",
      en: "300+ public deployments, 52 structured executive interviews, 153 survey responses.",
    },
    url: "https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf",
  },
  {
    id: "gartner2025",
    org: "Gartner",
    title: "Over 40% of Agentic AI Projects Will Be Canceled by End of 2027",
    published: "2025-06-25",
    basis: {
      es: "Predicción de Gartner. Causas citadas: costos crecientes, valor de negocio poco claro y controles de riesgo inadecuados.",
      en: "Gartner prediction. Cited causes: escalating costs, unclear business value and inadequate risk controls.",
    },
    url: "https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027",
  },
  {
    id: "mad2025",
    org: "FirstMark / Matt Turck",
    title: "Bubble & Build: The 2025 MAD (ML, AI & Data) Landscape",
    published: "2025-10-28",
    basis: {
      es: "Onceava edición del mapa del ecosistema, ~1,150 proveedores. Define el flujo datos → infraestructura → ML/IA → agentes/aplicaciones y agrega por primera vez una capa explícita de agentes.",
      en: "Eleventh edition of the ecosystem map, ~1,150 vendors. Defines the data → infrastructure → ML/AI → agents/applications flow and adds an explicit agent layer for the first time.",
    },
    url: "https://www.mattturck.com/mad2025",
  },
  {
    id: "synq2025",
    org: "SYNQ (Mikkel Dengsøe)",
    title: "How top data teams are structured",
    published: "2025",
    basis: {
      es: "Benchmark de composición de cientos de equipos de datos: mediana 46% roles de insights (analistas y científicos), 43% ingeniería de datos, 11% machine learning.",
      en: "Composition benchmark across hundreds of data teams: median 46% insights roles (analysts and scientists), 43% data engineering, 11% machine learning.",
    },
    url: "https://www.synq.io/blog/data-team-composition",
  },
  {
    id: "deloitte2026",
    org: "Deloitte",
    title: "Global Technology Leadership Study — technical debt's penalty on value and growth",
    published: "2026",
    basis: {
      es: "La deuda técnica representa entre 21% y 40% del gasto de TI de una organización.",
      en: "Technical debt accounts for 21% to 40% of an organization's IT spend.",
    },
    url: "https://www.deloitte.com/us/en/insights/topics/technology-management/technical-debt-impact.html",
  },
];

export const SOURCE_BY_ID: Record<string, Source> = Object.fromEntries(
  SOURCES.map((s) => [s.id, s]),
);

/* --------------------------------------------------- CISCO FOCUS AREAS */

/**
 * The nine areas Cisco asked about. A use case belongs to exactly one — this is
 * the join key between our catalogue and their measured data.
 */
export type FocusArea =
  | "cx"
  | "opsEfficiency"
  | "productInnovation"
  | "cybersecurity"
  | "riskFraud"
  | "compliance"
  | "marketingSales"
  | "workforce"
  | "rnd";

export const FOCUS_LABEL: Record<FocusArea, L> = {
  cx: { es: "Experiencia y servicio al cliente", en: "Customer experience and service" },
  opsEfficiency: { es: "Eficiencia operativa y automatización", en: "Operational efficiency and automation" },
  productInnovation: { es: "Innovación de producto y servicio", en: "Product and service innovation" },
  cybersecurity: { es: "Ciberseguridad", en: "Cybersecurity" },
  riskFraud: { es: "Riesgo y detección de fraude", en: "Risk management and fraud detection" },
  compliance: { es: "Cumplimiento y monitoreo", en: "Compliance and monitoring" },
  marketingSales: { es: "Marketing y ventas", en: "Marketing and sales optimization" },
  workforce: { es: "Recursos humanos y fuerza laboral", en: "Human resources and workforce management" },
  rnd: { es: "I+D y descubrimiento científico", en: "R&D and scientific discovery" },
};

/**
 * MEASURED. Cisco AI Readiness Index 2025, "Most industries are focusing their
 * efforts on their operational efficiency": share of organizations in each
 * industry prioritising each focus area, transcribed verbatim from the report.
 *
 * Cisco surveyed 26 industries but publishes this cut for ten. Our catalogue
 * covers eight industries; the six that overlap use Cisco's own column, and the
 * two that do not (insurance, telco, logistics) are mapped below with the
 * mapping stated openly rather than silently invented.
 */
export const CISCO_PRIORITY: Record<string, Record<FocusArea, number>> = {
  technology:        { cx: 48, opsEfficiency: 55, productInnovation: 56, cybersecurity: 49, riskFraud: 44, compliance: 28, marketingSales: 43, workforce: 44, rnd: 45 },
  retail:            { cx: 47, opsEfficiency: 50, productInnovation: 49, cybersecurity: 43, riskFraud: 39, compliance: 21, marketingSales: 47, workforce: 42, rnd: 35 },
  realEstate:        { cx: 42, opsEfficiency: 48, productInnovation: 44, cybersecurity: 44, riskFraud: 37, compliance: 27, marketingSales: 45, workforce: 43, rnd: 35 },
  manufacturing:     { cx: 44, opsEfficiency: 57, productInnovation: 51, cybersecurity: 51, riskFraud: 42, compliance: 29, marketingSales: 44, workforce: 46, rnd: 47 },
  healthcare:        { cx: 43, opsEfficiency: 49, productInnovation: 45, cybersecurity: 43, riskFraud: 36, compliance: 22, marketingSales: 40, workforce: 44, rnd: 42 },
  financialServices: { cx: 47, opsEfficiency: 54, productInnovation: 48, cybersecurity: 47, riskFraud: 44, compliance: 28, marketingSales: 48, workforce: 45, rnd: 41 },
  education:         { cx: 45, opsEfficiency: 48, productInnovation: 49, cybersecurity: 41, riskFraud: 36, compliance: 23, marketingSales: 40, workforce: 44, rnd: 45 },
  construction:      { cx: 44, opsEfficiency: 50, productInnovation: 49, cybersecurity: 48, riskFraud: 39, compliance: 29, marketingSales: 40, workforce: 45, rnd: 39 },
  businessServices:  { cx: 42, opsEfficiency: 51, productInnovation: 47, cybersecurity: 41, riskFraud: 38, compliance: 23, marketingSales: 43, workforce: 45, rnd: 41 },
  naturalResources:  { cx: 44, opsEfficiency: 53, productInnovation: 53, cybersecurity: 42, riskFraud: 48, compliance: 28, marketingSales: 42, workforce: 43, rnd: 42 },
};

/**
 * DERIVED. Which Cisco column stands in for each of our industries.
 * Insurance and telco are not published separately by Cisco; insurance takes
 * financial services (same regulator, same risk-first posture) and telco takes
 * business services. Logistics takes natural resources — both are asset-heavy
 * operations businesses, and it is the closest published column. Stated here so
 * the substitution is visible rather than buried in a lookup.
 */
export const INDUSTRY_TO_CISCO: Record<Exclude<Industry, "cross">, keyof typeof CISCO_PRIORITY> = {
  banking: "financialServices",
  insurance: "financialServices",
  retail: "retail",
  manufacturing: "manufacturing",
  healthcare: "healthcare",
  telco: "businessServices",
  logistics: "naturalResources",
};

export const CISCO_SUBSTITUTIONS: Partial<Record<Industry, L>> = {
  insurance: {
    es: "Cisco no publica seguros por separado; se usa la columna de servicios financieros.",
    en: "Cisco does not publish insurance separately; the financial services column stands in.",
  },
  telco: {
    es: "Cisco no publica telecomunicaciones por separado; se usa la columna de servicios empresariales.",
    en: "Cisco does not publish telecommunications separately; the business services column stands in.",
  },
  logistics: {
    es: "Cisco no publica logística por separado; se usa recursos naturales, la columna publicada más cercana en intensidad de activos.",
    en: "Cisco does not publish logistics separately; natural resources stands in as the closest published asset-heavy column.",
  },
};

/** DERIVED. Default focus area for a department, overridable per use case. */
export const DEPARTMENT_FOCUS: Record<Department, FocusArea> = {
  finance: "opsEfficiency",
  risk: "riskFraud",
  commercial: "marketingSales",
  marketing: "marketingSales",
  operations: "opsEfficiency",
  supplyChain: "opsEfficiency",
  hr: "workforce",
  service: "cx",
  it: "cybersecurity",
};

/** Mean priority for a focus area across the ten published industries. */
export function focusMean(area: FocusArea): number {
  const cols = Object.values(CISCO_PRIORITY);
  return cols.reduce((sum, c) => sum + c[area], 0) / cols.length;
}

/**
 * How far this industry's appetite for a focus area sits from the cross-industry
 * mean, in impact points. Cisco's spread within a focus area is roughly ±8
 * percentage points, so dividing by 8 keeps the tilt inside ±1 point — enough to
 * re-rank neighbours, never enough to turn a weak case into a strong one.
 * The catalogue's own judgement stays dominant; the survey only breaks ties.
 */
export function impactTilt(industry: Industry, area: FocusArea): number {
  if (industry === "cross") return 0;
  const column = CISCO_PRIORITY[INDUSTRY_TO_CISCO[industry]];
  return (column[area] - focusMean(area)) / 8;
}

/* ------------------------------------------------------ DIFFICULTY RISK */

/**
 * MEASURED failure rates, by the kind of work. These are the published numbers
 * that justify pricing an agent differently from a dashboard — the single most
 * common estimating error in this category.
 */
export const TIER_EVIDENCE = {
  generative: {
    sourceId: "nanda2025",
    stat: { es: "95% de los pilotos de IA generativa no producen retorno medible", en: "95% of generative AI pilots produce no measurable return" },
    /** Difficulty points added on top of the case's own score. */
    penalty: 1.0,
  },
  agentic: {
    sourceId: "gartner2025",
    stat: { es: "Más de 40% de los proyectos de IA agéntica se cancelarán antes de 2028", en: "Over 40% of agentic AI projects will be canceled before 2028" },
    penalty: 1.0,
  },
} as const;

/**
 * DERIVED, anchored on published legacy concentration. Cisco 2025 names
 * "AI Infrastructure Debt" as the successor to technical debt (1992) and
 * digital debt (2010), and reports that only 51% of organizations have their
 * data fully centralized and 34% consider their infrastructure adaptable.
 * The per-industry drag below is our own judgement anchored on how much of each
 * sector's system of record is still legacy — it is NOT a Cisco number, and the
 * anchor is stated so a client can argue with it.
 *
 * Banking and insurance carry the heaviest anchor: COBOL still supports over
 * 40% of online banking systems and 95% of ATM transactions, and 71% of the
 * Fortune 500 run core operations on mainframes.
 */
export const LEGACY_DRAG: Record<Exclude<Industry, "cross">, { points: number; why: L }> = {
  banking: {
    points: 0.8,
    why: {
      es: "Core bancario en mainframe: COBOL sostiene más de 40% de la banca en línea y 95% de las transacciones de cajero. Cada caso tiene que extraer de un sistema que no fue diseñado para entregar datos.",
      en: "Mainframe core banking: COBOL still supports over 40% of online banking and 95% of ATM transactions. Every case has to extract from a system never designed to hand data out.",
    },
  },
  insurance: {
    points: 0.8,
    why: {
      es: "Sistemas de administración de pólizas de décadas, con datos de siniestros en documentos no estructurados.",
      en: "Decades-old policy administration systems, with claims data locked in unstructured documents.",
    },
  },
  healthcare: {
    points: 0.7,
    why: {
      es: "Expedientes clínicos con interoperabilidad limitada y datos de paciente bajo régimen especial de privacidad.",
      en: "Clinical records with limited interoperability and patient data under a special privacy regime.",
    },
  },
  telco: {
    points: 0.5,
    why: {
      es: "OSS/BSS acumulados por fusiones: varios stacks de facturación y red conviviendo.",
      en: "OSS/BSS accumulated through mergers: several billing and network stacks coexisting.",
    },
  },
  manufacturing: {
    points: 0.5,
    why: {
      es: "ERP y MES en sitio, más datos de planta en protocolos industriales que no hablan con la nube sin una capa de traducción.",
      en: "On-premise ERP and MES, plus plant-floor data in industrial protocols that do not reach the cloud without a translation layer.",
    },
  },
  logistics: {
    points: 0.4,
    why: {
      es: "Datos repartidos entre TMS, WMS y los sistemas de terceros que mueven la carga.",
      en: "Data split across TMS, WMS and the third parties that actually move the freight.",
    },
  },
  retail: {
    points: 0.2,
    why: {
      es: "El sector más digitalizado del conjunto: punto de venta y comercio electrónico ya entregan datos limpios.",
      en: "The most digitised sector here: point of sale and e-commerce already hand over clean data.",
    },
  },
};

/** Difficulty added by the industry's own legacy estate. */
export function difficultyDrag(industry: Industry): number {
  return industry === "cross" ? 0 : LEGACY_DRAG[industry].points;
}

/* ------------------------------------------------------- READINESS BARS */

/**
 * MEASURED. Cisco 2025 headline readiness gaps, shown to the client as the
 * reason the plan carries governance, security and change-management lines
 * that a pure engineering estimate would leave out.
 */
export const READINESS_GAPS: { pct: number; label: L; sourceId: string }[] = [
  {
    pct: 13,
    label: { es: "Organizaciones plenamente listas para IA (“Pacesetters”)", en: "Organizations fully ready for AI (“Pacesetters”)" },
    sourceId: "cisco2025",
  },
  {
    pct: 51,
    label: { es: "Tienen sus datos internos centralizados", en: "Have their in-house data fully centralized" },
    sourceId: "cisco2025",
  },
  {
    pct: 34,
    label: { es: "Consideran su infraestructura adaptable y escalable para IA", en: "Consider their infrastructure adaptable and scalable for AI" },
    sourceId: "cisco2025",
  },
  {
    pct: 32,
    label: { es: "Tienen un proceso para medir el impacto de sus inversiones en IA", en: "Have a process to measure the impact of their AI investments" },
    sourceId: "cisco2025",
  },
  {
    pct: 31,
    label: { es: "Se sienten capaces de asegurar sistemas de IA agéntica", en: "Feel fully capable of securing agentic AI systems" },
    sourceId: "cisco2025",
  },
];
