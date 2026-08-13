import type { L } from "./framework";

/** Copy for the cost calculator. Kept apart from UI so neither file sprawls. */
export const CALC = {
  navLabel: { es: "Calculadora", en: "Calculator" },
  title: { es: "Calculadora de costos de proyecto", en: "Project cost calculator" },
  lead: {
    es: "No es sólo la factura de la nube. Un proyecto de datos e IA cuesta tecnología (la plataforma, mes a mes), gente (quién la construye y quién la opera), procesos (gobernanza, capacitación, coordinación) e IA/agentes (diseño, desarrollo y despliegue). Ajusta los supuestos y los cuatro se recalculan al instante.",
    en: "Not just the cloud bill. A data and AI project costs technology (the platform, month to month), people (who builds it and who runs it), process (governance, training, coordination) and AI/agents (design, development and deployment). Adjust the assumptions and all four recalculate instantly.",
  },
  dimTech: { es: "Tecnología", en: "Technology" },
  dimTechHint: { es: "La plataforma, mes a mes", en: "The platform, month to month" },
  dimPeople: { es: "Gente", en: "People" },
  dimPeopleHint: { es: "Quién la construye y quién la opera", en: "Who builds it and who runs it" },
  dimProcess: { es: "Procesos", en: "Process" },
  dimProcessHint: { es: "Gobernanza, capacitación, coordinación", en: "Governance, training, coordination" },
  dimAi: { es: "IA / Agentes", en: "AI / Agents" },
  dimAiHint: { es: "Diseño, desarrollo y despliegue de agentes", en: "Agent design, development and deployment" },

  // Input groups
  inputsTitle: { es: "Tu situación actual", en: "Your current situation" },
  sources: { es: "Fuentes de datos a integrar", en: "Data sources to integrate" },
  sourcesHint: { es: "ERP, CRM, bases operativas, APIs", en: "ERP, CRM, operational databases, APIs" },
  dataGb: { es: "Volumen de datos actual", en: "Current data volume" },
  dataGbHint: { es: "Todo lo que hoy vive en bases y archivos", en: "Everything living in databases and files today" },
  growth: { es: "Crecimiento mensual", en: "Monthly growth" },
  refresh: { es: "Frecuencia de actualización", en: "Refresh frequency" },
  refreshDaily: { es: "Diaria", en: "Daily" },
  refreshHourly: { es: "Cada hora", en: "Hourly" },
  refreshRealtime: { es: "Tiempo real", en: "Real time" },
  queryGb: { es: "Datos consultados al mes", en: "Data queried per month" },
  queryGbHint: {
    es: "Lo que leen los tableros y los analistas. Suele ser varias veces el volumen almacenado.",
    en: "What dashboards and analysts read. Usually several times the stored volume.",
  },

  peopleTitle: { es: "Personas", en: "People" },
  viewers: { es: "Lectores de tableros", en: "Dashboard viewers" },
  analysts: { es: "Analistas", en: "Analysts" },
  creators: { es: "Constructores de BI", en: "BI builders" },
  creatorsHint: {
    es: "Autores/desarrolladores con licencia de edición (QuickSight Author, Power BI Pro creador, Looker Studio editor). No es el equipo que hace la migración — ese va abajo, en Migración.",
    en: "Editing-licence authors/developers (QuickSight Author, Power BI Pro creator, Looker Studio editor). Not the delivery team doing the migration — that is below, under Migration.",
  },
  peopleHint: {
    es: "El número de lectores es el factor que más mueve la comparación. Ahí está la diferencia real entre las plataformas.",
    en: "Viewer count is the single biggest lever in this comparison. That is where the platforms actually diverge.",
  },

  opsTitle: { es: "Operación", en: "Operations" },
  includeOps: { es: "Contar las horas de ingeniería", en: "Count the engineering hours" },
  includeOpsHint: {
    es: "Mantener la plataforma cuesta tiempo de gente. Apagarlo hace ver la opción abierta más barata de lo que es.",
    en: "Keeping a platform running costs people's time. Switching this off makes the open option look cheaper than it is.",
  },
  opsRate: { es: "Costo por hora de ingeniería", en: "Engineering cost per hour" },

  // Results
  resultsTitle: { es: "Costo mensual estimado", en: "Estimated monthly cost" },
  perMonth: { es: "USD / mes", en: "USD / month" },
  today: { es: "Hoy", en: "Today" },
  inTwelve: { es: "A 12 meses", en: "At 12 months" },
  cheapest: { es: "Más económica", en: "Cheapest" },
  platform: { es: "Plataforma", en: "Platform" },
  licenses: { es: "Licencias", en: "Licences" },
  ops: { es: "Operación", en: "Operations" },
  breakdown: { es: "Desglose", en: "Breakdown" },
  showDetail: { es: "Ver desglose completo", en: "See full breakdown" },
  hideDetail: { es: "Ocultar desglose", en: "Hide breakdown" },
  annual: { es: "Anual", en: "Annual" },
  whatToSay: { es: "Qué conviene señalar", en: "Worth pointing out" },

  chartTitle: { es: "Comparativo por capa", en: "Comparison by layer" },
  chartLead: {
    es: "Cada barra suma plataforma, licencias y operación. La proporción entre capas importa más que el total.",
    en: "Each bar sums platform, licences and operations. The proportion between layers matters more than the total.",
  },

  // Caveats
  caveatTitle: { es: "Cómo leer estos números", en: "How to read these numbers" },
  caveat1: {
    es: "Es una estimación de orden de magnitud para orientar una conversación, no una cotización. Un proyecto real se dimensiona midiendo la carga, no estimándola.",
    en: "This is an order-of-magnitude estimate to frame a conversation, not a quote. A real project is sized by measuring the workload, not estimating it.",
  },
  caveat2: {
    es: "No incluye: egreso entre nubes, redes privadas, planes de soporte, compromisos negociados ni migración inicial. Todos mueven la cifra de forma importante.",
    en: "Not included: cross-cloud egress, private networking, support plans, negotiated commitments or the initial migration. All move the number materially.",
  },
  caveat3: {
    es: "Las tarifas se verificaron el {date} en las páginas oficiales de cada proveedor. Cambian seguido: vuelve a verificarlas antes de comprometer una cifra con un cliente.",
    en: "Rates were verified on {date} against each vendor's official pricing page. They change often: re-verify before committing a number to a client.",
  },
  sources_: { es: "Fuentes de las tarifas", en: "Rate sources" },

  provenanceTitle: { es: "De dónde sale cada tarifa", en: "Where each rate comes from" },
  provenanceLead: {
    es: "No todas las cifras tienen el mismo respaldo, y conviene saber cuál es cuál antes de defenderlas frente a un cliente.",
    en: "Not every figure carries the same weight, and it is worth knowing which is which before defending them to a client.",
  },
  provOfficial: { es: "Oficial", en: "Official" },
  provDerived: { es: "Derivada", en: "Derived" },
  provSecondary: { es: "Secundaria", en: "Secondary" },
  provEstimate: { es: "Supuesto", en: "Assumption" },

  // Portable engines
  enginesTitle: { es: "Motores portables: Snowflake y Databricks", en: "Portable engines: Snowflake and Databricks" },
  enginesLead: {
    es: "Ninguno de los dos es una nube. Son motores que corren encima de AWS, GCP o Azure, así que se comparan como reemplazo del motor nativo — no como una quinta columna. El object storage, la orquestación y las licencias de BI siguen corriendo por cuenta de la nube anfitriona.",
    en: "Neither is a cloud. They are engines that run on top of AWS, GCP or Azure, so they compare as a swap for the native engine — not as a fifth column. Object storage, orchestration and BI licences still land on the host cloud's bill.",
  },
  host: { es: "Nube anfitriona", en: "Host cloud" },
  engineCost: { es: "Motor", en: "Engine" },
  hostCost: { es: "Nube anfitriona", en: "Host cloud" },
  enginesFootnote: {
    es: "Se comparan sólo las capas de motor y plataforma. Licencias de BI y operación no cambian al cambiar de motor, así que incluirlas sólo emborronaría la comparación.",
    en: "Only the engine and platform layers are compared. BI licences and operations do not change with the engine, so including them would only blur the comparison.",
  },
  nativeBadge: { es: "Nativo", en: "Native" },

  // Combined engine matrix
  matrixTitle: { es: "Las tres nubes, juntas", en: "All three clouds, together" },
  matrixLead: {
    es: "Los mismos nueve escenarios (tres motores × tres nubes) en una sola tabla, para comparar sin cambiar de pestaña.",
    en: "The same nine scenarios (three engines × three hosts) in one table, so you can compare without switching tabs.",
  },
  matrixEngine: { es: "Motor", en: "Engine" },
  matrixDetailHeading: { es: "Detalle por nube", en: "Detail by cloud" },

  // Migration
  migrationTitle: { es: "Costo de migración, una sola vez", en: "One-time migration cost" },
  migrationLead: {
    es: "Lo anterior es la corrida mensual. Llegar ahí cuesta aparte, y suele ser la cifra que más pesa en la decisión. Cada etapa la hace un rol distinto, a una tarifa distinta — no es un solo consultor genérico.",
    en: "Everything above is the monthly run rate. Getting there costs extra, and it is usually the number that decides the deal. Each stage is done by a different role, at a different rate — not one generic consultant.",
  },
  migrationDays: { es: "días de consultoría", en: "consulting days" },
  migrationRates: { es: "Tarifas por día", en: "Day rates" },
  migrationRange: {
    es: "Se expresa como rango a propósito: una cifra puntual para un trabajo de migración siempre sale mal.",
    en: "Deliberately a range: a point estimate for migration work is always wrong.",
  },
  roleArchitect: { es: "Arquitecto / líder", en: "Architect / lead" },
  roleEngineer: { es: "Ingeniero de datos", en: "Data engineer" },
  roleAnalyst: { es: "Analista BI", en: "BI analyst" },
  migrationTechnical: { es: "Entrega técnica", en: "Technical delivery" },
  migrationTechnicalHint: {
    es: "La gente que construye la tecnología",
    en: "The people who build the technology",
  },
  migrationProcess: { es: "Procesos de adopción", en: "Adoption process" },
  migrationProcessHint: {
    es: "Lo que casi siempre se omite en una estimación — y por lo que suele salir baja",
    en: "What almost always gets left out of an estimate — and why estimates come in low",
  },
  roleMlEngineer: { es: "ML Engineer", en: "ML Engineer" },
  roleFde: { es: "Forward Deployed AI Engineer", en: "Forward Deployed AI Engineer" },

  // AI / agents (4th dimension)
  aiTitle: { es: "Implementación de IA / agentes", en: "AI / agents implementation" },
  aiLead: {
    es: "Un cuarto costo, aparte de la migración de datos: diseñar, construir y desplegar agentes con un cliente. Un proyecto puede necesitar uno de los dos, o ambos.",
    en: "A fourth cost, separate from the data migration: designing, building and deploying agents with a client. A project may need one, the other, or both.",
  },
  aiUseCases: { es: "Casos de uso de IA / agentes", en: "AI / agent use cases" },
  aiUseCasesHint: {
    es: "Cuántos agentes distintos hay que diseñar, construir y desplegar. El costo escala con esto, no con el volumen de datos.",
    en: "How many distinct agents need designing, building and deploying. Cost scales with this, not with data volume.",
  },
  aiDays: { es: "días de consultoría", en: "consulting days" },

  ctaTitle: { es: "¿Quieres el número real?", en: "Want the real number?" },
  ctaLead: {
    es: "En una sesión medimos tu carga actual y convertimos esta estimación en un costeo defendible, con la arquitectura que le corresponde.",
    en: "In one session we measure your actual workload and turn this estimate into a defensible costing, with the architecture to match.",
  },

  reset: { es: "Restablecer supuestos", en: "Reset assumptions" },
  print: { es: "Descargar PDF", en: "Download PDF" },
} satisfies Record<string, L>;
