import type { L } from "./framework";

/** Copy for the cost calculator. Kept apart from UI so neither file sprawls. */
export const CALC = {
  navLabel: { es: "Calculadora", en: "Calculator" },
  title: { es: "Calculadora de costos de plataforma", en: "Platform cost calculator" },
  lead: {
    es: "Compara lo que costaría la misma carga de trabajo en cuatro arquitecturas. Ajusta los supuestos y los números se recalculan al instante.",
    en: "Compare what the same workload would cost across four architectures. Adjust the assumptions and the numbers recalculate instantly.",
  },

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
  creators: { es: "Constructores", en: "Builders" },
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

  ctaTitle: { es: "¿Quieres el número real?", en: "Want the real number?" },
  ctaLead: {
    es: "En una sesión medimos tu carga actual y convertimos esta estimación en un costeo defendible, con la arquitectura que le corresponde.",
    en: "In one session we measure your actual workload and turn this estimate into a defensible costing, with the architecture to match.",
  },

  reset: { es: "Restablecer supuestos", en: "Reset assumptions" },
  print: { es: "Descargar PDF", en: "Download PDF" },
} satisfies Record<string, L>;
