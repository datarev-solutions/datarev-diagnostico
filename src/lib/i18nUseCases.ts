import type { L } from "./framework";

/** Copy for the use-case planner. Separate file so neither i18n file sprawls. */
export const UC = {
  navLabel: { es: "Casos de uso", en: "Use cases" },
  title: { es: "Planeador de casos de uso", en: "Use-case planner" },
  lead: {
    es: "Elige los problemas de negocio que quieres resolver. Cada uno trae su pregunta clave, su tecnología, su equipo y su esfuerzo — para que el alcance salga de decisiones de negocio, no de una lista de herramientas.",
    en: "Pick the business problems you want to solve. Each one carries its key question, its technology, its team and its effort — so scope comes from business decisions, not from a list of tools.",
  },
  method: {
    es: "Estructura: Proceso → Actividad → Caso de uso → Pregunta clave de negocio (KBQ) → Métrica. Cada caso se puntúa en dificultad e impacto del 1 al 10.",
    en: "Structure: Process → Activity → Use case → Key Business Question (KBQ) → Metric. Each case is scored 1-10 on difficulty and impact.",
  },

  // Catalogue
  catalogTitle: { es: "Catálogo", en: "Catalogue" },
  selected: { es: "seleccionados", en: "selected" },
  selectAll: { es: "Seleccionar todo", en: "Select all" },
  clear: { es: "Limpiar", en: "Clear" },
  impact: { es: "Impacto", en: "Impact" },
  difficulty: { es: "Dificultad", en: "Difficulty" },
  kbqLabel: { es: "Pregunta clave", en: "Key question" },
  kpiLabel: { es: "Métrica", en: "Metric" },
  filterAll: { es: "Todos los procesos", en: "All processes" },
  filterIndustry: { es: "Industria", en: "Industry" },
  filterIndustryAll: { es: "Todas las industrias", en: "All industries" },
  filterDepartment: { es: "Departamento", en: "Department" },
  filterDepartmentAll: { es: "Todos los departamentos", en: "All departments" },
  filterProcess: { es: "Proceso", en: "Process" },
  noMatches: {
    es: "Ningún caso de uso coincide con estos filtros. Prueba con menos restricciones.",
    en: "No use case matches these filters. Try loosening them.",
  },
  crossBadge: { es: "Cualquier industria", en: "Any industry" },
  provenance: {
    es: "La estructura (Proceso → Actividad → Caso de uso → KBQ → Métrica) es la metodología de DataRev. Los casos concretos y sus días por rol están redactados aquí, no salen del histórico de proyectos de DataRev. El puntaje base también, pero los ajustes por industria y por tipo de trabajo vienen de estudios publicados y fechados, listados al final de esta página.",
    en: "The structure (Process → Activity → Use case → KBQ → Metric) is DataRev's own methodology. The individual cases and their per-role day counts are authored here; they do not come from DataRev's delivery history. The base score too — but the adjustments by industry and by kind of work come from dated, published studies, listed at the foot of this page.",
  },

  // Matrix
  matrixTitle: { es: "Matriz de priorización", en: "Prioritisation matrix" },
  matrixLead: {
    es: "Impacto contra dificultad. Arriba a la izquierda es donde conviene empezar.",
    en: "Impact against difficulty. Top left is where to start.",
  },
  quickWin: { es: "Ganancias rápidas", en: "Quick wins" },
  bigBet: { es: "Apuestas grandes", en: "Big bets" },
  fillIn: { es: "Rellenos", en: "Fill-ins" },
  avoid: { es: "Evitar por ahora", en: "Avoid for now" },
  legendSelected: { es: "Seleccionado", en: "Selected" },
  legendAvailable: { es: "Disponible", en: "Available" },

  // Team
  teamTitle: { es: "Equipo necesario", en: "Team required" },
  teamLead: {
    es: "Lo que exige la selección, convertido en personas sobre una ventana de entrega.",
    en: "What the selection demands, turned into people over a delivery window.",
  },
  window: { es: "Ventana de entrega", en: "Delivery window" },
  months: { es: "meses", en: "months" },
  fte: { es: "personas", en: "people" },
  fteOne: { es: "persona", en: "person" },
  personDays: { es: "días-persona", en: "person-days" },
  teamEmpty: {
    es: "Selecciona al menos un caso de uso para dimensionar el equipo.",
    en: "Select at least one use case to size the team.",
  },
  teamRounding: {
    es: "Redondeado hacia arriba: medio ingeniero no se presenta el lunes. Un plan que implica medias personas es un plan que se retrasa.",
    en: "Rounded up: half an engineer does not show up on Monday. A plan that implies half-people is a plan that slips.",
  },

  // Tech
  techTitle: { es: "Tecnología involucrada", en: "Technology involved" },
  techLead: {
    es: "Las capacidades de plataforma que exige la selección. Si un caso pide streaming o base vectorial, la arquitectura tiene que preverlo desde el diseño.",
    en: "The platform capabilities the selection demands. If a case needs streaming or a vector store, the architecture has to plan for it from the start.",
  },
  techEmpty: {
    es: "Sin casos seleccionados no hay huella tecnológica que mostrar.",
    en: "With nothing selected there is no technology footprint to show.",
  },

  // Summary
  effortTitle: { es: "Esfuerzo total", en: "Total effort" },
  avgImpact: { es: "Impacto promedio", en: "Average impact" },
  avgDifficulty: { es: "Dificultad promedio", en: "Average difficulty" },
  caseCount: { es: "Casos de uso", en: "Use cases" },
  toCalculator: { es: "Ver el costo de esta selección", en: "See what this selection costs" },

  // RACI
  raciTitle: { es: "Mapeo de procesos y responsabilidades", en: "Process and responsibility mapping" },
  raciLead: {
    es: "Qué actividades dispara tu selección y quién responde por cada una. Sólo aparecen los actores que realmente participan.",
    en: "Which activities your selection triggers, and who answers for each. Only actors that actually take part appear.",
  },
  raciActivity: { es: "Actividad", en: "Activity" },
  raciDeliverable: { es: "Entregable", en: "Deliverable" },
  raciNote: {
    es: "Un solo aprobador (A) por actividad — es la regla que hace útil a RACI. Las decisiones de encuadre, validación y capacitación son del cliente, no de DataRev: un proyecto se atora cuando el dueño del proceso sólo está informado de lo que sólo él puede decidir.",
    en: "Exactly one Accountable (A) per activity — the rule that makes RACI useful. Framing, acceptance and training decisions belong to the client, not DataRev: a project stalls when the process owner is merely informed of calls only they can make.",
  },

  // Roster (team + stack), auto-derived with manual override
  resetAuto: { es: "Volver a la selección automática", en: "Back to automatic selection" },
  removeSeat: { es: "Quitar del equipo", en: "Remove from team" },
  addSeat: { es: "Agregar un perfil que tu organización necesite y no se dedujo:", en: "Add a profile your organization needs that was not inferred:" },
  owns: { es: "Responsable de", en: "Owns" },
  removeLayer: { es: "Quitar", en: "Remove" },
  addLayer: { es: "Agregar una capa que tu arquitectura necesite:", en: "Add a layer your architecture needs:" },
  ownedBy: { es: "Lo construye", en: "Built by" },
  layers: { es: "capas", en: "layers" },
  stackNote: {
    es: "Estructura según el MAD Landscape 2025 (FirstMark), la undécima edición del mapa del ecosistema de datos e IA. Los proveedores son ilustrativos de cada capa, no recomendaciones ni una lista exhaustiva.",
    en: "Structure follows the 2025 MAD Landscape (FirstMark), the eleventh edition of the data and AI ecosystem map. Vendors illustrate each layer; they are neither recommendations nor an exhaustive list.",
  },

  // Industry lens on the scores
  lensTitle: { es: "Puntajes ajustados por industria", en: "Scores adjusted by industry" },
  lensLead: {
    es: "El mismo caso de uso no vale lo mismo en todas las industrias. El puntaje base del catálogo se ajusta con datos publicados: lo que cada industria realmente prioriza y las tasas de falla documentadas del trabajo generativo y agéntico.",
    en: "The same use case is not worth the same everywhere. The catalogue's base score is adjusted with published data: what each industry actually prioritises, and the documented failure rates of generative and agentic work.",
  },
  lensInactive: {
    es: "Elige una industria arriba para ver los puntajes ajustados a su realidad. Sin industria seleccionada se muestran los puntajes base del catálogo, sin ajuste.",
    en: "Pick an industry above to see scores adjusted to its reality. With no industry selected the catalogue's base scores are shown, unadjusted.",
  },
  baseScore: { es: "base", en: "base" },
  adjusted: { es: "ajustado", en: "adjusted" },
  evidenceTitle: { es: "De dónde salen estos números", en: "Where these numbers come from" },
  evidenceLead: {
    es: "Cada ajuste de puntaje viene de trabajo publicado y fechado. Nada de esto es histórico de proyectos de DataRev — ese dato todavía no existe — y no se usan estudios anteriores a 2025: los índices de madurez de 2022 y la frase de que “87% de los modelos nunca llegan a producción” son previos a la IA generativa en producción y valuarían mal cualquier caso agéntico.",
    en: "Every score adjustment comes from dated, published work. None of it is DataRev's own delivery history — that data does not exist yet — and nothing published before 2025 is used: the 2022-era maturity indices and the “87% of models never reach production” line predate generative AI in production and would misprice any agentic case.",
  },
  readinessTitle: { es: "Por qué el plan trae gobierno, seguridad y adopción", en: "Why the plan carries governance, security and adoption" },
  readinessLead: {
    es: "No son líneas de relleno. Son las brechas que Cisco midió en 8,039 organizaciones y la razón por la que un proyecto técnicamente correcto no entrega valor.",
    en: "These are not filler lines. They are the gaps Cisco measured across 8,039 organizations, and the reason a technically sound project still fails to deliver value.",
  },

  caveat: {
    es: "Los días por rol son supuestos de DataRev calibrados contra normas de industria, no mediciones. Un alcance real se dimensiona midiendo, no estimando — esto sirve para estructurar la conversación.",
    en: "The per-role day counts are DataRev assumptions calibrated to industry norms, not measurements. Real scope is sized by measuring, not estimating — this exists to structure the conversation.",
  },
} satisfies Record<string, L>;
