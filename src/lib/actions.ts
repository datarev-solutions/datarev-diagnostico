import type { DimensionId, L, Level } from "./framework";

/**
 * One action moves a dimension from `fromLevel` to `fromLevel + 1`.
 * Impact and effort are 1..5 and drive prioritisation and the quadrant chart.
 */
export interface ActionTemplate {
  id: string;
  dimension: DimensionId;
  fromLevel: Exclude<Level, 5>;
  title: L;
  description: L;
  impact: 1 | 2 | 3 | 4 | 5;
  effort: 1 | 2 | 3 | 4 | 5;
  owner: L;
  kpi: L;
}

export const ACTIONS: ActionTemplate[] = [
  // ---------------------------------------------------------------- Strategy
  {
    id: "strategy-1-2",
    dimension: "strategy",
    fromLevel: 1,
    title: {
      es: "Inventariar los usos de IA que ya existen",
      en: "Inventory the AI uses that already exist",
    },
    description: {
      es: "Levantar en 3 semanas todo lo que ya se hace con IA en la empresa, incluido lo no autorizado. Sin esta foto no hay estrategia posible, sólo suposiciones.",
      en: "Map, in three weeks, everything already being done with AI across the company, including unsanctioned use. Without that picture there is no strategy, only assumptions.",
    },
    impact: 4,
    effort: 2,
    owner: { es: "Tecnología / Innovación", en: "Technology / Innovation" },
    kpi: {
      es: "Número de iniciativas y herramientas registradas",
      en: "Number of initiatives and tools registered",
    },
  },
  {
    id: "strategy-2-3",
    dimension: "strategy",
    fromLevel: 2,
    title: {
      es: "Aprobar y comunicar una estrategia de IA de una página",
      en: "Approve and communicate a one-page AI strategy",
    },
    description: {
      es: "Definir dónde compite la empresa con IA, qué no va a hacer, y quién responde. Una página aprobada por el comité vale más que un documento de 60 que nadie lee.",
      en: "Define where the company competes with AI, what it will not do, and who is accountable. One page approved by the committee beats a 60-page document nobody reads.",
    },
    impact: 5,
    effort: 3,
    owner: { es: "Dirección General / Comité", en: "CEO / Executive committee" },
    kpi: {
      es: "Estrategia aprobada y comunicada al 100% de los líderes",
      en: "Strategy approved and communicated to 100% of leaders",
    },
  },
  {
    id: "strategy-3-4",
    dimension: "strategy",
    fromLevel: 3,
    title: {
      es: "Cuantificar el valor esperado de cada iniciativa del portafolio",
      en: "Quantify expected value for every portfolio initiative",
    },
    description: {
      es: "Cada caso de uso debe declarar el indicador de negocio que mueve y en cuánto. Es la compuerta que separa el portafolio real del teatro de innovación.",
      en: "Every use case must state which business indicator it moves and by how much. This is the gate that separates a real portfolio from innovation theatre.",
    },
    impact: 5,
    effort: 3,
    owner: { es: "Estrategia + Finanzas", en: "Strategy + Finance" },
    kpi: {
      es: "% del portafolio con caso de negocio cuantificado",
      en: "% of portfolio with a quantified business case",
    },
  },
  {
    id: "strategy-4-5",
    dimension: "strategy",
    fromLevel: 4,
    title: {
      es: "Rebalancear el portafolio cada trimestre con evidencia",
      en: "Rebalance the portfolio quarterly against evidence",
    },
    description: {
      es: "Instalar una revisión trimestral que mueva presupuesto de lo que no funcionó a lo que sí, con la autoridad para cancelar.",
      en: "Install a quarterly review that shifts budget from what did not work to what did, with the authority to cancel.",
    },
    impact: 4,
    effort: 3,
    owner: { es: "Comité de IA", en: "AI committee" },
    kpi: {
      es: "% de presupuesto reasignado por evidencia de resultados",
      en: "% of budget reallocated on outcome evidence",
    },
  },

  // -------------------------------------------------------------- Governance
  {
    id: "governance-1-2",
    dimension: "governance",
    fromLevel: 1,
    title: {
      es: "Publicar una política de uso aceptable de IA",
      en: "Publish an acceptable-use policy for AI",
    },
    description: {
      es: "Una página: qué herramientas están aprobadas, qué datos nunca se pegan en un modelo externo, y a quién se pregunta. Es la acción de mayor retorno por esfuerzo de todo el diagnóstico.",
      en: "One page: which tools are approved, which data never goes into an external model, and who to ask. The highest return-per-effort action in the whole assessment.",
    },
    impact: 5,
    effort: 1,
    owner: { es: "Legal + Seguridad", en: "Legal + Security" },
    kpi: {
      es: "% de empleados que acusaron recibo de la política",
      en: "% of employees who acknowledged the policy",
    },
  },
  {
    id: "governance-2-3",
    dimension: "governance",
    fromLevel: 2,
    title: {
      es: "Construir el inventario de sistemas de IA",
      en: "Build the AI system inventory",
    },
    description: {
      es: "Un registro con dueño, propósito, datos que consume y decisión que afecta. Es el prerrequisito de cualquier certificación y de cualquier respuesta regulatoria.",
      en: "A register with owner, purpose, data consumed and decision affected. It is the prerequisite for any certification and any regulatory response.",
    },
    impact: 4,
    effort: 3,
    owner: { es: "Riesgo + Tecnología", en: "Risk + Technology" },
    kpi: {
      es: "Número de sistemas inventariados con dueño asignado",
      en: "Number of systems inventoried with an assigned owner",
    },
  },
  {
    id: "governance-3-4",
    dimension: "governance",
    fromLevel: 3,
    title: {
      es: "Clasificar riesgo por caso de uso y mapear controles a un marco",
      en: "Classify risk per use case and map controls to a framework",
    },
    description: {
      es: "Asignar nivel de riesgo a cada sistema y mapear los controles a NIST AI RMF o ISO/IEC 42001, de modo que la evidencia ya exista cuando llegue el auditor o el regulador.",
      en: "Assign a risk level to every system and map controls to NIST AI RMF or ISO/IEC 42001, so the evidence already exists when the auditor or regulator arrives.",
    },
    impact: 5,
    effort: 4,
    owner: { es: "Riesgo + Cumplimiento", en: "Risk + Compliance" },
    kpi: {
      es: "% de sistemas de alto riesgo con controles auditados",
      en: "% of high-risk systems with audited controls",
    },
  },
  {
    id: "governance-4-5",
    dimension: "governance",
    fromLevel: 4,
    title: {
      es: "Automatizar la verificación de política en el despliegue",
      en: "Automate policy verification at deployment",
    },
    description: {
      es: "Convertir la política en pruebas que corren en el pipeline y bloquean lo que no cumple, para que el gobierno deje de depender de la disciplina de cada equipo.",
      en: "Turn policy into tests that run in the pipeline and block what does not comply, so governance stops depending on each team's discipline.",
    },
    impact: 4,
    effort: 4,
    owner: { es: "Plataforma + Riesgo", en: "Platform + Risk" },
    kpi: {
      es: "% de despliegues con verificación automática de política",
      en: "% of deployments with automated policy checks",
    },
  },

  // -------------------------------------------------------------------- Data
  {
    id: "data-1-2",
    dimension: "data",
    fromLevel: 1,
    title: {
      es: "Documentar los 10 conjuntos de datos críticos",
      en: "Document the 10 critical datasets",
    },
    description: {
      es: "Elegir los diez datasets que sostienen las decisiones más importantes y documentar dueño, definición, frecuencia y calidad conocida. Acotado y suficiente para desbloquear los primeros casos.",
      en: "Pick the ten datasets underpinning the most important decisions and document owner, definition, frequency and known quality. Bounded, and enough to unblock the first use cases.",
    },
    impact: 4,
    effort: 2,
    owner: { es: "Gobierno de Datos", en: "Data Governance" },
    kpi: {
      es: "10 datasets con dueño y definición publicada",
      en: "10 datasets with a published owner and definition",
    },
  },
  {
    id: "data-2-3",
    dimension: "data",
    fromLevel: 2,
    title: {
      es: "Implantar catálogo de datos empresarial con linaje",
      en: "Roll out an enterprise data catalogue with lineage",
    },
    description: {
      es: "Un catálogo único, con propietario por dominio y linaje hasta el consumo. Sin esto cada proyecto de IA vuelve a pagar el costo de descubrir los datos desde cero.",
      en: "A single catalogue, with a domain owner and lineage through to consumption. Without it every AI project pays the discovery cost from scratch again.",
    },
    impact: 5,
    effort: 4,
    owner: { es: "Gobierno de Datos", en: "Data Governance" },
    kpi: {
      es: "% de dominios críticos catalogados con linaje",
      en: "% of critical domains catalogued with lineage",
    },
  },
  {
    id: "data-3-4",
    dimension: "data",
    fromLevel: 3,
    title: {
      es: "Monitorear calidad con umbrales, alertas y dueño",
      en: "Monitor quality with thresholds, alerts and an owner",
    },
    description: {
      es: "Instrumentar reglas de calidad sobre los dominios críticos con umbrales que alerten al dueño antes de que el error llegue al modelo o al tablero directivo.",
      en: "Instrument quality rules over critical domains with thresholds that alert the owner before the error reaches the model or the executive dashboard.",
    },
    impact: 5,
    effort: 3,
    owner: { es: "Ingeniería de Datos", en: "Data Engineering" },
    kpi: {
      es: "% de datasets críticos con monitoreo activo",
      en: "% of critical datasets under active monitoring",
    },
  },
  {
    id: "data-4-5",
    dimension: "data",
    fromLevel: 4,
    title: {
      es: "Publicar dominios críticos como productos de datos",
      en: "Publish critical domains as data products",
    },
    description: {
      es: "Cada dominio crítico se publica con contrato, SLA, versionado y soporte, de modo que consumirlo sea tan predecible como consumir una API externa madura.",
      en: "Each critical domain ships with a contract, SLA, versioning and support, so consuming it is as predictable as consuming a mature external API.",
    },
    impact: 4,
    effort: 4,
    owner: { es: "Dominios de negocio", en: "Business domains" },
    kpi: {
      es: "Número de productos de datos con contrato y SLA",
      en: "Number of data products with a contract and SLA",
    },
  },

  // -------------------------------------------------------------- Technology
  {
    id: "technology-1-2",
    dimension: "technology",
    fromLevel: 1,
    title: {
      es: "Estandarizar entorno de desarrollo y control de versiones",
      en: "Standardise the development environment and version control",
    },
    description: {
      es: "Un entorno común y todo el código en repositorio. Suena básico, pero es lo que permite que el trabajo sobreviva a la salida de la persona que lo escribió.",
      en: "One common environment and all code in a repository. It sounds basic, but it is what lets the work survive the departure of whoever wrote it.",
    },
    impact: 3,
    effort: 2,
    owner: { es: "Ingeniería", en: "Engineering" },
    kpi: {
      es: "% de proyectos de IA en el repositorio estándar",
      en: "% of AI projects in the standard repository",
    },
  },
  {
    id: "technology-2-3",
    dimension: "technology",
    fromLevel: 2,
    title: {
      es: "Desplegar plataforma MLOps/LLMOps con CI/CD",
      en: "Deploy an MLOps/LLMOps platform with CI/CD",
    },
    description: {
      es: "Una plataforma que cubra desarrollo, despliegue y monitoreo, con ambientes separados. Es la diferencia entre pilotos que se demuestran y sistemas que operan.",
      en: "A platform covering development, deployment and monitoring, with separated environments. It is the difference between pilots you demo and systems you run.",
    },
    impact: 5,
    effort: 4,
    owner: { es: "Plataforma / Ingeniería", en: "Platform / Engineering" },
    kpi: {
      es: "% de modelos desplegados por pipeline automatizado",
      en: "% of models deployed through the automated pipeline",
    },
  },
  {
    id: "technology-3-4",
    dimension: "technology",
    fromLevel: 3,
    title: {
      es: "Instrumentar evaluación continua y observabilidad",
      en: "Instrument continuous evaluation and observability",
    },
    description: {
      es: "Medir en producción costo, latencia, deriva y calidad de salida, con alertas por umbral. En sistemas GenAI la degradación es silenciosa: si no se mide, no se nota hasta que lo nota el cliente.",
      en: "Measure cost, latency, drift and output quality in production, with threshold alerts. In GenAI systems degradation is silent: if it is not measured, nobody notices until the customer does.",
    },
    impact: 5,
    effort: 3,
    owner: { es: "Plataforma", en: "Platform" },
    kpi: {
      es: "% de sistemas en producción con evaluación continua",
      en: "% of production systems under continuous evaluation",
    },
  },
  {
    id: "technology-4-5",
    dimension: "technology",
    fromLevel: 4,
    title: {
      es: "Automatizar ruteo de modelos y reentrenamiento por umbral",
      en: "Automate model routing and threshold-driven retraining",
    },
    description: {
      es: "Que la plataforma elija modelo por costo y calidad y dispare reentrenamiento sola cuando cruza un umbral, sin ticket de por medio.",
      en: "Let the platform pick the model on cost and quality and trigger retraining itself when a threshold is crossed, with no ticket in between.",
    },
    impact: 3,
    effort: 4,
    owner: { es: "Plataforma", en: "Platform" },
    kpi: {
      es: "% de reentrenamientos disparados automáticamente",
      en: "% of retrainings triggered automatically",
    },
  },

  // ------------------------------------------------------------------ Talent
  {
    id: "talent-1-2",
    dimension: "talent",
    fromLevel: 1,
    title: {
      es: "Nombrar responsables de IA por área y mapear habilidades",
      en: "Name AI owners per unit and map existing skills",
    },
    description: {
      es: "Identificar quién responde por IA en cada área y levantar qué habilidades ya existen. Casi siempre hay más capacidad interna de la que la dirección cree.",
      en: "Identify who owns AI in each unit and survey the skills that already exist. There is almost always more internal capability than leadership assumes.",
    },
    impact: 4,
    effort: 1,
    owner: { es: "Recursos Humanos", en: "Human Resources" },
    kpi: {
      es: "% de áreas con responsable de IA nombrado",
      en: "% of units with a named AI owner",
    },
  },
  {
    id: "talent-2-3",
    dimension: "talent",
    fromLevel: 2,
    title: {
      es: "Definir catálogo de roles y formación básica para toda la plantilla",
      en: "Define a role catalogue and basic training for all staff",
    },
    description: {
      es: "Definir los roles que la empresa necesita y dar formación básica transversal, para que la conversación sobre IA deje de ocurrir sólo entre especialistas.",
      en: "Define the roles the company needs and deliver cross-cutting basic training, so the AI conversation stops happening only among specialists.",
    },
    impact: 4,
    effort: 3,
    owner: { es: "Recursos Humanos", en: "Human Resources" },
    kpi: {
      es: "% de la plantilla con formación básica completada",
      en: "% of staff who completed basic training",
    },
  },
  {
    id: "talent-3-4",
    dimension: "talent",
    fromLevel: 3,
    title: {
      es: "Formación por rol con evaluación de competencias",
      en: "Role-based training with competency assessment",
    },
    description: {
      es: "Pasar de formación genérica a currículos por rol, con evaluación que revele la brecha real y ruta de carrera asociada.",
      en: "Move from generic training to role-specific curricula, with assessment that reveals the real gap and an associated career path.",
    },
    impact: 4,
    effort: 3,
    owner: { es: "Recursos Humanos", en: "Human Resources" },
    kpi: {
      es: "Brecha de competencias medida y reducida",
      en: "Competency gap measured and reduced",
    },
  },
  {
    id: "talent-4-5",
    dimension: "talent",
    fromLevel: 4,
    title: {
      es: "Movilidad interna y comunidades de práctica",
      en: "Internal mobility and communities of practice",
    },
    description: {
      es: "Abrir rutas de movilidad hacia roles de IA y sostener comunidades de práctica que hagan circular el aprendizaje sin pasar por un programa formal.",
      en: "Open mobility routes into AI roles and sustain communities of practice that circulate learning without going through a formal programme.",
    },
    impact: 3,
    effort: 3,
    owner: { es: "Recursos Humanos", en: "Human Resources" },
    kpi: {
      es: "Movimientos internos hacia roles de IA por año",
      en: "Internal moves into AI roles per year",
    },
  },

  // ----------------------------------------------------------------- Culture
  {
    id: "culture-1-2",
    dimension: "culture",
    fromLevel: 1,
    title: {
      es: "Habilitar herramientas aprobadas y decir qué sí y qué no",
      en: "Enable approved tools and say what is and is not allowed",
    },
    description: {
      es: "El 'shadow AI' no se combate prohibiendo, se combate dando una alternativa aprobada que sea mejor. Habilitar herramientas y comunicar los límites elimina la mayor parte del riesgo en semanas.",
      en: "Shadow AI is not beaten by banning it, but by offering a better sanctioned alternative. Enabling tools and communicating limits removes most of the risk in weeks.",
    },
    impact: 5,
    effort: 2,
    owner: { es: "Tecnología + Comunicación", en: "Technology + Communications" },
    kpi: {
      es: "% de usuarios activos en herramientas aprobadas",
      en: "% of active users on approved tools",
    },
  },
  {
    id: "culture-2-3",
    dimension: "culture",
    fromLevel: 2,
    title: {
      es: "Programa de cambio con casos visibles de la propia empresa",
      en: "Change programme built on the company's own visible cases",
    },
    description: {
      es: "Nada convence más que ver a un colega del mismo puesto ahorrando horas reales. Documentar y difundir tres casos internos supera cualquier campaña genérica.",
      en: "Nothing convinces like seeing a peer in the same job save real hours. Documenting and broadcasting three internal cases beats any generic campaign.",
    },
    impact: 4,
    effort: 3,
    owner: { es: "Comunicación + Áreas", en: "Communications + Business units" },
    kpi: {
      es: "Casos internos documentados y difundidos",
      en: "Internal cases documented and shared",
    },
  },
  {
    id: "culture-3-4",
    dimension: "culture",
    fromLevel: 3,
    title: {
      es: "Medir adopción por área y alinear incentivos",
      en: "Measure adoption per unit and align incentives",
    },
    description: {
      es: "Medir uso real por área y ligar el uso responsable a los objetivos de los líderes. Lo que no entra en la evaluación del jefe no sobrevive al trimestre.",
      en: "Measure real usage per unit and tie responsible use to leaders' objectives. What is not in the manager's review does not survive the quarter.",
    },
    impact: 4,
    effort: 3,
    owner: { es: "Recursos Humanos + Dirección", en: "HR + Leadership" },
    kpi: {
      es: "Adopción activa mensual por área",
      en: "Monthly active adoption per unit",
    },
  },
  {
    id: "culture-4-5",
    dimension: "culture",
    fromLevel: 4,
    title: {
      es: "Ceder a los equipos el rediseño de sus procesos",
      en: "Hand process redesign over to the teams",
    },
    description: {
      es: "Dar a los equipos presupuesto y permiso para rediseñar su propio trabajo con IA. Es el punto donde la mejora deja de depender de un programa central.",
      en: "Give teams budget and permission to redesign their own work with AI. This is where improvement stops depending on a central programme.",
    },
    impact: 4,
    effort: 4,
    owner: { es: "Líderes de área", en: "Unit leaders" },
    kpi: {
      es: "Procesos rediseñados por iniciativa del propio equipo",
      en: "Processes redesigned on the team's own initiative",
    },
  },

  // --------------------------------------------------------------- Operating
  {
    id: "operating-1-2",
    dimension: "operating",
    fromLevel: 1,
    title: {
      es: "Abrir un intake único para solicitudes de IA",
      en: "Open a single intake for AI requests",
    },
    description: {
      es: "Un formulario y un responsable que reciba todas las ideas. Barato, rápido, y convierte la demanda invisible en un portafolio que se puede priorizar.",
      en: "One form and one owner receiving every idea. Cheap, fast, and it turns invisible demand into a portfolio you can prioritise.",
    },
    impact: 4,
    effort: 1,
    owner: { es: "Oficina de IA / PMO", en: "AI office / PMO" },
    kpi: {
      es: "% de iniciativas que entran por el intake formal",
      en: "% of initiatives entering through the formal intake",
    },
  },
  {
    id: "operating-2-3",
    dimension: "operating",
    fromLevel: 2,
    title: {
      es: "Estandarizar el proceso de idea a producción",
      en: "Standardise the idea-to-production process",
    },
    description: {
      es: "Documentar las etapas y las compuertas de calidad, riesgo y datos, para que cada iniciativa no vuelva a negociar su propio camino.",
      en: "Document the stages and the quality, risk and data gates, so each initiative stops negotiating its own path.",
    },
    impact: 4,
    effort: 3,
    owner: { es: "Oficina de IA / PMO", en: "AI office / PMO" },
    kpi: {
      es: "Tiempo medio de idea a producción",
      en: "Median time from idea to production",
    },
  },
  {
    id: "operating-3-4",
    dimension: "operating",
    fromLevel: 3,
    title: {
      es: "Equipos multidisciplinarios permanentes con riesgo embebido",
      en: "Permanent multidisciplinary teams with risk embedded",
    },
    description: {
      es: "Negocio, datos, ingeniería y riesgo en el mismo equipo y con la misma meta. Elimina el ciclo de aprobaciones que hace que un caso tarde meses en salir.",
      en: "Business, data, engineering and risk in one team with one goal. It removes the approval loop that makes a use case take months to ship.",
    },
    impact: 5,
    effort: 4,
    owner: { es: "Dirección de Operaciones", en: "Operations leadership" },
    kpi: {
      es: "% de iniciativas entregadas por equipos permanentes",
      en: "% of initiatives delivered by permanent teams",
    },
  },
  {
    id: "operating-4-5",
    dimension: "operating",
    fromLevel: 4,
    title: {
      es: "Gestionar el ciclo de vida completo por métricas",
      en: "Manage the full lifecycle by metrics",
    },
    description: {
      es: "Definir criterios automáticos de retiro y reemplazo por valor, costo y riesgo, para que el inventario no acumule sistemas que ya nadie usa ni vigila.",
      en: "Define automatic retirement and replacement criteria on value, cost and risk, so the inventory stops accumulating systems nobody uses or watches.",
    },
    impact: 3,
    effort: 3,
    owner: { es: "Oficina de IA", en: "AI office" },
    kpi: {
      es: "Sistemas retirados o reemplazados por criterio explícito",
      en: "Systems retired or replaced on explicit criteria",
    },
  },

  // ------------------------------------------------------------- Measurement
  {
    id: "measurement-1-2",
    dimension: "measurement",
    fromLevel: 1,
    title: {
      es: "Exigir línea base antes de aprobar cualquier iniciativa",
      en: "Require a baseline before approving any initiative",
    },
    description: {
      es: "Ninguna iniciativa se aprueba sin declarar el valor actual del indicador que pretende mover. Cuesta casi nada y es lo único que después permite demostrar el beneficio.",
      en: "No initiative gets approved without stating the current value of the indicator it aims to move. It costs almost nothing and is the only thing that later proves the benefit.",
    },
    impact: 5,
    effort: 1,
    owner: { es: "Finanzas / Control de Gestión", en: "Finance / Controlling" },
    kpi: {
      es: "% de iniciativas aprobadas con línea base declarada",
      en: "% of approved initiatives with a stated baseline",
    },
  },
  {
    id: "measurement-2-3",
    dimension: "measurement",
    fromLevel: 2,
    title: {
      es: "Definir un marco común de métricas de valor y adopción",
      en: "Define a shared framework of value and adoption metrics",
    },
    description: {
      es: "Un conjunto acotado de métricas comunes (valor, adopción, calidad, riesgo) aplicables a cualquier caso, para poder comparar iniciativas entre sí.",
      en: "A bounded set of shared metrics (value, adoption, quality, risk) that apply to any case, so initiatives can be compared with each other.",
    },
    impact: 4,
    effort: 2,
    owner: { es: "Oficina de IA + Finanzas", en: "AI office + Finance" },
    kpi: {
      es: "% de iniciativas reportando el marco común",
      en: "% of initiatives reporting the shared framework",
    },
  },
  {
    id: "measurement-3-4",
    dimension: "measurement",
    fromLevel: 3,
    title: {
      es: "Publicar un tablero de KPIs de IA para dirección",
      en: "Publish an AI KPI dashboard for leadership",
    },
    description: {
      es: "Un tablero con valor capturado, adopción, costo y riesgo, revisado en comité. Lo que la dirección ve todos los meses es lo que la organización termina atendiendo.",
      en: "A dashboard with captured value, adoption, cost and risk, reviewed in committee. What leadership sees monthly is what the organisation ends up attending to.",
    },
    impact: 5,
    effort: 3,
    owner: { es: "Oficina de IA", en: "AI office" },
    kpi: {
      es: "Tablero revisado mensualmente por el comité",
      en: "Dashboard reviewed monthly by the committee",
    },
  },
  {
    id: "measurement-4-5",
    dimension: "measurement",
    fromLevel: 4,
    title: {
      es: "Auditar valor prometido contra valor capturado",
      en: "Audit promised value against captured value",
    },
    description: {
      es: "Contrastar formalmente, con finanzas, lo que cada iniciativa prometió contra lo que entregó, y usar ese resultado para calibrar el presupuesto del año siguiente.",
      en: "Formally reconcile, with finance, what each initiative promised against what it delivered, and use the result to calibrate next year's budget.",
    },
    impact: 4,
    effort: 3,
    owner: { es: "Finanzas + Auditoría", en: "Finance + Audit" },
    kpi: {
      es: "% del portafolio auditado contra la promesa original",
      en: "% of portfolio audited against the original promise",
    },
  },
];

export const ACTIONS_BY_DIMENSION = ACTIONS.reduce<
  Record<string, ActionTemplate[]>
>((accumulator, action) => {
  const bucket = accumulator[action.dimension] ?? [];
  bucket.push(action);
  accumulator[action.dimension] = bucket;
  return accumulator;
}, {});
