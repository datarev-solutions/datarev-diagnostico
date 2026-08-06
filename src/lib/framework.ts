/**
 * Composite AI + Data maturity framework.
 *
 * Synthesised from:
 *  - MIT CISR Enterprise AI Maturity Model (4 stages, n=721)
 *  - Gartner AI Maturity Model (5 levels)
 *  - NIST AI RMF (Govern / Map / Measure / Manage)
 *  - CMMI-DMM style 8x5 capability grid
 *  - ISO/IEC 42001 + EU AI Act risk-classification practice
 */

export type Locale = "es" | "en";

/** A bilingual string. Co-locating both locales makes desync structurally impossible. */
export type L = { es: string; en: string };

export type Level = 1 | 2 | 3 | 4 | 5;

export const LEVEL_VALUES: Level[] = [1, 2, 3, 4, 5];

export type DimensionId =
  | "strategy"
  | "governance"
  | "data"
  | "technology"
  | "talent"
  | "culture"
  | "operating"
  | "measurement";

export interface LevelDef {
  level: Level;
  name: L;
  summary: L;
}

export interface Dimension {
  id: DimensionId;
  /** Portfolio weight, sums to 1 across all dimensions. */
  weight: number;
  name: L;
  short: L;
  description: L;
  /** Grid cell text for each maturity level — the CMMI-style descriptors. */
  descriptors: Record<Level, L>;
  /** Heroicons-style outline path, drawn on a 24x24 viewBox. */
  iconPath: string;
}

export const LEVELS: LevelDef[] = [
  {
    level: 1,
    name: { es: "Inicial", en: "Initial" },
    summary: {
      es: "Esfuerzos aislados y reactivos. El resultado depende de personas concretas, no de la organización.",
      en: "Isolated, reactive efforts. Outcomes depend on specific individuals, not on the organisation.",
    },
  },
  {
    level: 2,
    name: { es: "Repetible", en: "Repeatable" },
    summary: {
      es: "Buenas prácticas locales que se repiten en algunos equipos, pero sin consistencia ni alcance empresarial.",
      en: "Local good practice repeated by some teams, but without consistency or enterprise reach.",
    },
  },
  {
    level: 3,
    name: { es: "Definido", en: "Defined" },
    summary: {
      es: "Políticas, roles y procesos definidos y comunicados a nivel empresa. La capacidad ya no depende del equipo.",
      en: "Policies, roles and processes defined and communicated enterprise-wide. Capability no longer depends on the team.",
    },
  },
  {
    level: 4,
    name: { es: "Gestionado", en: "Managed" },
    summary: {
      es: "Todo se mide y se liga a objetivos de negocio y a análisis de riesgo. Se gestiona con datos, no con opiniones.",
      en: "Everything is measured and tied to business objectives and risk analysis. Managed with data, not opinions.",
    },
  },
  {
    level: 5,
    name: { es: "Optimizado", en: "Optimized" },
    summary: {
      es: "Ciclo de mejora continua con retroalimentación y anticipación. La IA reconfigura el modelo de negocio.",
      en: "Continuous improvement loop with feedback and feed-forward. AI reshapes the business model.",
    },
  },
];

export const DIMENSIONS: Dimension[] = [
  {
    id: "strategy",
    weight: 0.15,
    name: { es: "Estrategia y Valor", en: "Strategy & Value" },
    short: { es: "Estrategia", en: "Strategy" },
    description: {
      es: "Existencia, claridad y financiamiento de una estrategia de IA alineada a los objetivos del negocio.",
      en: "Existence, clarity and funding of an AI strategy aligned to business objectives.",
    },
    descriptors: {
      1: {
        es: "Sin estrategia de IA. Experimentos aislados por curiosidad individual.",
        en: "No AI strategy. Isolated experiments driven by individual curiosity.",
      },
      2: {
        es: "Ambiciones de IA documentadas en algunas áreas, sin priorización empresarial.",
        en: "AI ambitions documented in some units, with no enterprise prioritisation.",
      },
      3: {
        es: "Estrategia de IA definida, aprobada y comunicada a nivel empresa.",
        en: "AI strategy defined, approved and communicated at enterprise level.",
      },
      4: {
        es: "Estrategia ligada a objetivos de negocio con portafolio financiado y revisado.",
        en: "Strategy tied to business objectives with a funded, reviewed portfolio.",
      },
      5: {
        es: "Estrategia replanificada de forma continua. La IA redefine el modelo de negocio.",
        en: "Strategy continuously re-planned. AI redefines the business model.",
      },
    },
    iconPath:
      "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75M15 9.75v3",
  },
  {
    id: "governance",
    weight: 0.15,
    name: {
      es: "Gobierno, Riesgo y Cumplimiento",
      en: "Governance, Risk & Compliance",
    },
    short: { es: "Gobierno", en: "Governance" },
    description: {
      es: "Políticas, inventario de sistemas de IA, clasificación de riesgo y controles auditables (NIST AI RMF, ISO 42001, EU AI Act).",
      en: "Policies, AI system inventory, risk classification and auditable controls (NIST AI RMF, ISO 42001, EU AI Act).",
    },
    descriptors: {
      1: {
        es: "Sin política de IA. El riesgo se atiende de forma reactiva, caso por caso.",
        en: "No AI policy. Risk handled reactively, case by case.",
      },
      2: {
        es: "Lineamientos locales. Algunos equipos revisan riesgo de manera informal.",
        en: "Local guidelines. Some teams review risk informally.",
      },
      3: {
        es: "Política de IA, inventario de sistemas y comité de revisión a nivel empresa.",
        en: "Enterprise AI policy, system inventory and review committee in place.",
      },
      4: {
        es: "Riesgo clasificado por caso de uso y controles auditados con evidencia.",
        en: "Risk classified per use case, with controls audited against evidence.",
      },
      5: {
        es: "Gobierno automatizado con monitoreo continuo que retroalimenta la política.",
        en: "Automated governance with continuous monitoring feeding back into policy.",
      },
    },
    iconPath:
      "M12 3l8.25 4.5v3H3.75v-3L12 3zM5.25 10.5v7.5m4.5-7.5v7.5m4.5-7.5v7.5m4.5-7.5v7.5M3 21h18",
  },
  {
    id: "data",
    weight: 0.18,
    name: { es: "Fundamento de Datos", en: "Data Foundation" },
    short: { es: "Datos", en: "Data" },
    description: {
      es: "Disponibilidad, calidad, linaje, catálogo y accesibilidad de los datos que alimentan la IA. Es el cuello de botella más frecuente.",
      en: "Availability, quality, lineage, cataloguing and accessibility of the data feeding AI. The most frequent bottleneck.",
    },
    descriptors: {
      1: {
        es: "Datos en silos. Calidad desconocida y acceso sólo por solicitud manual.",
        en: "Data in silos. Quality unknown and access only by manual request.",
      },
      2: {
        es: "Buenas prácticas en algunos proyectos. Catálogo y linaje incompletos.",
        en: "Good practice in some projects. Catalogue and lineage incomplete.",
      },
      3: {
        es: "Catálogo, linaje y estándares de calidad usados a nivel empresa.",
        en: "Catalogue, lineage and quality standards used at enterprise level.",
      },
      4: {
        es: "Calidad y linaje monitoreados con SLAs y alertas por impacto de negocio.",
        en: "Quality and lineage monitored with SLAs and business-impact alerts.",
      },
      5: {
        es: "Productos de datos con corrección automática y mejora continua.",
        en: "Data products with automated remediation and continuous improvement.",
      },
    },
    iconPath:
      "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  },
  {
    id: "technology",
    weight: 0.14,
    name: {
      es: "Tecnología y Arquitectura",
      en: "Technology & Architecture",
    },
    short: { es: "Tecnología", en: "Technology" },
    description: {
      es: "Plataforma, MLOps/LLMOps, ciclo de vida de modelos, evaluación, observabilidad e integración con sistemas core.",
      en: "Platform, MLOps/LLMOps, model lifecycle, evaluation, observability and integration with core systems.",
    },
    descriptors: {
      1: {
        es: "Notebooks y herramientas ad-hoc distintas en cada proyecto.",
        en: "Notebooks and ad-hoc tooling, different in every project.",
      },
      2: {
        es: "Herramientas compartidas en proyectos seleccionados. Despliegue manual.",
        en: "Shared tooling across selected projects. Manual deployment.",
      },
      3: {
        es: "Plataforma MLOps/LLMOps empresarial que cubre todo el ciclo de vida.",
        en: "Enterprise MLOps/LLMOps platform covering the full lifecycle.",
      },
      4: {
        es: "Arquitectura guiada por objetivos de negocio, con análisis de causa raíz y rollback.",
        en: "Architecture driven by business objectives, with root-cause analysis and rollback.",
      },
      5: {
        es: "Plataforma que evoluciona sola: evaluación automatizada y ruteo de modelos.",
        en: "Self-evolving platform: automated evaluation and model routing.",
      },
    },
    iconPath:
      "M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122",
  },
  {
    id: "talent",
    weight: 0.12,
    name: { es: "Talento y Capacidades", en: "Talent & Skills" },
    short: { es: "Talento", en: "Talent" },
    description: {
      es: "Roles definidos, habilidades disponibles, rutas de carrera y capacidad de atraer y retener perfiles de IA y datos.",
      en: "Defined roles, available skills, career paths and the ability to attract and retain AI and data profiles.",
    },
    descriptors: {
      1: {
        es: "Sin roles de IA definidos. Dependencia de entusiastas individuales.",
        en: "No defined AI roles. Dependence on individual enthusiasts.",
      },
      2: {
        es: "Roles definidos localmente y habilidades básicas dispersas.",
        en: "Locally defined roles and scattered basic skills.",
      },
      3: {
        es: "Roles, rutas de carrera y habilidades requeridas definidos a nivel empresa.",
        en: "Roles, career paths and required skills defined at enterprise level.",
      },
      4: {
        es: "Habilidades extendidas a análisis de riesgo y alineadas a objetivos de negocio.",
        en: "Skills extended to risk analysis and aligned with business objectives.",
      },
      5: {
        es: "Motor de talento con reskilling continuo y movilidad interna.",
        en: "Talent engine with continuous reskilling and internal mobility.",
      },
    },
    iconPath:
      "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    id: "culture",
    weight: 0.1,
    name: { es: "Cultura y Adopción", en: "Culture & Adoption" },
    short: { es: "Cultura", en: "Culture" },
    description: {
      es: "Uso real de la IA en el trabajo diario, gestión del cambio, confianza y ausencia de 'shadow AI'.",
      en: "Real use of AI in daily work, change management, trust and the absence of shadow AI.",
    },
    descriptors: {
      1: {
        es: "Escepticismo o temor. El uso de IA ocurre a escondidas ('shadow AI').",
        en: "Scepticism or fear. AI use happens covertly (shadow AI).",
      },
      2: {
        es: "Focos de entusiasmo. La adopción depende del jefe de cada área.",
        en: "Pockets of enthusiasm. Adoption depends on each area's manager.",
      },
      3: {
        es: "Programa de gestión del cambio con formación y lineamientos claros.",
        en: "Change management programme with training and clear guidelines.",
      },
      4: {
        es: "Adopción medida por función, con incentivos alineados al uso responsable.",
        en: "Adoption measured by function, with incentives aligned to responsible use.",
      },
      5: {
        es: "Cultura de test-and-learn: los equipos rediseñan su propio trabajo con IA.",
        en: "Test-and-learn culture: teams redesign their own work with AI.",
      },
    },
    iconPath:
      "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
  },
  {
    id: "operating",
    weight: 0.08,
    name: { es: "Modelo Operativo y Procesos", en: "Operating Model & Process" },
    short: { es: "Procesos", en: "Process" },
    description: {
      es: "Cómo entra, se prioriza, se construye y se opera la demanda de IA. Incluye intake, priorización de casos de uso y soporte en producción.",
      en: "How AI demand is captured, prioritised, built and run. Covers intake, use-case prioritisation and production support.",
    },
    descriptors: {
      1: {
        es: "Respuesta ad-hoc o reactiva a la demanda de IA.",
        en: "Ad-hoc or reactive response to AI demand.",
      },
      2: {
        es: "Existen buenas prácticas pero no se aplican de forma consistente.",
        en: "Good practice exists but is not applied consistently.",
      },
      3: {
        es: "Intake, priorización y entrega estandarizados en toda la empresa.",
        en: "Intake, prioritisation and delivery standardised across the enterprise.",
      },
      4: {
        es: "Los procesos incorporan análisis de impacto y gestión de riesgo.",
        en: "Processes incorporate impact analysis and risk management.",
      },
      5: {
        es: "Procesos con retroalimentación y anticipación para mejora continua.",
        en: "Processes with feedback and feed-forward driving continuous improvement.",
      },
    },
    iconPath:
      "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
  },
  {
    id: "measurement",
    weight: 0.08,
    name: {
      es: "Medición y Realización de Valor",
      en: "Measurement & Value Realization",
    },
    short: { es: "Medición", en: "Measurement" },
    description: {
      es: "Línea base, KPIs, atribución del beneficio y auditoría del valor realmente capturado por la IA.",
      en: "Baseline, KPIs, benefit attribution and audit of the value actually captured from AI.",
    },
    descriptors: {
      1: {
        es: "Sin línea base. El valor de la IA es anecdótico.",
        en: "No baseline. AI value is anecdotal.",
      },
      2: {
        es: "Métricas específicas por proyecto, reutilizadas sólo localmente.",
        en: "Project-specific metrics, reused only locally.",
      },
      3: {
        es: "Marco de métricas y dimensiones definido a nivel empresa.",
        en: "Metrics and dimensions framework defined at enterprise level.",
      },
      4: {
        es: "Métricas ligadas a impacto de negocio y riesgo, publicadas como KPIs.",
        en: "Metrics linked to business impact and risk, published as KPIs.",
      },
      5: {
        es: "La línea base alimenta el ciclo de mejora continua y el valor se audita.",
        en: "The baseline drives the continuous improvement cycle and value is audited.",
      },
    },
    iconPath:
      "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
];

export const DIMENSION_MAP: Record<DimensionId, Dimension> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d]),
) as Record<DimensionId, Dimension>;

/**
 * MIT CISR Enterprise AI Maturity stages, with the observed distribution and
 * financial-performance finding (stages 1-2 below industry average, 3-4 above).
 */
export interface CisrStage {
  stage: 1 | 2 | 3 | 4;
  name: L;
  description: L;
  /** Share of surveyed enterprises, MIT CISR (n=721). */
  share: number;
  /** Financial performance versus industry average. */
  performance: "below" | "above";
}

export const CISR_STAGES: CisrStage[] = [
  {
    stage: 1,
    name: { es: "Experimentar y preparar", en: "Experiment and prepare" },
    description: {
      es: "Alfabetización en IA, políticas iniciales y experimentación con herramientas.",
      en: "AI literacy, initial policies and experimentation with tools.",
    },
    share: 0.28,
    performance: "below",
  },
  {
    stage: 2,
    name: { es: "Pilotos y capacidades", en: "Build pilots and capabilities" },
    description: {
      es: "Pilotos para probar valor, métricas definidas y simplificación de procesos.",
      en: "Pilots to prove value, defined metrics and process simplification.",
    },
    share: 0.34,
    performance: "below",
  },
  {
    stage: 3,
    name: { es: "Industrializar la IA", en: "Industrialize AI" },
    description: {
      es: "Arquitectura escalable, tableros transparentes y cultura de test-and-learn.",
      en: "Scalable architecture, transparent dashboards and a test-and-learn culture.",
    },
    share: 0.31,
    performance: "above",
  },
  {
    stage: 4,
    name: { es: "Lista para el futuro", en: "AI future-ready" },
    description: {
      es: "IA embebida en toda la toma de decisiones y capacidades propias monetizables.",
      en: "AI embedded in all decision making, with proprietary monetisable capabilities.",
    },
    share: 0.07,
    performance: "above",
  },
];

/** Ambition profiles set the default target level across every dimension. */
export type AmbitionId = "follower" | "leader" | "frontier";

export interface Ambition {
  id: AmbitionId;
  targetLevel: Level;
  name: L;
  description: L;
}

export const AMBITIONS: Ambition[] = [
  {
    id: "follower",
    targetLevel: 3,
    name: { es: "Seguidor rápido", en: "Fast follower" },
    description: {
      es: "Alcanzar nivel Definido: políticas, roles y procesos consistentes en toda la empresa.",
      en: "Reach Defined: consistent policies, roles and processes across the enterprise.",
    },
  },
  {
    id: "leader",
    targetLevel: 4,
    name: { es: "Líder de sector", en: "Sector leader" },
    description: {
      es: "Alcanzar nivel Gestionado: todo medido y ligado a impacto de negocio y riesgo.",
      en: "Reach Managed: everything measured and tied to business impact and risk.",
    },
  },
  {
    id: "frontier",
    targetLevel: 5,
    name: { es: "Frontera", en: "Frontier" },
    description: {
      es: "Alcanzar nivel Optimizado: mejora continua y la IA como ventaja competitiva estructural.",
      en: "Reach Optimized: continuous improvement with AI as a structural competitive advantage.",
    },
  },
];

export const AMBITION_MAP: Record<AmbitionId, Ambition> = Object.fromEntries(
  AMBITIONS.map((a) => [a.id, a]),
) as Record<AmbitionId, Ambition>;
