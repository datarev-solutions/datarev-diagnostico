import type { L } from "./framework";

/** Copy for the feasibility + multi-jurisdiction compliance tool. */
export const GOV = {
  badge: { es: "Herramienta de diagnóstico", en: "Interactive diagnostic tool" },
  title: {
    es: "Viabilidad agéntica y riesgo regulatorio multijurisdiccional",
    en: "Agentic feasibility & multi-jurisdiction regulatory risk",
  },
  lead: {
    es: "Evalúa cualquier flujo para madurez agéntica y, por separado, para los regímenes que le aplican según dónde opera y qué datos toca.",
    en: "Test any workflow for agentic readiness and, separately, for the regimes that apply to it based on where it operates and what data it touches.",
  },

  // Panel 1 — feasibility
  feasibilityTitle: { es: "1. Viabilidad del flujo agéntico", en: "1. Agentic workflow feasibility" },
  determinism: { es: "Determinismo del proceso", en: "Process determinism" },
  detRule: { es: "Determinista", en: "Deterministic" },
  detSemi: { es: "Semiestructurado", en: "Semi-structured" },
  detUnstructured: { es: "No estructurado", en: "Unstructured" },
  apiMaturity: { es: "Conectividad de APIs", en: "API & tool connectivity" },
  apiNone: { es: "Sin APIs", en: "No APIs" },
  apiPartial: { es: "REST parcial", en: "Partial REST" },
  apiFull: { es: "OpenAPI / Swagger", en: "OpenAPI / Swagger" },
  dataFoundation: { es: "Base de datos", en: "Data foundation" },
  dataSql: { es: "SQL limpio", en: "Clean SQL" },
  dataJson: { es: "Semi-JSON", en: "Semi-JSON" },
  dataRaw: { es: "Sin estructurar", en: "Raw unstructured" },
  errorTolerance: { es: "Tolerancia al error", en: "Error tolerance" },
  errZero: { es: "Cero tolerancia", en: "Zero tolerance" },
  errModerate: { es: "Moderada", en: "Moderate" },
  errHigh: { es: "Alta / creativa", en: "High / creative" },
  readinessModel: { es: "Modelo de adopción", en: "Readiness model" },
  riskWarnings: { es: "Advertencias operativas", en: "Operational risk warnings" },
  prerequisites: { es: "Prerrequisitos técnicos", en: "Technical prerequisites" },

  // Panel 2 — compliance
  complianceTitle: { es: "2. Regímenes regulatorios aplicables", en: "2. Applicable regulatory regimes" },
  jurisdictions: { es: "Jurisdicciones donde opera", en: "Jurisdictions of operation" },
  jurisdictionsHint: {
    es: "Selecciona todas las que apliquen. Cada una trae su propio régimen.",
    en: "Select every one that applies. Each brings its own regime.",
  },
  dataCategory: { es: "Categoría de datos tratados", en: "Category of data processed" },
  dataCategoryHint: {
    es: "Esto decide qué leyes de privacidad entran, con independencia de qué tan riesgosa sea la IA.",
    en: "This decides which privacy laws engage, regardless of how risky the AI itself is.",
  },
  domain: { es: "Dominio de despliegue", en: "Deployment domain" },
  autonomous: { es: "Decisión autónoma", en: "Autonomous decisioning" },
  autonomousHint: {
    es: "El sistema actúa sin revisión humana con capacidad de anular",
    en: "System acts without human override review",
  },
  exposure: { es: "Exposición del usuario final", en: "Target user exposure" },
  exposureInternal: { es: "Sólo personal interno", en: "Internal staff only" },
  exposurePublic: { es: "Público consumidor", en: "Public consumer" },

  // Results
  noJurisdiction: {
    es: "Selecciona al menos una jurisdicción para ver los regímenes aplicables.",
    en: "Select at least one jurisdiction to see the applicable regimes.",
  },
  obligationsLabel: { es: "Obligaciones", en: "Obligations" },
  timingLabel: { es: "Vigencia", en: "Timing" },
  authorityLabel: { es: "Autoridad", en: "Supervisory authority" },
  regimesApplying: { es: "Regímenes aplicables", en: "Regimes in scope" },

  notLegalAdvice: {
    es: "Esta herramienta es un diagnóstico orientativo, no asesoría legal. Las obligaciones concretas dependen de hechos que un cuestionario no captura. Valida cualquier decisión con tu área jurídica antes de actuar.",
    en: "This tool is an indicative diagnostic, not legal advice. Actual obligations turn on facts a questionnaire cannot capture. Validate any decision with your legal counsel before acting.",
  },
} satisfies Record<string, L>;
