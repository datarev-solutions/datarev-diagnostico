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

  caveat: {
    es: "Los días por rol son supuestos de DataRev calibrados contra normas de industria, no mediciones. Un alcance real se dimensiona midiendo, no estimando — esto sirve para estructurar la conversación.",
    en: "The per-role day counts are DataRev assumptions calibrated to industry norms, not measurements. Real scope is sized by measuring, not estimating — this exists to structure the conversation.",
  },
} satisfies Record<string, L>;
