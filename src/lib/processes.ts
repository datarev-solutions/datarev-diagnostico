import type { L } from "./framework";
import type { Department, Industry } from "./useCases";

/**
 * REAL BUSINESS PROCESSES, NOT JUST THE ONES WE BUILT A USE CASE FOR
 * ====================================================================
 * Dante's point: a real company runs thousands of processes. The planner's
 * catalogue only lists the ~36 we authored a use case for — which answers
 * "what can DataRev build you" but not "what does your department actually
 * do", and a client filtering by industry + department should see the second
 * thing, with the catalogue cases marked on top of it.
 *
 * PROVENANCE. The 9-category grouping below follows APQC's Process
 * Classification Framework (PCF) — the public, cross-industry taxonomy of
 * ~1,000 processes organised into 13 top-level categories, an industry
 * standard for process benchmarking since 1992. Only the 13 top-level
 * category names are public; APQC's own detailed sub-process list (down to
 * task level) is a paid member resource we do not have access to and do not
 * claim to reproduce.
 *
 * So: the CATEGORY a process sits under is APQC's. The specific ~10 processes
 * listed per department, their names and which industries make them sharper,
 * are authored here — informed by the APQC category descriptions and by
 * DataRev's own `Priorizacion_casos_de_uso` workbook, not transcribed from a
 * licensed process list. Where a process already has a built use case in the
 * catalogue, it is linked — that is the strongest claim we can make about it.
 */

export interface ApqcCategory {
  code: string;
  name: L;
}

/** APQC PCF v7/v8, 13 cross-industry categories — the 9 that map onto our
 * department taxonomy. (Categories 1, 2, 12, 13 — vision/strategy, product
 * R&D, external relationships, and capability-building — cut across every
 * department rather than belonging to one, so they are not mapped here.) */
export const APQC_CATEGORY: Record<Department, ApqcCategory> = {
  finance: {
    code: "9.0",
    name: { es: "Gestionar recursos financieros", en: "Manage financial resources" },
  },
  risk: {
    code: "11.0",
    name: {
      es: "Gestionar riesgo empresarial, cumplimiento y resiliencia",
      en: "Manage enterprise risk, compliance and resiliency",
    },
  },
  commercial: {
    code: "3.0",
    name: { es: "Vender productos y servicios", en: "Sell products and services" },
  },
  marketing: {
    code: "3.0",
    name: { es: "Comercializar productos y servicios", en: "Market products and services" },
  },
  operations: {
    code: "5.0",
    name: { es: "Entregar servicios y operar", en: "Deliver services and operate" },
  },
  supplyChain: {
    code: "4.0",
    name: {
      es: "Gestionar la cadena de suministro física",
      en: "Manage supply chain for physical products",
    },
  },
  hr: {
    code: "7.0",
    name: { es: "Desarrollar y gestionar capital humano", en: "Develop and manage human capital" },
  },
  service: {
    code: "6.0",
    name: { es: "Gestionar servicio al cliente", en: "Manage customer service" },
  },
  it: {
    code: "8.0",
    name: { es: "Gestionar tecnología de información", en: "Manage information technology" },
  },
};

export interface BusinessProcess {
  id: string;
  department: Department;
  /** Industries where this process is materially different or more acute.
   * `cross` = every industry runs some version of it. */
  industries: Industry[];
  name: L;
  /** One line: what the process is actually for. */
  what: L;
  /** Id into USE_CASES when the catalogue already has a built case for it. */
  linkedUseCaseId?: string;
}

export const BUSINESS_PROCESSES: BusinessProcess[] = [
  // ---------------------------------------------------------------- finance
  {
    id: "proc-fpa",
    department: "finance",
    industries: ["cross"],
    name: { es: "Planeación financiera y presupuesto (FP&A)", en: "Financial planning & budgeting (FP&A)" },
    what: { es: "Fijar el presupuesto y explicar cada desviación.", en: "Set the budget and explain every variance against it." },
    linkedUseCaseId: "fin-budget",
  },
  {
    id: "proc-treasury",
    department: "finance",
    industries: ["cross"],
    name: { es: "Tesorería y flujo de efectivo", en: "Treasury and cash flow" },
    what: { es: "Saber cuánto efectivo hay y cuándo se necesita más.", en: "Know how much cash there is and when more is needed." },
    linkedUseCaseId: "fin-cashflow",
  },
  {
    id: "proc-mgmt-reporting",
    department: "finance",
    industries: ["cross"],
    name: { es: "Reporte directivo unificado", en: "Unified management reporting" },
    what: { es: "Un solo número por métrica, no uno por área.", en: "One number per metric, not one per department." },
    linkedUseCaseId: "fin-cockpit",
  },
  {
    id: "proc-ap-ar",
    department: "finance",
    industries: ["cross"],
    name: { es: "Cuentas por pagar y por cobrar", en: "Accounts payable and receivable" },
    what: { es: "Pagar a tiempo, cobrar a tiempo.", en: "Pay on time, collect on time." },
  },
  {
    id: "proc-revenue-accounting",
    department: "finance",
    industries: ["cross"],
    name: { es: "Contabilidad de ingresos", en: "Revenue accounting" },
    what: { es: "Reconocer el ingreso donde y cuando corresponde.", en: "Recognise revenue where and when it is actually earned." },
  },
  {
    id: "proc-fixed-assets",
    department: "finance",
    industries: ["manufacturing", "telco", "logistics"],
    name: { es: "Gestión de activos fijos", en: "Fixed asset management" },
    what: { es: "Saber qué activos hay, dónde están y cuánto valen hoy.", en: "Know what assets exist, where they are, and what they are worth today." },
  },
  {
    id: "proc-tax",
    department: "finance",
    industries: ["cross"],
    name: { es: "Gestión fiscal y cumplimiento tributario", en: "Tax management and compliance" },
    what: { es: "Declarar correcto y a tiempo en cada jurisdicción.", en: "File correctly and on time in every jurisdiction." },
  },
  {
    id: "proc-tax-audit",
    department: "finance",
    industries: ["cross"],
    name: { es: "Auditoría interna y control financiero", en: "Internal audit and financial control" },
    what: { es: "Que el número que sale de finanzas resista una auditoría.", en: "The number that leaves finance should survive an audit." },
  },

  // ------------------------------------------------------------------- risk
  {
    id: "proc-fraud-controls",
    department: "risk",
    industries: ["cross", "banking", "insurance", "retail"],
    name: { es: "Monitoreo de fraude y controles internos", en: "Fraud monitoring and internal controls" },
    what: { es: "Detectar la transacción que no encaja antes de que duela.", en: "Catch the transaction that does not fit before it hurts." },
    linkedUseCaseId: "fin-fraud",
  },
  {
    id: "proc-enterprise-risk",
    department: "risk",
    industries: ["cross"],
    name: { es: "Evaluación de riesgo empresarial", en: "Enterprise risk assessment" },
    what: { es: "Mapear qué puede salir mal y cuánto costaría.", en: "Map what can go wrong and what it would cost." },
  },
  {
    id: "proc-regulatory-compliance",
    department: "risk",
    industries: ["cross", "banking", "insurance", "healthcare"],
    name: { es: "Monitoreo de cumplimiento regulatorio", en: "Regulatory compliance monitoring" },
    what: { es: "Demostrarle al regulador que la regla sí se sigue.", en: "Show the regulator the rule is actually being followed." },
  },
  {
    id: "proc-vendor-risk",
    department: "risk",
    industries: ["cross"],
    name: { es: "Riesgo de terceros y proveedores", en: "Third-party and vendor risk" },
    what: { es: "El riesgo que trae un proveedor también es tu riesgo.", en: "A vendor's risk is your risk too." },
  },
  {
    id: "proc-continuity",
    department: "risk",
    industries: ["cross"],
    name: { es: "Continuidad de negocio y resiliencia", en: "Business continuity and resiliency" },
    what: { es: "Qué se hace el día que el sistema principal cae.", en: "What happens the day the core system goes down." },
  },
  {
    id: "proc-credit-scoring",
    department: "risk",
    industries: ["banking"],
    name: { es: "Scoring crediticio y originación", en: "Credit scoring and origination" },
    what: { es: "Decidir a quién prestar y en qué términos.", en: "Decide who to lend to, and on what terms." },
    linkedUseCaseId: "bank-scoring",
  },
  {
    id: "proc-ecl",
    department: "risk",
    industries: ["banking"],
    name: { es: "Pérdida esperada y provisiones (IFRS 9)", en: "Expected credit loss provisioning (IFRS 9)" },
    what: { es: "Reservar hoy lo que probablemente no se va a cobrar.", en: "Reserve today what is unlikely to ever be collected." },
    linkedUseCaseId: "bank-ecl",
  },
  {
    id: "proc-aml",
    department: "risk",
    industries: ["banking"],
    name: { es: "Prevención de lavado de dinero (AML)", en: "Anti-money laundering (AML)" },
    what: { es: "Encontrar el patrón de transacciones que no debería existir.", en: "Find the transaction pattern that should not exist." },
    linkedUseCaseId: "bank-aml",
  },
  {
    id: "proc-collections",
    department: "risk",
    industries: ["banking"],
    name: { es: "Cobranza y recuperación", en: "Collections and recovery" },
    what: { es: "A quién le hablas primero cuando hay 50,000 cuentas vencidas.", en: "Who you call first when 50,000 accounts are past due." },
    linkedUseCaseId: "bank-collections",
  },
  {
    id: "proc-market-risk",
    department: "risk",
    industries: ["banking"],
    name: { es: "Riesgo de mercado y pruebas de estrés", en: "Market risk and stress testing" },
    what: { es: "Cuánto se pierde si el escenario adverso sí pasa.", en: "How much is lost if the adverse scenario actually happens." },
    linkedUseCaseId: "bank-market-risk",
  },
  {
    id: "proc-underwriting",
    department: "risk",
    industries: ["insurance"],
    name: { es: "Suscripción de riesgo", en: "Underwriting" },
    what: { es: "Decidir qué riesgo aceptar y a qué precio.", en: "Decide which risk to accept, and at what price." },
    linkedUseCaseId: "ins-underwriting",
  },
  {
    id: "proc-claims-fraud",
    department: "risk",
    industries: ["insurance"],
    name: { es: "Detección de fraude en siniestros", en: "Claims fraud detection" },
    what: { es: "El siniestro que se ve legítimo pero no lo es.", en: "The claim that looks legitimate and is not." },
    // Not linked to ins-claims: that built case is filed under Operations
    // (triage and settlement automation), not Risk. The fraud angle it also
    // touches does not make this Risk-side process the same one — linking it
    // here would tell the reader the same build serves two owners at once.
  },

  // -------------------------------------------------------------- commercial
  {
    id: "proc-pipeline",
    department: "commercial",
    industries: ["cross"],
    name: { es: "Gestión del embudo de ventas", en: "Sales pipeline management" },
    what: { es: "Saber qué oportunidad se va a cerrar y cuál no.", en: "Know which opportunity will close and which will not." },
    linkedUseCaseId: "cust-funnel",
  },
  {
    id: "proc-churn",
    department: "commercial",
    industries: ["cross"],
    name: { es: "Prevención de fuga de clientes", en: "Churn prevention" },
    what: { es: "Llamar al cliente antes de que se vaya, no después.", en: "Call the customer before they leave, not after." },
    linkedUseCaseId: "cust-churn",
  },
  {
    id: "proc-nba",
    department: "commercial",
    industries: ["cross", "retail", "banking", "telco"],
    name: { es: "Siguiente mejor acción / venta cruzada", en: "Next-best-action / cross-sell" },
    what: { es: "Qué ofrecerle a este cliente específico, no al promedio.", en: "What to offer this specific customer, not the average one." },
    linkedUseCaseId: "cust-nba",
  },
  {
    id: "proc-pricing",
    department: "commercial",
    industries: ["retail", "manufacturing", "telco"],
    name: { es: "Precios y cotización", en: "Pricing and quoting" },
    what: { es: "El precio que maximiza margen sin perder el trato.", en: "The price that maximises margin without losing the deal." },
    linkedUseCaseId: "prod-pricing",
  },
  {
    id: "proc-assortment",
    department: "commercial",
    industries: ["retail"],
    name: { es: "Surtido y catálogo (CATMAN)", en: "Assortment and catalogue (CATMAN)" },
    what: { es: "Qué producto va en cada tienda, y qué se saca.", en: "Which product goes in which store, and what gets dropped." },
    linkedUseCaseId: "prod-assortment",
  },
  {
    id: "proc-contracts",
    department: "commercial",
    industries: ["cross"],
    name: { es: "Gestión de contratos y órdenes", en: "Contract and order management" },
    what: { es: "Que lo que se firmó sea lo que se factura.", en: "What was signed should be what gets billed." },
  },
  {
    id: "proc-sales-forecast",
    department: "commercial",
    industries: ["cross"],
    name: { es: "Pronóstico de ventas", en: "Sales forecasting" },
    what: { es: "Cuánto se va a vender el próximo trimestre, no el deseado.", en: "How much will actually sell next quarter, not the wish." },
  },
  {
    id: "proc-key-accounts",
    department: "commercial",
    industries: ["cross"],
    name: { es: "Gestión de cuentas clave", en: "Key account management" },
    what: { es: "El 20% de clientes que produce el 80% del ingreso.", en: "The 20% of accounts that produce 80% of the revenue." },
  },

  // --------------------------------------------------------------- marketing
  {
    id: "proc-segmentation",
    department: "marketing",
    industries: ["cross", "retail", "banking", "telco"],
    name: { es: "Segmentación de clientes", en: "Customer segmentation" },
    what: { es: "Agrupar clientes por lo que realmente los distingue.", en: "Group customers by what actually tells them apart." },
    linkedUseCaseId: "cust-segmentation",
  },
  {
    id: "proc-voc",
    department: "marketing",
    industries: ["cross", "retail", "telco"],
    name: { es: "Voz del cliente y análisis de sentimiento", en: "Voice of customer and sentiment analysis" },
    what: { es: "Qué está diciendo el cliente que nadie está leyendo.", en: "What customers are saying that nobody is reading." },
    linkedUseCaseId: "cust-sentiment",
  },
  {
    id: "proc-basket",
    department: "marketing",
    industries: ["retail"],
    name: { es: "Análisis de canasta", en: "Basket analysis" },
    what: { es: "Qué se compra junto, para venderlo junto.", en: "What gets bought together, so it can be sold together." },
    linkedUseCaseId: "prod-basket",
  },
  {
    id: "proc-campaign-attribution",
    department: "marketing",
    industries: ["cross"],
    name: { es: "Desempeño y atribución de campañas", en: "Campaign performance and attribution" },
    what: { es: "Qué canal realmente produjo la venta.", en: "Which channel actually produced the sale." },
  },
  {
    id: "proc-marketing-mix",
    department: "marketing",
    industries: ["cross"],
    name: { es: "Optimización de mezcla de medios", en: "Marketing mix optimisation" },
    what: { es: "Dónde mueve más el siguiente dólar de pauta.", en: "Where the next ad dollar moves the needle most." },
  },
  {
    id: "proc-lead-scoring",
    department: "marketing",
    industries: ["cross"],
    name: { es: "Calificación de prospectos (lead scoring)", en: "Lead scoring" },
    what: { es: "A quién le llama ventas primero.", en: "Who sales calls first." },
  },
  {
    id: "proc-brand-tracking",
    department: "marketing",
    industries: ["cross"],
    name: { es: "Salud de marca", en: "Brand health tracking" },
    what: { es: "Si la marca está mejor o peor que hace un trimestre.", en: "Whether the brand is better or worse than a quarter ago." },
  },

  // -------------------------------------------------------------- operations
  {
    id: "proc-continuous-improvement",
    department: "operations",
    industries: ["cross"],
    name: { es: "Eficiencia de proceso y mejora continua", en: "Process efficiency and continuous improvement" },
    what: { es: "Encontrar dónde se pierde tiempo en el proceso.", en: "Find where the process is actually losing time." },
  },
  {
    id: "proc-predictive-maintenance",
    department: "operations",
    industries: ["manufacturing"],
    name: { es: "Mantenimiento predictivo", en: "Predictive maintenance" },
    what: { es: "Arreglar la máquina antes de que se pare sola.", en: "Fix the machine before it stops itself." },
    linkedUseCaseId: "mfg-maintenance",
  },
  {
    id: "proc-oee",
    department: "operations",
    industries: ["manufacturing"],
    name: { es: "Eficiencia general del equipo (OEE)", en: "Overall equipment effectiveness (OEE)" },
    what: { es: "Cuánto de la capacidad instalada de verdad se usa.", en: "How much of the installed capacity is actually used." },
    linkedUseCaseId: "mfg-oee",
  },
  {
    id: "proc-quality-control",
    department: "operations",
    industries: ["manufacturing"],
    name: { es: "Control de calidad", en: "Quality control" },
    what: { es: "Encontrar el defecto en la línea, no en la devolución.", en: "Catch the defect on the line, not in the return." },
    linkedUseCaseId: "mfg-quality",
  },
  {
    id: "proc-readmission",
    department: "operations",
    industries: ["healthcare"],
    name: { es: "Prevención de reingreso hospitalario", en: "Hospital readmission prevention" },
    what: { es: "Saber qué paciente va a volver antes de que vuelva.", en: "Know which patient will return before they do." },
    linkedUseCaseId: "health-readmission",
  },
  {
    id: "proc-scheduling",
    department: "operations",
    industries: ["healthcare"],
    name: { es: "Agenda y capacidad clínica", en: "Scheduling and clinical capacity" },
    what: { es: "No dejar camas ni quirófanos vacíos por mala agenda.", en: "Not leaving beds or operating rooms idle over bad scheduling." },
    linkedUseCaseId: "health-scheduling",
  },
  {
    id: "proc-claims-ops",
    department: "operations",
    industries: ["insurance"],
    name: { es: "Procesamiento operativo de siniestros", en: "Claims processing operations" },
    what: { es: "Del reporte al pago, sin que se atore en medio.", en: "From report to payout, without stalling in between." },
    linkedUseCaseId: "ins-claims",
  },
  {
    id: "proc-alerts",
    department: "operations",
    industries: ["cross"],
    name: { es: "Gestión de alertas e incidentes", en: "Alert and incident management" },
    what: { es: "Que la alerta que importa no se pierda entre 200 falsas.", en: "The alert that matters must not drown in 200 false ones." },
    linkedUseCaseId: "ops-alerts",
  },
  {
    id: "proc-sop-docs",
    department: "operations",
    industries: ["cross", "banking", "insurance", "healthcare"],
    name: { es: "Automatización documental y de procedimientos", en: "Document and procedure automation" },
    what: { es: "Que llenar el mismo formulario no le tome el día a alguien.", en: "Filling the same form should not eat someone's whole day." },
    linkedUseCaseId: "ops-docs",
  },
  {
    id: "proc-ops-copilot",
    department: "operations",
    industries: ["cross"],
    name: { es: "Copiloto operativo asistido por IA", en: "AI-assisted operations copilot" },
    what: { es: "Responder la pregunta operativa sin buscar en cinco sistemas.", en: "Answer the operational question without hunting five systems." },
    // The built case (ops-copilot) is filed under IT, not Operations — see
    // proc-ai-copilot-it below, where it is actually linked. Kept here
    // unlinked because the operational need is real even though DataRev's
    // catalogue currently files the build under the platform team that owns it.
  },

  // ------------------------------------------------------------ supplyChain
  {
    id: "proc-demand-planning",
    department: "supplyChain",
    industries: ["retail", "manufacturing", "logistics"],
    name: { es: "Planeación de demanda", en: "Demand planning" },
    what: { es: "Cuánto pedir para no quedarse corto ni sobrado.", en: "How much to order without running short or long." },
    linkedUseCaseId: "prod-demand",
  },
  {
    id: "proc-inventory",
    department: "supplyChain",
    industries: ["retail", "manufacturing", "logistics"],
    name: { es: "Gestión de inventario", en: "Inventory management" },
    what: { es: "El producto correcto, en el lugar correcto, sin exceso.", en: "The right product, in the right place, without excess." },
    linkedUseCaseId: "ops-inventory",
  },
  {
    id: "proc-routing",
    department: "supplyChain",
    industries: ["logistics", "retail", "manufacturing"],
    name: { es: "Optimización de rutas", en: "Route optimisation" },
    what: { es: "La ruta que entrega más con menos kilómetros.", en: "The route that delivers more with fewer kilometres." },
    linkedUseCaseId: "ops-routing",
  },
  {
    id: "proc-supplier",
    department: "supplyChain",
    industries: ["cross", "manufacturing", "retail"],
    name: { es: "Desempeño y riesgo de proveedores", en: "Supplier performance and risk" },
    what: { es: "Saber cuál proveedor va a fallar antes de que falle.", en: "Know which supplier will fail before it does." },
    linkedUseCaseId: "ops-supplier",
  },
  {
    id: "proc-procurement",
    department: "supplyChain",
    industries: ["cross"],
    name: { es: "Compras y abastecimiento", en: "Procurement and sourcing" },
    what: { es: "Comprar al mejor proveedor, no sólo al más barato hoy.", en: "Buy from the best supplier, not just the cheapest today." },
  },
  {
    id: "proc-warehouse",
    department: "supplyChain",
    industries: ["retail", "manufacturing", "logistics"],
    name: { es: "Gestión de almacén", en: "Warehouse management" },
    what: { es: "Encontrar y mover el producto sin caminar de más.", en: "Find and move product without walking further than needed." },
  },
  {
    id: "proc-production-planning",
    department: "supplyChain",
    industries: ["manufacturing"],
    name: { es: "Planeación y programación de producción", en: "Production planning and scheduling" },
    what: { es: "Qué se produce, en qué línea y en qué orden.", en: "What gets produced, on which line, in what order." },
  },

  // -------------------------------------------------------------------- hr
  {
    id: "proc-workforce-planning",
    department: "hr",
    industries: ["cross"],
    name: { es: "Planeación de plantilla", en: "Workforce planning" },
    what: { es: "Cuánta gente se necesita, y de qué perfil, en 6 meses.", en: "How many people are needed, and what profile, in 6 months." },
    linkedUseCaseId: "h2r-headcount",
  },
  {
    id: "proc-recruiting",
    department: "hr",
    industries: ["cross"],
    name: { es: "Reclutamiento y selección", en: "Recruiting and selection" },
    what: { es: "Llenar la vacante con la persona correcta, no la más rápida.", en: "Fill the role with the right person, not just the fastest one." },
    linkedUseCaseId: "h2r-recruiting",
  },
  {
    id: "proc-turnover",
    department: "hr",
    industries: ["cross"],
    name: { es: "Predicción de rotación", en: "Turnover prediction" },
    what: { es: "Saber quién se va a ir antes de que entregue la renuncia.", en: "Know who is about to quit before they hand in notice." },
    linkedUseCaseId: "h2r-turnover",
  },
  {
    id: "proc-compensation",
    department: "hr",
    industries: ["cross"],
    name: { es: "Compensación y beneficios", en: "Compensation and benefits" },
    what: { es: "Pagar competitivo sin salirse del presupuesto.", en: "Pay competitively without blowing the budget." },
  },
  {
    id: "proc-performance-mgmt",
    department: "hr",
    industries: ["cross"],
    name: { es: "Gestión del desempeño", en: "Performance management" },
    what: { es: "Que la evaluación diga algo distinto entre personas.", en: "The review should actually say something different person to person." },
  },
  {
    id: "proc-learning",
    department: "hr",
    industries: ["cross"],
    name: { es: "Capacitación y desarrollo", en: "Learning and development" },
    what: { es: "Cerrar la brecha de habilidad que sí importa.", en: "Close the skill gap that actually matters." },
  },
  {
    id: "proc-engagement",
    department: "hr",
    industries: ["cross"],
    name: { es: "Compromiso y clima laboral", en: "Employee engagement" },
    what: { es: "Saber si a la gente le importa antes de que deje de importarle.", en: "Know whether people still care before they stop caring." },
  },
  {
    id: "proc-succession",
    department: "hr",
    industries: ["cross"],
    name: { es: "Planeación de sucesión", en: "Succession planning" },
    what: { es: "Quién toma el puesto si la persona clave se va mañana.", en: "Who steps in if the key person leaves tomorrow." },
  },

  // -------------------------------------------------------------- service
  {
    id: "proc-support-resolution",
    department: "service",
    industries: ["cross"],
    name: { es: "Resolución de soporte al cliente", en: "Customer support resolution" },
    what: { es: "Resolver sin escalar a un humano cuando no hace falta.", en: "Resolve it without escalating to a human when it does not need one." },
    linkedUseCaseId: "cust-support-agent",
  },
  {
    id: "proc-ticket-routing",
    department: "service",
    industries: ["cross"],
    name: { es: "Enrutamiento y priorización de casos", en: "Case routing and prioritisation" },
    what: { es: "Que el caso urgente no espere en la misma fila que el trivial.", en: "The urgent case should not wait in the same queue as the trivial one." },
  },
  {
    id: "proc-sla-csat",
    department: "service",
    industries: ["cross"],
    name: { es: "Monitoreo de SLA y satisfacción", en: "SLA and satisfaction monitoring" },
    what: { es: "Saber si se está cumpliendo la promesa de servicio.", en: "Know whether the service promise is actually being kept." },
  },
  {
    id: "proc-self-service",
    department: "service",
    industries: ["cross"],
    name: { es: "Autoservicio y base de conocimiento", en: "Self-service and knowledge base" },
    what: { es: "Que el cliente resuelva solo lo que no necesita a alguien.", en: "Let the customer solve alone what does not need a person." },
  },
  {
    id: "proc-field-service",
    department: "service",
    industries: ["manufacturing", "telco", "logistics"],
    name: { es: "Servicio en campo y despacho", en: "Field service and dispatch" },
    what: { es: "Mandar al técnico correcto, con la parte correcta, la primera vez.", en: "Send the right technician, with the right part, the first time." },
  },
  {
    id: "proc-complaints",
    department: "service",
    industries: ["cross"],
    name: { es: "Gestión de quejas", en: "Complaint management" },
    what: { es: "Que la queja repetida se detecte como patrón, no como ruido.", en: "A repeated complaint should read as a pattern, not as noise." },
  },
  {
    id: "proc-warranty",
    department: "service",
    industries: ["retail", "manufacturing"],
    name: { es: "Garantías y devoluciones", en: "Warranty and returns" },
    what: { es: "Procesar la devolución sin que cueste más que el producto.", en: "Process the return without it costing more than the product." },
  },

  // ------------------------------------------------------------------- it
  {
    id: "proc-network-ops",
    department: "it",
    industries: ["telco"],
    name: { es: "Operación y monitoreo de red", en: "Network operations and monitoring" },
    what: { es: "Detectar la degradación de red antes de que el cliente llame.", en: "Catch network degradation before the customer calls in." },
    linkedUseCaseId: "telco-network",
  },
  {
    id: "proc-ai-copilot-it",
    department: "it",
    industries: ["cross"],
    name: { es: "Copiloto interno asistido por IA", en: "AI-assisted internal copilot" },
    what: { es: "Que encontrar la respuesta no dependa de saber a quién preguntar.", en: "Finding the answer should not depend on knowing who to ask." },
    linkedUseCaseId: "ops-copilot",
  },
  {
    id: "proc-data-platform",
    department: "it",
    industries: ["cross"],
    name: { es: "Confiabilidad de la plataforma de datos", en: "Data platform reliability" },
    what: { es: "Que el tablero no salga mal por una carga que falló en silencio.", en: "The dashboard should not go wrong from a silently failed load." },
  },
  {
    id: "proc-access-mgmt",
    department: "it",
    industries: ["cross"],
    name: { es: "Gestión de accesos e identidad", en: "Access and identity management" },
    what: { es: "Que sólo quien debe ver un dato pueda verlo.", en: "Only the people who should see a piece of data can see it." },
  },
  {
    id: "proc-app-portfolio",
    department: "it",
    industries: ["cross"],
    name: { es: "Gestión del portafolio de aplicaciones", en: "Application portfolio management" },
    what: { es: "Saber qué sistema es legado antes de que se caiga.", en: "Know which system is legacy before it falls over." },
  },
  {
    id: "proc-it-service-mgmt",
    department: "it",
    industries: ["cross"],
    name: { es: "Gestión de servicios de TI (ITSM)", en: "IT service management (ITSM)" },
    what: { es: "Resolver el ticket de TI sin que se pierda en la cola.", en: "Resolve the IT ticket without it getting lost in the queue." },
  },
];

/**
 * The top N processes for a filter, industry-relevant ones first.
 *
 * A process tagged to the chosen industry outranks a `cross` one — a banking
 * client filtering by Risk should see AML before "enterprise risk assessment"
 * even though both apply. Ties keep catalogue order, which is itself grouped
 * by department for readability.
 */
export function topProcesses(
  industry: Industry | "all",
  department: Department | "all",
  limit = 10,
): BusinessProcess[] {
  const matches = BUSINESS_PROCESSES.filter(
    (p) =>
      (department === "all" || p.department === department) &&
      (industry === "all" ||
        industry === "cross" ||
        p.industries.includes("cross") ||
        p.industries.includes(industry)),
  );

  const specific = matches.filter(
    (p) => industry !== "all" && industry !== "cross" && p.industries.includes(industry),
  );
  const generic = matches.filter((p) => !specific.includes(p));

  return [...specific, ...generic].slice(0, limit);
}
