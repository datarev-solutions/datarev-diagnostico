import type { L, Locale } from "./framework";

/** Resolve a bilingual string. */
export function t(value: L, locale: Locale): string {
  return value[locale];
}

export const UI = {
  appName: { es: "Diagnóstico de Madurez", en: "Maturity Assessment" },
  tagline: {
    es: "Diagnóstico de madurez en Datos e Inteligencia Artificial",
    en: "Data and Artificial Intelligence maturity assessment",
  },
  heroLead: {
    es: "Evalúa dónde está tu organización en 8 dimensiones, compárala contra el mercado y recibe un roadmap de acciones priorizadas. Sin costo.",
    en: "Assess where your organisation stands across 8 dimensions, benchmark it against the market, and get a prioritised action roadmap. Free.",
  },
  frameworkNote: {
    es: "Modelo compuesto a partir de investigación pública de MIT CISR, Gartner, NIST AI RMF, ISO/IEC 42001 y la rejilla de capacidades CMMI-DMM, calibrado con la experiencia de entrega de DataRev.",
    en: "Composite model drawing on public research from MIT CISR, Gartner, NIST AI RMF, ISO/IEC 42001 and the CMMI-DMM capability grid, calibrated against DataRev's delivery experience.",
  },

  // Hero
  heroTitle: {
    es: "Mide tu madurez en Datos e IA",
    en: "Measure your Data and AI maturity",
  },
  heroBadge: {
    es: "Un diagnóstico de DataRev",
    en: "A DataRev assessment",
  },
  scrollToExplore: { es: "Desplázate para explorar", en: "Scroll to explore" },
  startNow: { es: "Comenzar diagnóstico", en: "Start assessment" },
  seeFramework: { es: "Ver el marco", en: "See the framework" },

  // Landing
  chooseMode: { es: "Elige el tipo de diagnóstico", en: "Choose your assessment" },
  expressName: { es: "Express", en: "Express" },
  expressMeta: { es: "16 preguntas · ~5 min", en: "16 questions · ~5 min" },
  expressDesc: {
    es: "Una lectura rápida de las 8 dimensiones. Ideal para una primera conversación con dirección.",
    en: "A fast read across all 8 dimensions. Ideal for a first conversation with leadership.",
  },
  fullName: { es: "Completo", en: "Complete" },
  fullMeta: { es: "40 preguntas · ~20 min", en: "40 questions · ~20 min" },
  fullDesc: {
    es: "Cinco preguntas por dimensión. El dictamen formal, defendible ante un comité. Puedes responderlo solo o hacerlo con un consultor en vivo.",
    en: "Five questions per dimension. The formal assessment, defensible in committee. Answer it yourself, or run it live with a consultant.",
  },
  start: { es: "Comenzar", en: "Start" },
  resumeAssessment: { es: "Continuar donde quedaste", en: "Resume where you left off" },
  startOver: { es: "Empezar de nuevo", en: "Start over" },
  eightDimensions: { es: "8 dimensiones", en: "8 dimensions" },
  fiveLevels: { es: "5 niveles de madurez", en: "5 maturity levels" },
  freeNoCost: { es: "Sin costo y sin compromiso", en: "Free, no strings attached" },

  // Guided-assessment offer (the "do it with us" path off the full mode)
  guidedTitle: {
    es: "¿Prefieres no hacerlo solo?",
    en: "Rather not do it alone?",
  },
  guidedLead: {
    es: "Lo hacemos contigo en vivo: una sesión de una hora, sin costo, con un consultor de DataRev. Respondemos el diagnóstico juntos y salimos de la llamada con una prioridad clara.",
    en: "We run it with you live: a free one-hour session with a DataRev consultant. We answer the assessment together and leave the call with a clear priority.",
  },
  guidedCta: { es: "Agendar sesión de 1 hora", en: "Book the 1-hour session" },
  guidedBadge: { es: "1 hora · sin costo", en: "1 hour · free" },
  guidedPerks: {
    es: "Un consultor senior · Interpretación en vivo · Roadmap al terminar",
    en: "A senior consultant · Live interpretation · A roadmap by the end",
  },
  orDoItYourself: { es: "o respóndelo por tu cuenta", en: "or answer it yourself" },
  guidedRequestCta: { es: "Solicitar mi sesión de 1 hora", en: "Request my 1-hour session" },
  guidedRequestDone: {
    es: "Recibido. Un consultor de DataRev te escribe para agendar tu hora.",
    en: "Got it. A DataRev consultant will email you to schedule your hour.",
  },
  guidedRequestNote: {
    es: "Te confirmamos horario por correo, normalmente el mismo día hábil.",
    en: "We confirm the slot by email, usually the same business day.",
  },

  // Lead capture
  gateTitle: {
    es: "Tu diagnóstico está listo",
    en: "Your assessment is ready",
  },
  gateLead: {
    es: "Déjanos a dónde enviarlo y desbloquea el reporte completo: perfil por dimensión, posición contra el mercado y roadmap priorizado.",
    en: "Tell us where to send it and unlock the full report: profile by dimension, position against the market and a prioritised roadmap.",
  },
  gateGoogle: { es: "Continuar con Google", en: "Continue with Google" },
  gateOr: { es: "o", en: "or" },
  gateEmailLabel: { es: "Correo de trabajo", en: "Work email" },
  gateEmailPlaceholder: { es: "nombre@empresa.com", en: "name@company.com" },
  gateNameLabel: { es: "Nombre", en: "Name" },
  gateCompanyLabel: { es: "Empresa", en: "Company" },
  gateRoleLabel: { es: "Puesto", en: "Role" },
  gatePhoneLabel: { es: "Teléfono (opcional)", en: "Phone (optional)" },
  gateSubmit: { es: "Ver mi reporte completo", en: "See my full report" },
  gateConsent: {
    es: "Acepto que DataRev me contacte sobre este diagnóstico.",
    en: "I agree to be contacted by DataRev about this assessment.",
  },
  gatePrivacy: {
    es: "Usamos tus datos sólo para entregarte el reporte y darle seguimiento. Sin reventa a terceros.",
    en: "We use your details only to deliver the report and follow up. Never resold to third parties.",
  },
  gateSending: { es: "Enviando…", en: "Sending…" },
  gateError: {
    es: "No pudimos guardar tus datos. Revisa el correo e inténtalo de nuevo.",
    en: "We couldn't save your details. Check the email and try again.",
  },
  gateRequired: { es: "Campo requerido", en: "Required field" },
  gateWhatYouGet: { es: "Lo que desbloqueas", en: "What you unlock" },
  gatePerk1: {
    es: "Perfil de madurez en las 8 dimensiones",
    en: "Maturity profile across all 8 dimensions",
  },
  gatePerk2: {
    es: "Tu posición contra empresas comparables",
    en: "Your position against comparable enterprises",
  },
  gatePerk3: {
    es: "Roadmap de acciones con impacto y esfuerzo",
    en: "Action roadmap scored by impact and effort",
  },
  gatePerk4: {
    es: "Reporte en PDF para llevar a comité",
    en: "A PDF report you can take to committee",
  },
  signIn: { es: "Iniciar sesión", en: "Sign in" },
  signedInAs: { es: "Sesión de", en: "Signed in as" },
  signOut: { es: "Cerrar sesión", en: "Sign out" },
  authError: {
    es: "No pudimos completar el acceso con Google. Intenta de nuevo o usa tu correo.",
    en: "We couldn't complete Google sign-in. Try again or use your email.",
  },

  // Post-report conversion
  nextStepTitle: { es: "¿Y ahora qué?", en: "What now?" },
  nextStepLead: {
    es: "Revisemos juntos tu resultado y qué caso de uso conviene atacar primero. La sesión no cuesta nada y no compromete a nada.",
    en: "Let's review your result together and decide which use case to tackle first. The session is free and commits you to nothing.",
  },
  nextStepCta: { es: "Agendar sesión con un consultor", en: "Book a session with a consultant" },
  contactUs: { es: "Escríbenos", en: "Email us" },

  // Context step
  contextTitle: { es: "Contexto de la organización", en: "Organisation context" },
  contextLead: {
    es: "Opcional, sólo se usa para personalizar el reporte.",
    en: "Optional, used only to personalise the report.",
  },
  companyName: { es: "Nombre de la organización", en: "Organisation name" },
  companyPlaceholder: { es: "Ej. Grupo Industrial Norte", en: "e.g. Northern Industrial Group" },
  industry: { es: "Sector", en: "Industry" },
  size: { es: "Tamaño", en: "Size" },
  assessorName: { es: "Responsable del diagnóstico", en: "Assessment owner" },
  assessorPlaceholder: { es: "Ej. Dirección de Transformación", en: "e.g. Head of Transformation" },
  skip: { es: "Omitir", en: "Skip" },

  // Questionnaire
  question: { es: "Pregunta", en: "Question" },
  of: { es: "de", en: "of" },
  back: { es: "Anterior", en: "Back" },
  next: { es: "Siguiente", en: "Next" },
  finish: { es: "Ver resultados", en: "See results" },
  selectToContinue: {
    es: "Selecciona la opción que mejor describe la situación actual",
    en: "Select the option that best describes the current situation",
  },
  progress: { es: "Progreso", en: "Progress" },
  answered: { es: "respondidas", en: "answered" },
  unansweredWarning: {
    es: "Faltan preguntas por responder. Puedes ver resultados parciales, pero el dictamen será menos preciso.",
    en: "Some questions are unanswered. You can view partial results, but the assessment will be less precise.",
  },
  jumpToUnanswered: { es: "Ir a la primera sin responder", en: "Go to the first unanswered" },

  // Ambition
  ambitionTitle: { es: "¿Cuál es tu nivel objetivo?", en: "What is your target level?" },
  ambitionLead: {
    es: "Define la ambición. Determina la brecha y el tamaño del roadmap.",
    en: "Set the ambition. It determines the gap and the size of the roadmap.",
  },
  customTargets: { es: "Ajustar por dimensión", en: "Adjust per dimension" },
  target: { es: "Objetivo", en: "Target" },
  current: { es: "Actual", en: "Current" },

  // Results
  results: { es: "Resultados", en: "Results" },
  overallMaturity: { es: "Madurez general", en: "Overall maturity" },
  yourStage: { es: "Etapa de madurez", en: "Maturity stage" },
  ofEnterprises: { es: "de las empresas", en: "of enterprises" },
  performanceBelow: {
    es: "Las empresas en las etapas 1 y 2 rinden por debajo del promedio de su industria.",
    en: "Enterprises in stages 1 and 2 perform below their industry average.",
  },
  performanceAbove: {
    es: "Las empresas en las etapas 3 y 4 rinden por encima del promedio de su industria.",
    en: "Enterprises in stages 3 and 4 perform above their industry average.",
  },
  radarTitle: { es: "Perfil de madurez por dimensión", en: "Maturity profile by dimension" },
  radarLead: {
    es: "Área sólida: nivel actual. Línea punteada: nivel objetivo.",
    en: "Solid area: current level. Dotted line: target level.",
  },
  gridTitle: { es: "Rejilla de madurez", en: "Maturity grid" },
  gridLead: {
    es: "La celda resaltada marca el nivel alcanzado en cada dimensión.",
    en: "The highlighted cell marks the level reached in each dimension.",
  },
  gapsTitle: { es: "Brechas priorizadas", en: "Prioritised gaps" },
  gapsLead: {
    es: "Ordenadas por peso de la dimensión × distancia al objetivo.",
    en: "Ordered by dimension weight × distance to target.",
  },
  quadrantTitle: { es: "Impacto contra esfuerzo", en: "Impact versus effort" },
  quadrantLead: {
    es: "Cada punto es una acción del roadmap. Arriba a la izquierda: ganancias rápidas.",
    en: "Each dot is a roadmap action. Top left: quick wins.",
  },
  distributionTitle: { es: "Posición contra el mercado", en: "Position against the market" },
  distributionLead: {
    es: "Distribución observada sobre 721 empresas (MIT CISR).",
    en: "Distribution observed across 721 enterprises (MIT CISR).",
  },
  roadmapTitle: { es: "Roadmap de acciones", en: "Action roadmap" },
  roadmapLead: {
    es: "Acciones priorizadas por peso de dimensión, brecha, impacto y esfuerzo.",
    en: "Actions prioritised by dimension weight, gap, impact and effort.",
  },
  verdictTitle: { es: "Dictamen", en: "Verdict" },
  strengthsTitle: { es: "Fortalezas", en: "Strengths" },
  noGaps: {
    es: "No hay brechas contra el objetivo definido. Considera elevar la ambición.",
    en: "There are no gaps against the defined target. Consider raising the ambition.",
  },
  noActions: {
    es: "Sin acciones pendientes para el objetivo actual.",
    en: "No pending actions for the current target.",
  },

  // Roadmap cards
  impact: { es: "Impacto", en: "Impact" },
  effort: { es: "Esfuerzo", en: "Effort" },
  owner: { es: "Responsable", en: "Owner" },
  kpi: { es: "Indicador", en: "KPI" },
  actions: { es: "acciones", en: "actions" },
  level: { es: "Nivel", en: "Level" },
  weight: { es: "Peso", en: "Weight" },
  movesFrom: { es: "Mueve del nivel", en: "Moves from level" },
  to: { es: "al", en: "to" },

  // Actions bar
  downloadReport: { es: "Descargar PDF", en: "Download PDF" },
  copyLink: { es: "Copiar enlace", en: "Copy link" },
  linkCopied: { es: "Enlace copiado", en: "Link copied" },
  editAnswers: { es: "Editar respuestas", en: "Edit answers" },
  newAssessment: { es: "Nuevo diagnóstico", en: "New assessment" },

  // Report
  reportFor: { es: "Diagnóstico para", en: "Assessment for" },
  reportDate: { es: "Fecha", en: "Date" },
  preparedBy: { es: "Elaborado por", en: "Prepared by" },
  methodology: { es: "Metodología", en: "Methodology" },
  methodologyBody: {
    es: "Cada dimensión se puntúa de 1 a 5 promediando sus preguntas. La madurez general es el promedio ponderado por el peso de cada dimensión. Un nivel se acredita cuando la puntuación alcanza al menos tres cuartas partes del camino hacia él.",
    en: "Each dimension is scored 1 to 5 by averaging its questions. Overall maturity is the weighted mean across dimensions. A level is credited once the score reaches at least three quarters of the way toward it.",
  },
  sources: { es: "Fuentes del marco", en: "Framework sources" },
  frameworkDisclaimer: {
    es: "Diagnóstico elaborado por DataRev sobre marcos públicos de referencia. Las fuentes citadas no avalan ni patrocinan esta herramienta.",
    en: "Assessment built by DataRev on public reference frameworks. The cited sources neither endorse nor sponsor this tool.",
  },

  // Misc
  language: { es: "Idioma", en: "Language" },
  notAnswered: { es: "Sin responder", en: "Not answered" },
  incomplete: { es: "Incompleto", en: "Incomplete" },
  dimensions: { es: "Dimensiones", en: "Dimensions" },
  noResultsTitle: { es: "Aún no hay resultados", en: "No results yet" },
  noResultsBody: {
    es: "Completa un diagnóstico para ver el dictamen y el roadmap.",
    en: "Complete an assessment to see the verdict and the roadmap.",
  },
  goToStart: { es: "Ir al inicio", en: "Go to start" },
  backToSite: { es: "Ir a datarev.solutions", en: "Go to datarev.solutions" },
  downloadBrochure: { es: "Descargar brochure", en: "Download brochure" },
  visitSite: { es: "Nuestro sitio", en: "Our site" },
} as const;

export const INDUSTRIES: L[] = [
  { es: "Servicios financieros", en: "Financial services" },
  { es: "Manufactura", en: "Manufacturing" },
  { es: "Retail y consumo", en: "Retail and consumer" },
  { es: "Salud", en: "Healthcare" },
  { es: "Telecomunicaciones", en: "Telecommunications" },
  { es: "Energía y recursos", en: "Energy and resources" },
  { es: "Sector público", en: "Public sector" },
  { es: "Educación", en: "Education" },
  { es: "Tecnología", en: "Technology" },
  { es: "Otro", en: "Other" },
];

export const SIZES: L[] = [
  { es: "Menos de 100 empleados", en: "Fewer than 100 employees" },
  { es: "100 – 1,000 empleados", en: "100 – 1,000 employees" },
  { es: "1,000 – 10,000 empleados", en: "1,000 – 10,000 employees" },
  { es: "Más de 10,000 empleados", en: "More than 10,000 employees" },
];

export const SOURCE_LIST = [
  "MIT CISR — Enterprise AI Maturity Model (n=721)",
  "Gartner — AI Maturity Model",
  "NIST — AI Risk Management Framework 1.0",
  "ISO/IEC 42001 — AI Management System",
  "CMMI Institute — Data Management Maturity",
];

export function formatDate(locale: Locale, date = new Date()): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
