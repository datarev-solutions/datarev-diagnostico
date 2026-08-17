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
  dimSelectHint: {
    es: "Selecciona qué rubros entran en la cotización. El resumen de abajo suma sólo los que estén activos.",
    en: "Pick which items are in scope. The summary below adds up only the active ones.",
  },
  dimIncluded: { es: "Incluido", en: "Included" },
  dimExcluded: { es: "Fuera de alcance", en: "Out of scope" },

  // Project summary
  summaryTitle: { es: "Resumen del proyecto", en: "Project summary" },
  summaryLead: {
    es: "Lo que suman los rubros seleccionados, con la plataforma que elijas abajo.",
    en: "What the selected items add up to, on whichever platform you pick below.",
  },
  summaryMonthly: { es: "Mensual (recurrente)", en: "Monthly (recurring)" },
  summaryOneTime: { es: "Una sola vez", en: "One-time" },
  summaryOnce: { es: "única vez", en: "one-time" },
  summaryFirstYear: { es: "Primer año", en: "First year" },
  summaryFirstYearHint: {
    es: "Una sola vez + doce meses de corrida",
    en: "One-time plus twelve months of run rate",
  },
  summaryPlatform: { es: "Plataforma para el total", en: "Platform used for the total" },
  summaryEmpty: {
    es: "No hay rubros seleccionados. Activa al menos uno arriba para ver un total.",
    en: "Nothing selected. Switch on at least one item above to see a total.",
  },

  // Input groups
  /* Los tres bloques responden a preguntas distintas y antes vivían todos bajo
   * "Tu situación actual", que sólo era cierto del primero. Un cliente no puede
   * llenar bien un formulario si no sabe si le preguntan lo que tiene o lo que
   * quiere. */
  inputsTitle: { es: "Lo que tienes hoy", en: "What you have today" },
  inputsSubtitle: {
    es: "Tu estado actual. Determina cuánto cuesta migrar.",
    en: "Your current estate. Drives what the migration costs.",
  },
  targetTitle: { es: "Lo que quieres", en: "What you want" },
  targetSubtitle: {
    es: "El nivel de servicio al que quieres llegar. Determina el costo mensual de operar.",
    en: "The service level you want to reach. Drives the monthly cost of running it.",
  },
  audienceTitle: { es: "Quién lo va a usar", en: "Who will use it" },
  audienceSubtitle: {
    es: "Determina las licencias.",
    en: "Drives licensing.",
  },
  derivedTitle: { es: "Lo que necesitas", en: "What you need" },
  derivedSubtitle: {
    es: "Esto no se captura: sale de los casos de uso que elegiste en el planeador.",
    en: "This is not entered here: it comes from the use cases you picked in the planner.",
  },
  derivedFrom: {
    es: "casos de uso seleccionados en el planeador",
    en: "use cases selected in the planner",
  },
  // Headcount — who actually builds this
  headcountTitle: { es: "Quién lo va a desarrollar", en: "Who will build it" },
  headcountLead: {
    es: "El equipo que exige esta cotización, convertido en personas. Sale de las mismas líneas que producen el costo, así que no puede contradecirlo.",
    en: "The team this quote demands, turned into people. Derived from the same lines that produce the cost, so the two cannot contradict each other.",
  },
  headcountWindow: { es: "Ventana de entrega", en: "Delivery window" },
  headcountMonths: { es: "meses", en: "months" },
  headcountRole: { es: "Perfil", en: "Role" },
  headcountPeople: { es: "Personas", en: "People" },
  headcountDays: { es: "Días-persona", en: "Person-days" },
  headcountCost: { es: "Costo", en: "Cost" },
  headcountTotal: { es: "Total", en: "Total" },
  headcountEmpty: {
    es: "Apaga y prende los rubros de arriba para ver el equipo que cada uno exige.",
    en: "Toggle the dimensions above to see the team each one demands.",
  },
  headcountNote: {
    es: "Redondeado hacia arriba: medio ingeniero no se presenta el lunes. Acortar la ventana de entrega no baja los días-persona, sube el número de personas — y con él el costo de coordinación. Los perfiles se activan solos según lo que la cotización incluya: un proyecto sin IA no trae ML Engineer ni Forward Deployed.",
    en: "Rounded up: half an engineer does not show up on Monday. Shortening the window does not reduce person-days, it raises headcount — and with it the cost of coordination. Roles activate on their own according to what the quote includes: a project with no AI carries neither an ML engineer nor a Forward Deployed one.",
  },

  derivedFromOne: {
    es: "caso de uso seleccionado en el planeador",
    en: "use case selected in the planner",
  },
  derivedEdit: { es: "Cambiar la selección", en: "Change the selection" },
  derivedEmpty: {
    es: "Sin casos de uso seleccionados, el frente de trabajo de IA se estima con una fórmula genérica: cuántos agentes distintos hay que diseñar, construir y desplegar. Elegir casos concretos en el planeador da un número mucho mejor.",
    en: "With no use cases selected, the AI workstream is estimated with a generic formula: how many distinct agents need designing, building and deploying. Picking real use cases in the planner gives a far better number.",
  },
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
  aiFromPlanner: {
    es: "Calculado desde {n} casos de uso que elegiste en el planeador, no con la fórmula genérica. Los días salen del catálogo, rol por rol.",
    en: "Calculated from the {n} use cases you picked in the planner, not the generic formula. Days come from the catalogue, role by role.",
  },
  aiGenericNotice: {
    es: "Estimación genérica por número de casos. Elige casos concretos en el planeador y esta sección usará sus días reales.",
    en: "Generic estimate by case count. Pick concrete cases in the planner and this section will use their real day counts.",
  },
  aiOpenPlanner: { es: "Abrir planeador", en: "Open planner" },

  ctaTitle: { es: "¿Quieres el número real?", en: "Want the real number?" },
  ctaLead: {
    es: "En una sesión medimos tu carga actual y convertimos esta estimación en un costeo defendible, con la arquitectura que le corresponde.",
    en: "In one session we measure your actual workload and turn this estimate into a defensible costing, with the architecture to match.",
  },

  reset: { es: "Restablecer supuestos", en: "Reset assumptions" },
  print: { es: "Descargar PDF", en: "Download PDF" },
} satisfies Record<string, L>;
