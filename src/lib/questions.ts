import type { DimensionId, L, Level } from "./framework";

export interface Question {
  id: string;
  dimension: DimensionId;
  /** Included in the 16-question Express run. */
  express: boolean;
  text: L;
  /** Behavioural anchor for each maturity level. Anchors, not agreement scales. */
  anchors: Record<Level, L>;
}

const q = (
  id: string,
  dimension: DimensionId,
  express: boolean,
  text: L,
  a1: L,
  a2: L,
  a3: L,
  a4: L,
  a5: L,
): Question => ({
  id,
  dimension,
  express,
  text,
  anchors: { 1: a1, 2: a2, 3: a3, 4: a4, 5: a5 },
});

export const QUESTIONS: Question[] = [
  // ---------------------------------------------------------------- Strategy
  q(
    "strategy-1",
    "strategy",
    true,
    {
      es: "¿Existe una estrategia de IA documentada y aprobada por la dirección?",
      en: "Is there a documented AI strategy approved by leadership?",
    },
    { es: "No existe nada escrito.", en: "Nothing is written down." },
    {
      es: "Algunas áreas tienen su propio plan, sin visión común.",
      en: "Some units have their own plan, with no shared view.",
    },
    {
      es: "Existe una estrategia empresarial aprobada y comunicada.",
      en: "An approved enterprise strategy exists and is communicated.",
    },
    {
      es: "La estrategia tiene metas medibles y presupuesto asignado.",
      en: "The strategy has measurable goals and an allocated budget.",
    },
    {
      es: "Se revisa cada trimestre y ha cambiado el modelo de negocio.",
      en: "It is reviewed quarterly and has changed the business model.",
    },
  ),
  q(
    "strategy-2",
    "strategy",
    false,
    {
      es: "¿Cómo se priorizan y financian las iniciativas de IA?",
      en: "How are AI initiatives prioritised and funded?",
    },
    {
      es: "Quien consigue presupuesto, lo hace. No hay criterio.",
      en: "Whoever finds budget proceeds. There is no criterion.",
    },
    {
      es: "Cada área decide con su propio criterio.",
      en: "Each unit decides using its own criterion.",
    },
    {
      es: "Existe un criterio común de priorización de casos de uso.",
      en: "A shared use-case prioritisation criterion exists.",
    },
    {
      es: "Se priorizan por valor esperado y riesgo, con portafolio revisado.",
      en: "Prioritised by expected value and risk, with a reviewed portfolio.",
    },
    {
      es: "El portafolio se rebalancea de forma continua según resultados reales.",
      en: "The portfolio is continuously rebalanced against actual results.",
    },
  ),
  q(
    "strategy-3",
    "strategy",
    true,
    {
      es: "¿Qué tan alineados están los casos de uso de IA con los objetivos del negocio?",
      en: "How aligned are AI use cases with business objectives?",
    },
    {
      es: "Son experimentos técnicos sin dueño de negocio.",
      en: "They are technical experiments with no business owner.",
    },
    {
      es: "Algunos responden a una necesidad real de un área.",
      en: "Some respond to a real need from one unit.",
    },
    {
      es: "Todos los casos se ligan a un objetivo declarado.",
      en: "Every case is tied to a stated objective.",
    },
    {
      es: "Se cuantifica el impacto esperado sobre indicadores del negocio.",
      en: "Expected impact on business indicators is quantified.",
    },
    {
      es: "La IA define nuevos objetivos, no sólo los apoya.",
      en: "AI sets new objectives rather than only supporting them.",
    },
  ),
  q(
    "strategy-4",
    "strategy",
    false,
    {
      es: "¿Quién responde por los resultados de la IA a nivel ejecutivo?",
      en: "Who is accountable for AI outcomes at executive level?",
    },
    { es: "Nadie en particular.", en: "Nobody in particular." },
    {
      es: "TI o innovación lo asume de facto.",
      en: "IT or innovation takes it on by default.",
    },
    {
      es: "Hay un responsable ejecutivo nombrado formalmente.",
      en: "A formally named executive owner exists.",
    },
    {
      es: "El responsable rinde cuentas con métricas ante el comité.",
      en: "The owner reports against metrics to the committee.",
    },
    {
      es: "La responsabilidad está distribuida entre líderes de negocio con metas propias.",
      en: "Accountability is distributed across business leaders with their own targets.",
    },
  ),
  q(
    "strategy-5",
    "strategy",
    false,
    {
      es: "¿Con qué frecuencia se revisa y actualiza la estrategia de IA?",
      en: "How often is the AI strategy reviewed and updated?",
    },
    { es: "Nunca se ha revisado.", en: "It has never been reviewed." },
    {
      es: "Se revisa cuando surge un problema.",
      en: "It is reviewed when a problem appears.",
    },
    {
      es: "Se revisa en el ciclo anual de planeación.",
      en: "It is reviewed in the annual planning cycle.",
    },
    {
      es: "Se revisa trimestralmente con datos de desempeño.",
      en: "It is reviewed quarterly using performance data.",
    },
    {
      es: "Se ajusta de forma continua y anticipa cambios del mercado.",
      en: "It is adjusted continuously and anticipates market shifts.",
    },
  ),

  // -------------------------------------------------------------- Governance
  q(
    "governance-1",
    "governance",
    true,
    {
      es: "¿Existe una política de uso de IA y un inventario de sistemas de IA?",
      en: "Is there an AI use policy and an inventory of AI systems?",
    },
    { es: "Ninguna de las dos.", en: "Neither of the two." },
    {
      es: "Lineamientos informales en algunos equipos.",
      en: "Informal guidelines in some teams.",
    },
    {
      es: "Política publicada e inventario mantenido a nivel empresa.",
      en: "Published policy and an inventory maintained enterprise-wide.",
    },
    {
      es: "El inventario incluye dueño, riesgo y datos usados por cada sistema.",
      en: "The inventory records owner, risk and data used for each system.",
    },
    {
      es: "El inventario se actualiza automáticamente y bloquea despliegues fuera de política.",
      en: "The inventory updates automatically and blocks out-of-policy deployments.",
    },
  ),
  q(
    "governance-2",
    "governance",
    false,
    {
      es: "¿Cómo se clasifica el riesgo de cada caso de uso de IA?",
      en: "How is the risk of each AI use case classified?",
    },
    { es: "No se clasifica.", en: "It is not classified." },
    {
      es: "Se discute informalmente si alguien lo plantea.",
      en: "Discussed informally if somebody raises it.",
    },
    {
      es: "Existe una taxonomía de riesgo aplicada a todos los casos.",
      en: "A risk taxonomy is applied to every case.",
    },
    {
      es: "La clasificación determina controles obligatorios y nivel de revisión.",
      en: "Classification determines mandatory controls and review depth.",
    },
    {
      es: "La clasificación se recalcula sola ante cambios de uso o de modelo.",
      en: "Classification is recomputed automatically when use or model changes.",
    },
  ),
  q(
    "governance-3",
    "governance",
    true,
    {
      es: "¿Se verifican controles de privacidad, sesgo y seguridad antes de producción?",
      en: "Are privacy, bias and security controls verified before production?",
    },
    { es: "No se verifica nada.", en: "Nothing is verified." },
    {
      es: "Depende del criterio del equipo que construye.",
      en: "It depends on the building team's judgement.",
    },
    {
      es: "Hay una lista de verificación obligatoria antes de liberar.",
      en: "A mandatory checklist is completed before release.",
    },
    {
      es: "Los controles se auditan con evidencia y se reprueban despliegues.",
      en: "Controls are audited against evidence and deployments can be rejected.",
    },
    {
      es: "Las pruebas corren automáticamente en cada cambio, con umbrales que bloquean.",
      en: "Tests run automatically on every change, with blocking thresholds.",
    },
  ),
  q(
    "governance-4",
    "governance",
    false,
    {
      es: "¿Cómo se gestiona la trazabilidad y explicabilidad de las decisiones automatizadas?",
      en: "How are traceability and explainability of automated decisions handled?",
    },
    {
      es: "No se puede reconstruir por qué el sistema decidió algo.",
      en: "It is impossible to reconstruct why the system decided something.",
    },
    {
      es: "Se puede reconstruir con esfuerzo manual en algunos sistemas.",
      en: "Reconstructable with manual effort in some systems.",
    },
    {
      es: "Todos los sistemas registran entradas, versión de modelo y salida.",
      en: "Every system logs inputs, model version and output.",
    },
    {
      es: "Existe explicación disponible para el afectado y para el auditor.",
      en: "An explanation is available to both the affected person and the auditor.",
    },
    {
      es: "La trazabilidad alimenta mejora del modelo y de la política.",
      en: "Traceability feeds improvement of both model and policy.",
    },
  ),
  q(
    "governance-5",
    "governance",
    false,
    {
      es: "¿Qué tan preparada está la organización ante la regulación de IA aplicable?",
      en: "How prepared is the organisation for applicable AI regulation?",
    },
    {
      es: "No se ha analizado qué regulación aplica.",
      en: "No analysis of which regulation applies.",
    },
    {
      es: "Se conoce el tema pero no hay plan.",
      en: "The topic is known but there is no plan.",
    },
    {
      es: "Se identificó la regulación aplicable y hay un plan de cumplimiento.",
      en: "Applicable regulation identified with a compliance plan.",
    },
    {
      es: "Los controles están mapeados a un marco (NIST AI RMF, ISO 42001) y auditados.",
      en: "Controls mapped to a framework (NIST AI RMF, ISO 42001) and audited.",
    },
    {
      es: "El cumplimiento es continuo y la empresa influye en el estándar del sector.",
      en: "Compliance is continuous and the company shapes the sector standard.",
    },
  ),

  // -------------------------------------------------------------------- Data
  q(
    "data-1",
    "data",
    true,
    {
      es: "¿Qué tan accesibles son los datos que necesitan los equipos de IA?",
      en: "How accessible is the data that AI teams need?",
    },
    {
      es: "Cada solicitud requiere gestión manual y semanas de espera.",
      en: "Every request needs manual handling and weeks of waiting.",
    },
    {
      es: "Accesibles en algunos dominios, difíciles en el resto.",
      en: "Accessible in some domains, hard everywhere else.",
    },
    {
      es: "Existe acceso self-service con permisos definidos.",
      en: "Self-service access exists with defined permissions.",
    },
    {
      es: "Acceso self-service con SLA, y el consumo se monitorea.",
      en: "Self-service access with an SLA, and consumption is monitored.",
    },
    {
      es: "Los datos se publican como productos con contrato y soporte.",
      en: "Data is published as products with a contract and support.",
    },
  ),
  q(
    "data-2",
    "data",
    false,
    {
      es: "¿Existe un catálogo de datos con linaje y propietarios definidos?",
      en: "Is there a data catalogue with lineage and defined owners?",
    },
    { es: "No existe catálogo.", en: "No catalogue exists." },
    {
      es: "Catálogos parciales por proyecto, desactualizados.",
      en: "Partial per-project catalogues, out of date.",
    },
    {
      es: "Catálogo empresarial con propietarios asignados.",
      en: "Enterprise catalogue with assigned owners.",
    },
    {
      es: "Catálogo con linaje completo hasta el consumo analítico.",
      en: "Catalogue with full lineage through to analytical consumption.",
    },
    {
      es: "Catálogo alimentado automáticamente y usado para análisis de impacto.",
      en: "Catalogue populated automatically and used for impact analysis.",
    },
  ),
  q(
    "data-3",
    "data",
    true,
    {
      es: "¿Cómo se mide y gestiona la calidad de los datos?",
      en: "How is data quality measured and managed?",
    },
    {
      es: "Se descubren los problemas cuando algo falla.",
      en: "Problems are discovered when something breaks.",
    },
    {
      es: "Validaciones puntuales en algunos pipelines.",
      en: "Spot validations in some pipelines.",
    },
    {
      es: "Reglas de calidad estándar aplicadas en los dominios críticos.",
      en: "Standard quality rules applied across critical domains.",
    },
    {
      es: "Calidad monitoreada con umbrales, alertas y dueño responsable.",
      en: "Quality monitored with thresholds, alerts and an accountable owner.",
    },
    {
      es: "Detección de anomalías automatizada con remediación y mejora continua.",
      en: "Automated anomaly detection with remediation and continuous improvement.",
    },
  ),
  q(
    "data-4",
    "data",
    false,
    {
      es: "¿Qué capacidad hay de integrar datos de múltiples fuentes?",
      en: "What is the capability to integrate data from multiple sources?",
    },
    {
      es: "Integraciones manuales, archivo por archivo.",
      en: "Manual integrations, file by file.",
    },
    {
      es: "ETL automatizado en los flujos principales.",
      en: "Automated ETL on the main flows.",
    },
    {
      es: "Plataforma de integración estándar para toda la empresa.",
      en: "Standard integration platform across the enterprise.",
    },
    {
      es: "Integración casi en tiempo real con monitoreo de frescura.",
      en: "Near real-time integration with freshness monitoring.",
    },
    {
      es: "Streaming y eventos como norma, con contratos de datos versionados.",
      en: "Streaming and events as the norm, with versioned data contracts.",
    },
  ),
  q(
    "data-5",
    "data",
    false,
    {
      es: "¿Hay datos históricos suficientes, documentados y con la granularidad necesaria?",
      en: "Is there enough historical data, documented and at the needed granularity?",
    },
    {
      es: "Histórico escaso o no confiable.",
      en: "Scarce or unreliable history.",
    },
    {
      es: "Histórico suficiente en algunos dominios.",
      en: "Sufficient history in some domains.",
    },
    {
      es: "Histórico suficiente y documentado en los dominios críticos.",
      en: "Sufficient, documented history across critical domains.",
    },
    {
      es: "Histórico versionado, con granularidad y retención definidas por política.",
      en: "Versioned history, with granularity and retention set by policy.",
    },
    {
      es: "Histórico reproducible punto en el tiempo para auditoría y reentrenamiento.",
      en: "Point-in-time reproducible history for audit and retraining.",
    },
  ),

  // -------------------------------------------------------------- Technology
  q(
    "technology-1",
    "technology",
    true,
    {
      es: "¿Qué plataforma soporta el ciclo de vida de los modelos y sistemas de IA?",
      en: "What platform supports the AI model and system lifecycle?",
    },
    {
      es: "Notebooks locales y herramientas distintas en cada proyecto.",
      en: "Local notebooks and different tooling in each project.",
    },
    {
      es: "Herramientas compartidas en proyectos seleccionados.",
      en: "Shared tooling across selected projects.",
    },
    {
      es: "Plataforma estándar que cubre desarrollo, despliegue y monitoreo.",
      en: "Standard platform covering development, deployment and monitoring.",
    },
    {
      es: "Plataforma con gobierno integrado, linaje de modelos y rollback.",
      en: "Platform with built-in governance, model lineage and rollback.",
    },
    {
      es: "Plataforma que se optimiza sola: evaluación continua y ruteo de modelos.",
      en: "Self-optimising platform: continuous evaluation and model routing.",
    },
  ),
  q(
    "technology-2",
    "technology",
    false,
    {
      es: "¿Cómo se despliegan los modelos a producción?",
      en: "How are models deployed to production?",
    },
    {
      es: "Manualmente, por la persona que lo construyó.",
      en: "Manually, by whoever built it.",
    },
    {
      es: "Con scripts propios distintos en cada equipo.",
      en: "With bespoke scripts that differ per team.",
    },
    {
      es: "Pipeline CI/CD estándar con ambientes separados.",
      en: "Standard CI/CD pipeline with separated environments.",
    },
    {
      es: "Despliegue progresivo (canary/shadow) con reversión automática.",
      en: "Progressive deployment (canary/shadow) with automatic rollback.",
    },
    {
      es: "Despliegue continuo gobernado por métricas de calidad y riesgo.",
      en: "Continuous deployment governed by quality and risk metrics.",
    },
  ),
  q(
    "technology-3",
    "technology",
    false,
    {
      es: "¿Cómo se evalúa la calidad de los modelos y sistemas GenAI?",
      en: "How is the quality of models and GenAI systems evaluated?",
    },
    {
      es: "Por inspección manual y percepción del equipo.",
      en: "By manual inspection and team perception.",
    },
    {
      es: "Métricas offline al construir, nada después.",
      en: "Offline metrics at build time, nothing afterwards.",
    },
    {
      es: "Conjunto de evaluación estándar aplicado antes de liberar.",
      en: "Standard evaluation set applied before release.",
    },
    {
      es: "Evaluación continua en producción con detección de deriva y regresión.",
      en: "Continuous production evaluation with drift and regression detection.",
    },
    {
      es: "Evaluación automatizada que dispara reentrenamiento o cambio de modelo.",
      en: "Automated evaluation that triggers retraining or a model switch.",
    },
  ),
  q(
    "technology-4",
    "technology",
    true,
    {
      es: "¿Qué observabilidad hay sobre la IA en producción (costo, latencia, deriva, error)?",
      en: "What observability exists over AI in production (cost, latency, drift, error)?",
    },
    { es: "Ninguna.", en: "None." },
    {
      es: "Logs básicos que se revisan si alguien reporta un problema.",
      en: "Basic logs reviewed only if somebody reports a problem.",
    },
    {
      es: "Tableros estándar de disponibilidad y desempeño.",
      en: "Standard availability and performance dashboards.",
    },
    {
      es: "Alertas por deriva, costo y calidad, con dueño y umbral definidos.",
      en: "Alerts on drift, cost and quality, with a defined owner and threshold.",
    },
    {
      es: "Observabilidad que retroalimenta automáticamente la arquitectura y el presupuesto.",
      en: "Observability that automatically feeds back into architecture and budget.",
    },
  ),
  q(
    "technology-5",
    "technology",
    false,
    {
      es: "¿Qué tan integrada está la IA con los sistemas core del negocio?",
      en: "How integrated is AI with core business systems?",
    },
    {
      es: "Nada. Vive en presentaciones y pruebas de concepto.",
      en: "Not at all. It lives in slide decks and proofs of concept.",
    },
    {
      es: "Integrada en una o dos herramientas periféricas.",
      en: "Integrated into one or two peripheral tools.",
    },
    {
      es: "Integrada en procesos operativos relevantes vía APIs estándar.",
      en: "Integrated into relevant operational processes through standard APIs.",
    },
    {
      es: "Embebida en los sistemas transaccionales que mueven el negocio.",
      en: "Embedded in the transactional systems that run the business.",
    },
    {
      es: "La arquitectura se diseña asumiendo IA como componente de primera clase.",
      en: "Architecture is designed with AI as a first-class component.",
    },
  ),

  // ------------------------------------------------------------------ Talent
  q(
    "talent-1",
    "talent",
    true,
    {
      es: "¿Están definidos los roles necesarios para IA y datos?",
      en: "Are the roles needed for AI and data defined?",
    },
    {
      es: "No hay roles. Lo hace quien tiene interés.",
      en: "No roles. Whoever is interested does it.",
    },
    {
      es: "Roles definidos localmente por cada área.",
      en: "Roles defined locally by each unit.",
    },
    {
      es: "Roles y perfiles definidos a nivel empresa.",
      en: "Roles and profiles defined enterprise-wide.",
    },
    {
      es: "Roles con rutas de carrera, niveles y evaluación de competencias.",
      en: "Roles with career paths, levels and competency assessment.",
    },
    {
      es: "Estructura que evoluciona con la tecnología y con movilidad interna.",
      en: "A structure that evolves with the technology, with internal mobility.",
    },
  ),
  q(
    "talent-2",
    "talent",
    false,
    {
      es: "¿Qué nivel de habilidades de IA tiene la fuerza laboral no técnica?",
      en: "What level of AI skills does the non-technical workforce have?",
    },
    {
      es: "Prácticamente ninguna.",
      en: "Effectively none.",
    },
    {
      es: "Algunos autodidactas usan herramientas por su cuenta.",
      en: "Some self-taught individuals use tools on their own.",
    },
    {
      es: "Formación básica impartida a toda la organización.",
      en: "Basic training delivered across the whole organisation.",
    },
    {
      es: "Formación por rol, con evaluación y certificación interna.",
      en: "Role-based training with assessment and internal certification.",
    },
    {
      es: "La plantilla rediseña sus propios procesos con IA sin apoyo técnico.",
      en: "Staff redesign their own processes with AI without technical support.",
    },
  ),
  q(
    "talent-3",
    "talent",
    false,
    {
      es: "¿Existe un programa de formación continua en IA?",
      en: "Is there a continuous AI training programme?",
    },
    { es: "No existe.", en: "It does not exist." },
    {
      es: "Cursos puntuales cuando surge la necesidad.",
      en: "One-off courses when a need arises.",
    },
    {
      es: "Currículo formal con presupuesto asignado.",
      en: "Formal curriculum with an allocated budget.",
    },
    {
      es: "Formación ligada a brechas medidas de competencia.",
      en: "Training tied to measured competency gaps.",
    },
    {
      es: "Aprendizaje continuo integrado al trabajo, con comunidades de práctica.",
      en: "Continuous learning embedded in the work, with communities of practice.",
    },
  ),
  q(
    "talent-4",
    "talent",
    true,
    {
      es: "¿Qué tan dependiente es la organización de proveedores externos para hacer IA?",
      en: "How dependent is the organisation on external vendors to deliver AI?",
    },
    {
      es: "Totalmente. Sin el proveedor no hay capacidad.",
      en: "Entirely. Without the vendor there is no capability.",
    },
    {
      es: "Alta dependencia, con algo de conocimiento interno.",
      en: "High dependence, with some internal knowledge.",
    },
    {
      es: "Capacidad interna para operar; proveedores para picos y especialidad.",
      en: "Internal capability to operate; vendors for peaks and specialisms.",
    },
    {
      es: "Capacidad interna para diseñar y construir; el proveedor es opcional.",
      en: "Internal capability to design and build; vendors are optional.",
    },
    {
      es: "La empresa desarrolla capacidades propias diferenciadoras.",
      en: "The company develops proprietary, differentiating capabilities.",
    },
  ),
  q(
    "talent-5",
    "talent",
    false,
    {
      es: "¿Cómo se atrae y retiene talento especializado en IA y datos?",
      en: "How is specialised AI and data talent attracted and retained?",
    },
    {
      es: "No se logra contratar ni retener.",
      en: "Neither hiring nor retention works.",
    },
    {
      es: "Se contrata con dificultad y la rotación es alta.",
      en: "Hiring is hard and turnover is high.",
    },
    {
      es: "Existe propuesta de valor definida para estos perfiles.",
      en: "A defined value proposition exists for these profiles.",
    },
    {
      es: "Retención medida, con compensación y proyectos competitivos.",
      en: "Retention is measured, with competitive pay and projects.",
    },
    {
      es: "La empresa es un destino reconocido para este talento.",
      en: "The company is a recognised destination for this talent.",
    },
  ),

  // ----------------------------------------------------------------- Culture
  q(
    "culture-1",
    "culture",
    true,
    {
      es: "¿Cómo perciben los colaboradores la introducción de IA en su trabajo?",
      en: "How do employees perceive the introduction of AI into their work?",
    },
    {
      es: "Con temor o rechazo abierto.",
      en: "With fear or open rejection.",
    },
    {
      es: "Con indiferencia; entusiasmo en focos aislados.",
      en: "With indifference; enthusiasm in isolated pockets.",
    },
    {
      es: "Con apertura, apoyada por comunicación y formación.",
      en: "With openness, supported by communication and training.",
    },
    {
      es: "Como parte normal del trabajo, con uso medido por área.",
      en: "As a normal part of work, with usage measured per unit.",
    },
    {
      es: "Como ventaja propia: los equipos piden y proponen más IA.",
      en: "As their own advantage: teams request and propose more AI.",
    },
  ),
  q(
    "culture-2",
    "culture",
    false,
    {
      es: "¿Existe uso no autorizado de herramientas de IA ('shadow AI')?",
      en: "Is there unauthorised use of AI tools (shadow AI)?",
    },
    {
      es: "Sí, extendido y sin visibilidad alguna.",
      en: "Yes, widespread and with no visibility.",
    },
    {
      es: "Sí, y se sabe que ocurre pero no se mide.",
      en: "Yes, it is known to happen but is not measured.",
    },
    {
      es: "Hay herramientas aprobadas y lineamientos claros de uso.",
      en: "Approved tools and clear usage guidelines exist.",
    },
    {
      es: "El uso se monitorea y las alternativas aprobadas son mejores que las externas.",
      en: "Usage is monitored and approved alternatives beat the external ones.",
    },
    {
      es: "No aplica: el canal oficial es el más conveniente para todos.",
      en: "Not applicable: the official channel is the most convenient for everyone.",
    },
  ),
  q(
    "culture-3",
    "culture",
    true,
    {
      es: "¿Qué tan tolerante es la organización al experimento que falla?",
      en: "How tolerant is the organisation of a failed experiment?",
    },
    {
      es: "El fracaso se castiga; nadie se arriesga.",
      en: "Failure is punished; nobody takes risks.",
    },
    {
      es: "Se tolera si nadie se entera.",
      en: "Tolerated as long as nobody finds out.",
    },
    {
      es: "Se acepta el experimento acotado como parte del método.",
      en: "Bounded experimentation is accepted as part of the method.",
    },
    {
      es: "Se presupuesta el aprendizaje y se documentan los fracasos.",
      en: "Learning is budgeted and failures are documented.",
    },
    {
      es: "Test-and-learn es la forma normal de operar y decidir.",
      en: "Test-and-learn is the normal way to operate and decide.",
    },
  ),
  q(
    "culture-4",
    "culture",
    false,
    {
      es: "¿Cómo se gestiona el cambio cuando la IA modifica un proceso o un rol?",
      en: "How is change managed when AI modifies a process or a role?",
    },
    {
      es: "No se gestiona; la gente se entera al final.",
      en: "It is not managed; people find out at the end.",
    },
    {
      es: "Se comunica, sin acompañamiento posterior.",
      en: "It is communicated, with no follow-up support.",
    },
    {
      es: "Existe un proceso de gestión del cambio con formación.",
      en: "A change management process with training exists.",
    },
    {
      es: "El rediseño del rol se hace con las personas afectadas y se mide la adopción.",
      en: "Role redesign happens with the affected people, and adoption is measured.",
    },
    {
      es: "Los equipos lideran su propio rediseño de forma continua.",
      en: "Teams lead their own redesign continuously.",
    },
  ),
  q(
    "culture-5",
    "culture",
    false,
    {
      es: "¿Los líderes usan IA visiblemente en su propio trabajo?",
      en: "Do leaders visibly use AI in their own work?",
    },
    { es: "No, y algunos la desalientan.", en: "No, and some discourage it." },
    {
      es: "Algunos la usan, sin visibilidad.",
      en: "Some use it, without visibility.",
    },
    {
      es: "La dirección la usa y lo comunica.",
      en: "Leadership uses it and says so.",
    },
    {
      es: "Los líderes muestran cómo la usan y qué resultados obtienen.",
      en: "Leaders show how they use it and what results they get.",
    },
    {
      es: "El liderazgo decide con apoyo de IA de forma habitual y transparente.",
      en: "Leadership routinely and transparently decides with AI support.",
    },
  ),

  // --------------------------------------------------------------- Operating
  q(
    "operating-1",
    "operating",
    true,
    {
      es: "¿Cómo entra y se prioriza la demanda de casos de uso de IA?",
      en: "How is demand for AI use cases captured and prioritised?",
    },
    {
      es: "Por conversaciones sueltas, sin registro.",
      en: "Through scattered conversations, with no record.",
    },
    {
      es: "Cada área gestiona su propia lista.",
      en: "Each unit manages its own list.",
    },
    {
      es: "Existe un intake único con criterios de priorización.",
      en: "A single intake exists with prioritisation criteria.",
    },
    {
      es: "El intake evalúa valor, riesgo, datos y factibilidad antes de aprobar.",
      en: "Intake assesses value, risk, data and feasibility before approval.",
    },
    {
      es: "El portafolio se rebalancea de forma continua con evidencia de resultados.",
      en: "The portfolio is rebalanced continuously against outcome evidence.",
    },
  ),
  q(
    "operating-2",
    "operating",
    false,
    {
      es: "¿Existe un proceso estándar de la idea a producción?",
      en: "Is there a standard process from idea to production?",
    },
    { es: "No; cada iniciativa improvisa.", en: "No; each initiative improvises." },
    {
      es: "Buenas prácticas conocidas pero aplicadas de forma desigual.",
      en: "Known good practice, applied unevenly.",
    },
    {
      es: "Proceso documentado y aplicado de forma consistente.",
      en: "Documented process, applied consistently.",
    },
    {
      es: "Proceso con compuertas de calidad, riesgo e impacto.",
      en: "Process with quality, risk and impact gates.",
    },
    {
      es: "Proceso que se mide y se mejora con retroalimentación de cada entrega.",
      en: "Process measured and improved with feedback from every delivery.",
    },
  ),
  q(
    "operating-3",
    "operating",
    false,
    {
      es: "¿Quién opera y da soporte a los sistemas de IA una vez en producción?",
      en: "Who runs and supports AI systems once in production?",
    },
    {
      es: "Nadie formalmente; el que lo construyó, si tiene tiempo.",
      en: "Nobody formally; whoever built it, if they have time.",
    },
    {
      es: "El equipo constructor, sin acuerdo de servicio.",
      en: "The build team, with no service agreement.",
    },
    {
      es: "Un equipo de operación definido con soporte acordado.",
      en: "A defined operations team with agreed support.",
    },
    {
      es: "Operación con SLAs, guardias y protocolo de incidentes de IA.",
      en: "Operations with SLAs, on-call and an AI incident protocol.",
    },
    {
      es: "Operación mayoritariamente automatizada, con intervención por excepción.",
      en: "Largely automated operations, with intervention by exception.",
    },
  ),
  q(
    "operating-4",
    "operating",
    true,
    {
      es: "¿Cómo colaboran negocio, datos, TI y riesgo en las iniciativas de IA?",
      en: "How do business, data, IT and risk collaborate on AI initiatives?",
    },
    {
      es: "En silos; se coordinan cuando ya hay un problema.",
      en: "In silos; they coordinate once there is already a problem.",
    },
    {
      es: "Coordinación puntual según la iniciativa.",
      en: "Ad-hoc coordination depending on the initiative.",
    },
    {
      es: "Equipos multidisciplinarios definidos por iniciativa.",
      en: "Multidisciplinary teams defined per initiative.",
    },
    {
      es: "Equipos permanentes con metas compartidas y riesgo embebido.",
      en: "Permanent teams with shared goals and risk embedded.",
    },
    {
      es: "La frontera entre funciones es irrelevante: producto único de punta a punta.",
      en: "Functional boundaries are irrelevant: a single end-to-end product.",
    },
  ),
  q(
    "operating-5",
    "operating",
    false,
    {
      es: "¿Cómo se decide retirar o reemplazar un sistema de IA?",
      en: "How is the decision made to retire or replace an AI system?",
    },
    {
      es: "No se retira nada; los sistemas quedan abandonados.",
      en: "Nothing is retired; systems are simply abandoned.",
    },
    {
      es: "Se retira cuando falla de forma evidente.",
      en: "Retired when it visibly breaks.",
    },
    {
      es: "Existe una revisión periódica del inventario.",
      en: "A periodic inventory review exists.",
    },
    {
      es: "Criterios de retiro basados en valor, costo y riesgo.",
      en: "Retirement criteria based on value, cost and risk.",
    },
    {
      es: "El ciclo de vida completo se gestiona de forma automática por métricas.",
      en: "The full lifecycle is managed automatically by metrics.",
    },
  ),

  // ------------------------------------------------------------- Measurement
  q(
    "measurement-1",
    "measurement",
    true,
    {
      es: "¿Se define una línea base antes de lanzar una iniciativa de IA?",
      en: "Is a baseline defined before launching an AI initiative?",
    },
    { es: "Nunca.", en: "Never." },
    {
      es: "A veces, según el equipo.",
      en: "Sometimes, depending on the team.",
    },
    {
      es: "Siempre, como parte del proceso estándar.",
      en: "Always, as part of the standard process.",
    },
    {
      es: "Línea base validada por finanzas o control de gestión.",
      en: "Baseline validated by finance or management control.",
    },
    {
      es: "La línea base se actualiza sola y alimenta la mejora continua.",
      en: "The baseline updates itself and feeds continuous improvement.",
    },
  ),
  q(
    "measurement-2",
    "measurement",
    false,
    {
      es: "¿Cómo se mide el retorno de las iniciativas de IA?",
      en: "How is the return on AI initiatives measured?",
    },
    {
      es: "No se mide; se asume que aporta.",
      en: "Not measured; benefit is assumed.",
    },
    {
      es: "Estimaciones cualitativas por proyecto.",
      en: "Qualitative per-project estimates.",
    },
    {
      es: "Métricas comunes de beneficio aplicadas a todos los casos.",
      en: "Common benefit metrics applied to every case.",
    },
    {
      es: "Beneficio atribuido y contrastado contra la línea base.",
      en: "Benefit attributed and tested against the baseline.",
    },
    {
      es: "Valor auditado e incorporado al presupuesto del año siguiente.",
      en: "Value audited and folded into the following year's budget.",
    },
  ),
  q(
    "measurement-3",
    "measurement",
    true,
    {
      es: "¿Existen KPIs de IA visibles para la dirección?",
      en: "Are AI KPIs visible to leadership?",
    },
    { es: "No existen.", en: "They do not exist." },
    {
      es: "Reportes esporádicos hechos a mano.",
      en: "Sporadic, hand-made reports.",
    },
    {
      es: "Tablero con indicadores definidos y actualización periódica.",
      en: "Dashboard with defined indicators, updated periodically.",
    },
    {
      es: "KPIs ligados a impacto de negocio y revisados en comité.",
      en: "KPIs tied to business impact and reviewed in committee.",
    },
    {
      es: "Los KPIs disparan decisiones de inversión de forma automática.",
      en: "KPIs automatically trigger investment decisions.",
    },
  ),
  q(
    "measurement-4",
    "measurement",
    false,
    {
      es: "¿Se mide la adopción real de las soluciones de IA entregadas?",
      en: "Is real adoption of delivered AI solutions measured?",
    },
    {
      es: "No se sabe si se usan.",
      en: "It is unknown whether they are used.",
    },
    {
      es: "Se sabe por comentarios, no por datos.",
      en: "Known through anecdote, not data.",
    },
    {
      es: "Se mide el uso de cada solución entregada.",
      en: "Usage of each delivered solution is measured.",
    },
    {
      es: "Se mide uso, satisfacción y efecto en el proceso intervenido.",
      en: "Usage, satisfaction and effect on the target process are measured.",
    },
    {
      es: "La baja adopción dispara automáticamente rediseño o retiro.",
      en: "Low adoption automatically triggers redesign or retirement.",
    },
  ),
  q(
    "measurement-5",
    "measurement",
    false,
    {
      es: "¿Se contrasta el valor prometido contra el valor efectivamente capturado?",
      en: "Is promised value reconciled against value actually captured?",
    },
    { es: "Nunca se revisa.", en: "It is never reviewed." },
    {
      es: "Se revisa sólo si alguien lo cuestiona.",
      en: "Reviewed only if somebody challenges it.",
    },
    {
      es: "Existe una revisión post-implementación estándar.",
      en: "A standard post-implementation review exists.",
    },
    {
      es: "La revisión es formal, con finanzas, y ajusta el portafolio.",
      en: "The review is formal, involves finance, and adjusts the portfolio.",
    },
    {
      es: "El contraste es continuo y corrige la estrategia en el ciclo siguiente.",
      en: "Reconciliation is continuous and corrects strategy in the next cycle.",
    },
  ),
];

export const EXPRESS_QUESTIONS = QUESTIONS.filter((item) => item.express);

export function questionsFor(mode: "express" | "full"): Question[] {
  return mode === "express" ? EXPRESS_QUESTIONS : QUESTIONS;
}
