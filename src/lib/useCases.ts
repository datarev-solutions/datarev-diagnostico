import type { MigrationRole } from "./cloudPricing";
import type { L } from "./framework";

/**
 * Use-case catalogue.
 *
 * Structure follows DataRev's own methodology, taken from the
 * `Priorizacion_casos_de_uso` workbook rather than invented here:
 *
 *   Proceso → Actividad → Caso de uso → KBQ → Métrica/KPI → Dificultad × Impacto
 *
 * The KBQ (Key Business Question) is the field that makes this a consulting
 * artefact instead of a feature list: a use case that cannot be phrased as a
 * decision someone is trying to make does not belong in a roadmap.
 *
 * Difficulty and impact are scored 1-10 on the same scale the workbook uses,
 * which is what the prioritisation matrix plots.
 *
 * WHAT IS ESTIMATED HERE: the per-role day counts. They are DataRev
 * assumptions calibrated to industry norms, not measurements — the same
 * status as the workload conversion factors in the cost model. Replace them
 * with real delivery data as DataRev accumulates it.
 */

export type ProcessType = "h2r" | "customer" | "product" | "finance" | "operations";

/**
 * Analytics maturity ladder. Also the rough order in which an organisation
 * can realistically attempt these — prescriptive and generative work on top
 * of descriptive foundations, not instead of them.
 */
export type AnalyticsTier =
  | "descriptive"
  | "diagnostic"
  | "predictive"
  | "prescriptive"
  | "generative";

/** Platform capabilities a use case requires. Drives the tech footprint. */
export type TechComponent =
  | "ingestion"
  | "warehouse"
  | "semantic"
  | "bi"
  | "orchestration"
  | "governance"
  | "streaming"
  | "ml"
  | "mlops"
  | "llm"
  | "vectordb"
  | "agent";

export interface UseCase {
  id: string;
  process: ProcessType;
  activity: L;
  name: L;
  /** The decision this exists to inform. DataRev's KBQ field. */
  kbq: L;
  tier: AnalyticsTier;
  /** 1-10, business value. */
  impact: number;
  /** 1-10, effort and technical risk. */
  difficulty: number;
  kpi: L;
  tech: TechComponent[];
  /** Delivery effort in days, by role. */
  effort: Partial<Record<MigrationRole, number>>;
}

export const PROCESS_LABEL: Record<ProcessType, L> = {
  h2r: {
    es: "Ciclo del empleado (Hire to Retire)",
    en: "Employee lifecycle (Hire to Retire)",
  },
  customer: { es: "Ciclo del cliente", en: "Customer lifecycle" },
  product: { es: "Ciclo de producto y servicio", en: "Product and service lifecycle" },
  finance: { es: "Finanzas", en: "Finance" },
  operations: { es: "Operaciones y cadena", en: "Operations and supply chain" },
};

export const TIER_LABEL: Record<AnalyticsTier, L> = {
  descriptive: { es: "Descriptivo", en: "Descriptive" },
  diagnostic: { es: "Diagnóstico", en: "Diagnostic" },
  predictive: { es: "Predictivo", en: "Predictive" },
  prescriptive: { es: "Prescriptivo", en: "Prescriptive" },
  generative: { es: "Generativo / Agentes", en: "Generative / Agents" },
};

export const TECH_LABEL: Record<TechComponent, L> = {
  ingestion: { es: "Ingesta y conectores", en: "Ingestion and connectors" },
  warehouse: { es: "Warehouse / Lakehouse", en: "Warehouse / Lakehouse" },
  semantic: { es: "Capa semántica y modelado", en: "Semantic layer and modelling" },
  bi: { es: "Visualización (BI)", en: "Visualisation (BI)" },
  orchestration: { es: "Orquestación", en: "Orchestration" },
  governance: { es: "Gobierno y calidad", en: "Governance and quality" },
  streaming: { es: "Streaming / tiempo real", en: "Streaming / real time" },
  ml: { es: "Machine Learning", en: "Machine Learning" },
  mlops: { es: "MLOps y monitoreo", en: "MLOps and monitoring" },
  llm: { es: "LLM / GenAI", en: "LLM / GenAI" },
  vectordb: { es: "Base vectorial (RAG)", en: "Vector store (RAG)" },
  agent: { es: "Orquestación de agentes", en: "Agent orchestration" },
};

/**
 * The catalogue. Kept deliberately at the level a client recognises —
 * "rotación de personal", not "gradient boosting classifier" — because the
 * point is for a business owner to pick their own problems off the list.
 */
export const USE_CASES: UseCase[] = [
  /* ------------------------------------------------ employee lifecycle */
  {
    id: "h2r-turnover",
    process: "h2r",
    activity: { es: "Retención", en: "Retention" },
    name: { es: "Predicción de rotación de personal", en: "Employee turnover prediction" },
    kbq: {
      es: "¿Qué empleados están en riesgo de irse en los próximos 6 meses, y qué los retiene?",
      en: "Which employees are at risk of leaving in the next 6 months, and what retains them?",
    },
    tier: "predictive",
    impact: 7,
    difficulty: 6,
    kpi: { es: "Rotación voluntaria / costo de reemplazo", en: "Voluntary turnover / cost to replace" },
    tech: ["ingestion", "warehouse", "semantic", "ml", "mlops", "bi"],
    effort: { architect: 2, engineer: 8, mlEngineer: 15, analyst: 4 },
  },
  {
    id: "h2r-headcount",
    process: "h2r",
    activity: { es: "Planeación de plantilla", en: "Workforce planning" },
    name: { es: "Tablero de plantilla y costo laboral", en: "Headcount and labour cost dashboard" },
    kbq: {
      es: "¿Cuánta gente tenemos, dónde, y cuánto cuesta contra el presupuesto?",
      en: "How many people do we have, where, and what do they cost against budget?",
    },
    tier: "descriptive",
    impact: 6,
    difficulty: 3,
    kpi: { es: "Headcount vs presupuesto · RPE", en: "Headcount vs budget · revenue per employee" },
    tech: ["ingestion", "warehouse", "semantic", "bi"],
    effort: { engineer: 5, analyst: 8 },
  },
  {
    id: "h2r-recruiting",
    process: "h2r",
    activity: { es: "Reclutamiento y selección", en: "Recruitment and selection" },
    name: { es: "Embudo de reclutamiento y tiempos de contratación", en: "Recruiting funnel and time-to-hire" },
    kbq: {
      es: "¿Qué etapa del proceso alarga más la contratación y cuánto nos cuesta?",
      en: "Which stage stretches hiring the most, and what does it cost us?",
    },
    tier: "diagnostic",
    impact: 5,
    difficulty: 3,
    kpi: { es: "Time-to-hire · costo por contratación", en: "Time-to-hire · cost per hire" },
    tech: ["ingestion", "warehouse", "semantic", "bi"],
    effort: { engineer: 4, analyst: 7 },
  },

  /* -------------------------------------------------- customer lifecycle */
  {
    id: "cust-churn",
    process: "customer",
    activity: { es: "Retención y lealtad", en: "Retention and loyalty" },
    name: { es: "Predicción de abandono de clientes (churn)", en: "Customer churn prediction" },
    kbq: {
      es: "¿Qué clientes vamos a perder este trimestre y cuál intervención los retiene?",
      en: "Which customers will we lose this quarter, and which intervention keeps them?",
    },
    tier: "predictive",
    impact: 9,
    difficulty: 6,
    kpi: { es: "Tasa de churn · valor de vida del cliente", en: "Churn rate · customer lifetime value" },
    tech: ["ingestion", "warehouse", "semantic", "ml", "mlops", "bi"],
    effort: { architect: 2, engineer: 8, mlEngineer: 15, analyst: 4 },
  },
  {
    id: "cust-segmentation",
    process: "customer",
    activity: { es: "Adquisición", en: "Acquisition" },
    name: { es: "Segmentación avanzada de clientes", en: "Advanced customer segmentation" },
    kbq: {
      es: "¿Qué grupos de clientes existen realmente y cómo le hablamos distinto a cada uno?",
      en: "Which customer groups actually exist, and how do we speak to each differently?",
    },
    tier: "diagnostic",
    impact: 7,
    difficulty: 5,
    kpi: { es: "Conversión por segmento · ticket promedio", en: "Conversion per segment · average order value" },
    tech: ["ingestion", "warehouse", "semantic", "ml", "bi"],
    effort: { engineer: 6, mlEngineer: 10, analyst: 5 },
  },
  {
    id: "cust-funnel",
    process: "customer",
    activity: { es: "Gestión comercial", en: "Sales management" },
    name: { es: "Embudo comercial y fugas de conversión", en: "Sales funnel and conversion leakage" },
    kbq: {
      es: "¿Dónde se cae el pipeline por vendedor, zona y canal?",
      en: "Where does the pipeline leak, by rep, region and channel?",
    },
    tier: "diagnostic",
    impact: 8,
    difficulty: 3,
    kpi: { es: "Tasa de conversión por etapa · velocidad de pipeline", en: "Stage conversion rate · pipeline velocity" },
    tech: ["ingestion", "warehouse", "semantic", "bi"],
    effort: { engineer: 5, analyst: 8 },
  },
  {
    id: "cust-nba",
    process: "customer",
    activity: { es: "Venta cruzada", en: "Cross-sell" },
    name: { es: "Siguiente mejor oferta (recomendación)", en: "Next best offer (recommendation)" },
    kbq: {
      es: "¿Qué producto le ofrecemos a cada cliente, y cuándo?",
      en: "Which product do we offer each customer, and when?",
    },
    tier: "prescriptive",
    impact: 8,
    difficulty: 8,
    kpi: { es: "Venta cruzada · ingreso incremental", en: "Cross-sell rate · incremental revenue" },
    tech: ["ingestion", "warehouse", "semantic", "ml", "mlops", "streaming"],
    effort: { architect: 3, engineer: 12, mlEngineer: 20, analyst: 4 },
  },
  {
    id: "cust-support-agent",
    process: "customer",
    activity: { es: "Servicio y soporte", en: "Service and support" },
    name: { es: "Agente de soporte sobre base de conocimiento (RAG)", en: "Support agent over knowledge base (RAG)" },
    kbq: {
      es: "¿Podemos resolver la mayoría de las consultas sin escalar a un humano?",
      en: "Can we resolve most enquiries without escalating to a human?",
    },
    tier: "generative",
    impact: 8,
    difficulty: 6,
    kpi: { es: "Tasa de resolución automática · costo por ticket", en: "Self-service resolution rate · cost per ticket" },
    tech: ["ingestion", "governance", "llm", "vectordb", "agent"],
    effort: { architect: 2, engineer: 5, mlEngineer: 12, fde: 8 },
  },
  {
    id: "cust-sentiment",
    process: "customer",
    activity: { es: "Voz del cliente", en: "Voice of customer" },
    name: { es: "Análisis de sentimiento y temas en comentarios", en: "Sentiment and topic analysis on feedback" },
    kbq: {
      es: "¿De qué se queja realmente el cliente, y eso qué tanto pesa en el churn?",
      en: "What do customers actually complain about, and how much does it drive churn?",
    },
    tier: "predictive",
    impact: 6,
    difficulty: 4,
    kpi: { es: "NPS · temas recurrentes", en: "NPS · recurring themes" },
    tech: ["ingestion", "warehouse", "llm", "bi"],
    effort: { engineer: 4, mlEngineer: 8, analyst: 3 },
  },

  /* ------------------------------------------------------- product */
  {
    id: "prod-demand",
    process: "product",
    activity: { es: "Planeación de demanda", en: "Demand planning" },
    name: { es: "Pronóstico de demanda", en: "Demand forecasting" },
    kbq: {
      es: "¿Cuánto vamos a vender de cada SKU, por punto de venta y semana?",
      en: "How much of each SKU will we sell, by location and week?",
    },
    tier: "predictive",
    impact: 9,
    difficulty: 7,
    kpi: { es: "Error de pronóstico (MAPE) · quiebres de stock", en: "Forecast error (MAPE) · stockouts" },
    tech: ["ingestion", "warehouse", "semantic", "ml", "mlops", "bi"],
    effort: { architect: 3, engineer: 10, mlEngineer: 18, analyst: 4 },
  },
  {
    id: "prod-pricing",
    process: "product",
    activity: { es: "Precios", en: "Pricing" },
    name: { es: "Optimización de precios y elasticidad", en: "Price optimisation and elasticity" },
    kbq: {
      es: "¿Cuánto podemos mover el precio sin perder volumen, por producto y canal?",
      en: "How far can we move price without losing volume, by product and channel?",
    },
    tier: "prescriptive",
    impact: 9,
    difficulty: 8,
    kpi: { es: "Margen bruto · elasticidad precio-demanda", en: "Gross margin · price elasticity" },
    tech: ["ingestion", "warehouse", "semantic", "ml", "mlops"],
    effort: { architect: 3, engineer: 10, mlEngineer: 20, analyst: 5 },
  },
  {
    id: "prod-assortment",
    process: "product",
    activity: { es: "Surtido (CATMAN)", en: "Assortment (CATMAN)" },
    name: { es: "Optimización de surtido por punto de venta", en: "Assortment optimisation per location" },
    kbq: {
      es: "¿Qué productos deben estar en cada tienda para maximizar rotación?",
      en: "Which products belong in each store to maximise turnover?",
    },
    tier: "prescriptive",
    impact: 8,
    difficulty: 7,
    kpi: { es: "Rotación por m² · participación de mercado", en: "Turnover per m² · market share" },
    tech: ["ingestion", "warehouse", "semantic", "ml", "bi"],
    effort: { architect: 2, engineer: 9, mlEngineer: 15, analyst: 5 },
  },

  /* ------------------------------------------------------- finance */
  {
    id: "fin-cockpit",
    process: "finance",
    activity: { es: "Vista ejecutiva", en: "Executive view" },
    name: { es: "Control de mando directivo (KPIs unificados)", en: "Executive cockpit (unified KPIs)" },
    kbq: {
      es: "¿Cuál es el número bueno, y por qué cada área trae uno distinto?",
      en: "Which number is the right one, and why does each area bring a different one?",
    },
    tier: "descriptive",
    impact: 9,
    difficulty: 4,
    kpi: { es: "Una sola versión de la verdad · tiempo a decisión", en: "Single source of truth · time to decision" },
    tech: ["ingestion", "warehouse", "semantic", "governance", "bi"],
    effort: { architect: 3, engineer: 8, analyst: 10 },
  },
  {
    id: "fin-cashflow",
    process: "finance",
    activity: { es: "Tesorería", en: "Treasury" },
    name: { es: "Visibilidad y pronóstico de flujo de efectivo", en: "Cash-flow visibility and forecast" },
    kbq: {
      es: "¿Cuánto efectivo vamos a tener en 13 semanas y qué lo pone en riesgo?",
      en: "How much cash will we have in 13 weeks, and what puts it at risk?",
    },
    tier: "predictive",
    impact: 9,
    difficulty: 6,
    kpi: { es: "Exactitud del pronóstico · días de cobranza (DSO)", en: "Forecast accuracy · days sales outstanding" },
    tech: ["ingestion", "warehouse", "semantic", "ml", "bi"],
    effort: { architect: 2, engineer: 8, mlEngineer: 10, analyst: 6 },
  },
  {
    id: "fin-budget",
    process: "finance",
    activity: { es: "Presupuesto", en: "Budgeting" },
    name: { es: "Presupuesto contra real y desviaciones", en: "Budget vs actual and variance" },
    kbq: {
      es: "¿Dónde nos desviamos del presupuesto y quién es responsable?",
      en: "Where are we off budget, and who owns it?",
    },
    tier: "descriptive",
    impact: 7,
    difficulty: 3,
    kpi: { es: "Desviación presupuestal · tiempo de cierre", en: "Budget variance · close cycle time" },
    tech: ["ingestion", "warehouse", "semantic", "bi"],
    effort: { engineer: 5, analyst: 8 },
  },
  {
    id: "fin-fraud",
    process: "finance",
    activity: { es: "Riesgo y control", en: "Risk and control" },
    name: { es: "Detección de anomalías y fraude", en: "Anomaly and fraud detection" },
    kbq: {
      es: "¿Qué transacciones se salen del patrón y ameritan revisión hoy?",
      en: "Which transactions fall outside the pattern and need review today?",
    },
    tier: "predictive",
    impact: 8,
    difficulty: 7,
    kpi: { es: "Fraude detectado · falsos positivos", en: "Fraud caught · false positive rate" },
    tech: ["ingestion", "warehouse", "streaming", "ml", "mlops", "governance"],
    effort: { architect: 3, engineer: 12, mlEngineer: 18, analyst: 3 },
  },

  /* ---------------------------------------------------- operations */
  {
    id: "ops-inventory",
    process: "operations",
    activity: { es: "Inventarios", en: "Inventory" },
    name: { es: "Optimización de inventario y cobertura", en: "Inventory and coverage optimisation" },
    kbq: {
      es: "¿Cuánto inventario sobra y dónde nos vamos a quedar cortos?",
      en: "Where is inventory sitting idle, and where will we run short?",
    },
    tier: "prescriptive",
    impact: 8,
    difficulty: 6,
    kpi: { es: "Días de cobertura · capital de trabajo inmovilizado", en: "Days of cover · working capital tied up" },
    tech: ["ingestion", "warehouse", "semantic", "ml", "bi"],
    effort: { architect: 2, engineer: 9, mlEngineer: 12, analyst: 5 },
  },
  {
    id: "ops-routing",
    process: "operations",
    activity: { es: "Logística", en: "Logistics" },
    name: { es: "Optimización de rutas y tiempos de entrega", en: "Route and delivery-time optimisation" },
    kbq: {
      es: "¿Cuál es la ruta que baja costo sin romper la promesa de entrega?",
      en: "Which route cuts cost without breaking the delivery promise?",
    },
    tier: "prescriptive",
    impact: 8,
    difficulty: 8,
    kpi: { es: "Costo por entrega · entregas a tiempo", en: "Cost per delivery · on-time delivery" },
    tech: ["ingestion", "warehouse", "streaming", "ml", "mlops"],
    effort: { architect: 3, engineer: 12, mlEngineer: 20, analyst: 3 },
  },
  {
    id: "ops-alerts",
    process: "operations",
    activity: { es: "Monitoreo", en: "Monitoring" },
    name: { es: "Alertas operativas proactivas", en: "Proactive operational alerts" },
    kbq: {
      es: "¿Cómo se entera el responsable correcto antes de que el problema escale?",
      en: "How does the right owner find out before the problem escalates?",
    },
    tier: "diagnostic",
    impact: 7,
    difficulty: 4,
    kpi: { es: "Tiempo de detección · incidentes evitados", en: "Time to detect · incidents avoided" },
    tech: ["ingestion", "warehouse", "streaming", "orchestration", "governance"],
    effort: { engineer: 8, analyst: 4 },
  },
  {
    id: "ops-copilot",
    process: "operations",
    activity: { es: "Autoservicio", en: "Self-service" },
    name: { es: "Copiloto de datos en lenguaje natural", en: "Natural-language data copilot" },
    kbq: {
      es: "¿Puede un directivo preguntarle a los datos sin depender de un analista?",
      en: "Can an executive query the data without going through an analyst?",
    },
    tier: "generative",
    impact: 7,
    difficulty: 7,
    kpi: { es: "Consultas autoservicio · carga sobre el equipo de datos", en: "Self-service queries · load on the data team" },
    tech: ["warehouse", "semantic", "governance", "llm", "agent"],
    effort: { architect: 3, engineer: 6, mlEngineer: 12, fde: 6 },
  },
  {
    id: "ops-docs",
    process: "operations",
    activity: { es: "Automatización documental", en: "Document automation" },
    name: { es: "Extracción y clasificación de documentos", en: "Document extraction and classification" },
    kbq: {
      es: "¿Cuántas horas se van en capturar a mano lo que un modelo puede leer?",
      en: "How many hours go into keying in by hand what a model could read?",
    },
    tier: "generative",
    impact: 7,
    difficulty: 5,
    kpi: { es: "Horas de captura ahorradas · exactitud de extracción", en: "Data-entry hours saved · extraction accuracy" },
    tech: ["ingestion", "governance", "llm", "vectordb"],
    effort: { engineer: 5, mlEngineer: 10, fde: 4 },
  },
];

/* ------------------------------------------------------------ rollups */

export interface UseCaseRollup {
  /** Total delivery days per role across the selected use cases. */
  roleDays: Partial<Record<MigrationRole, number>>;
  totalDays: number;
  /** Every platform capability at least one selected use case needs. */
  tech: TechComponent[];
  /** Average impact and difficulty of the selection. */
  avgImpact: number;
  avgDifficulty: number;
}

export function rollUpUseCases(selected: UseCase[]): UseCaseRollup {
  const roleDays: Partial<Record<MigrationRole, number>> = {};
  const tech = new Set<TechComponent>();

  for (const uc of selected) {
    for (const [role, days] of Object.entries(uc.effort)) {
      const key = role as MigrationRole;
      roleDays[key] = (roleDays[key] ?? 0) + days;
    }
    for (const c of uc.tech) tech.add(c);
  }

  const totalDays = Object.values(roleDays).reduce((a, d) => a + d, 0);
  const n = selected.length || 1;

  // Preserve TECH_LABEL's declaration order so the footprint always reads
  // in pipeline order (ingest → warehouse → … → agent), never selection order.
  const ordered = (Object.keys(TECH_LABEL) as TechComponent[]).filter((c) => tech.has(c));

  return {
    roleDays,
    totalDays: Math.round(totalDays * 10) / 10,
    tech: ordered,
    avgImpact: Math.round((selected.reduce((a, u) => a + u.impact, 0) / n) * 10) / 10,
    avgDifficulty: Math.round((selected.reduce((a, u) => a + u.difficulty, 0) / n) * 10) / 10,
  };
}

/**
 * Convert role-days into a team you could actually hire, given a delivery
 * window. Rounds UP to whole people: half a data engineer cannot show up on
 * Monday, and a plan that implies one is a plan that slips.
 */
export function teamComposition(
  roleDays: Partial<Record<MigrationRole, number>>,
  months: number,
  workingDaysPerMonth = 20,
): { role: MigrationRole; fte: number; days: number }[] {
  const capacity = Math.max(1, months * workingDaysPerMonth);
  return (Object.entries(roleDays) as [MigrationRole, number][])
    .filter(([, days]) => days > 0)
    .map(([role, days]) => ({
      role,
      days: Math.round(days * 10) / 10,
      fte: Math.max(1, Math.ceil(days / capacity)),
    }))
    .sort((a, b) => b.days - a.days);
}

/**
 * Quadrant for the prioritisation matrix, on DataRev's 1-10 scales.
 * The midpoint is 5.5 so no use case can land exactly on a boundary.
 */
export function quadrantOf(uc: UseCase): "quickWin" | "bigBet" | "fillIn" | "avoid" {
  const highImpact = uc.impact >= 5.5;
  const lowDifficulty = uc.difficulty < 5.5;
  if (highImpact && lowDifficulty) return "quickWin";
  if (highImpact) return "bigBet";
  if (lowDifficulty) return "fillIn";
  return "avoid";
}
