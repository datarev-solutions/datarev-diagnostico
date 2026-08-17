import type { MigrationRole } from "./cloudPricing";
import type { L } from "./framework";
import type { AnalyticsTier, TechComponent } from "./useCases";

/**
 * THE STACK, AS THE MARKET ACTUALLY DRAWS IT
 * ==========================================
 * Structure follows the 2025 MAD (Machine Learning, AI & Data) Landscape — the
 * eleventh edition of FirstMark's ecosystem map, published October 2025 — which
 * lays the market out as a flow of data → infrastructure → ML/AI → agents and
 * applications, and for the first time carries an explicit agent stack (agent
 * platforms plus agent infrastructure and tooling).
 *
 * Why this matters for an estimate: a use case that "needs a vector database"
 * does not need only a vector database. The 2025 landscape describes the
 * agentic runtime as planners and tool-calling, structured outputs and function
 * catalogs, memory, sandboxed execution, approvals and stateful orchestration —
 * surrounded by eval harnesses, policy and guardrails, traces and cost
 * telemetry, versioning and rollback. Those surrounding layers are where
 * budgets break, and they are exactly what a thin tool list leaves out.
 *
 * So a use case declares the capability it needs; `expandStack` returns what
 * that capability actually drags in.
 *
 * Vendor names are illustrative of each layer, not recommendations, and not an
 * exhaustive list of any category.
 */

export type StackPlane = "data" | "analytics" | "ml" | "ai";

export const PLANE_LABEL: Record<StackPlane, L> = {
  data: { es: "Plano de datos", en: "Data plane" },
  analytics: { es: "Plano analítico", en: "Analytics plane" },
  ml: { es: "Plano de machine learning", en: "Machine learning plane" },
  ai: { es: "Plano de IA generativa y agentes", en: "Generative AI and agents plane" },
};

export type StackLayer =
  // data
  | "ingestion"
  | "streaming"
  | "objectStore"
  | "queryEngine"
  | "transform"
  | "orchestration"
  | "catalog"
  | "quality"
  | "governance"
  // analytics
  | "semantic"
  | "bi"
  | "activation"
  // ml
  | "featureStore"
  | "training"
  | "serving"
  | "modelMonitoring"
  // ai
  | "retrieval"
  | "llmGateway"
  | "agentRuntime"
  | "evals"
  | "aiObservability"
  | "aiSecurity";

export interface LayerSpec {
  plane: StackPlane;
  name: L;
  /** What it is for, in one line a business reader can follow. */
  purpose: L;
  /** Illustrative vendors, in the shape the MAD landscape groups them. */
  examples: string[];
  /** Who builds and owns this layer. Drives automatic team selection. */
  roles: MigrationRole[];
}

export const STACK: Record<StackLayer, LayerSpec> = {
  ingestion: {
    plane: "data",
    name: { es: "Ingesta y captura de cambios", en: "Ingestion and change data capture" },
    purpose: {
      es: "Traer datos de los sistemas fuente sin romperlos ni tener que pedirle un extracto a alguien cada semana.",
      en: "Move data out of source systems without breaking them or asking someone for a weekly extract.",
    },
    examples: ["Fivetran", "Airbyte", "Debezium", "AWS DMS"],
    roles: ["engineer"],
  },
  streaming: {
    plane: "data",
    name: { es: "Streaming y eventos", en: "Streaming and events" },
    purpose: {
      es: "Cuando la decisión no puede esperar al lote de la noche: fraude, disponibilidad, telemetría de planta.",
      en: "For decisions that cannot wait for the nightly batch: fraud, availability, plant telemetry.",
    },
    examples: ["Kafka / Confluent", "Flink", "Kinesis", "Pub/Sub"],
    roles: ["engineer", "architect"],
  },
  objectStore: {
    plane: "data",
    name: { es: "Almacenamiento de objetos y tablas abiertas", en: "Object storage and open tables" },
    purpose: {
      es: "La base. El MAD 2025 describe el desplazamiento de “warehouse contra lakehouse” hacia almacenamiento de objetos con formatos de tabla abiertos.",
      en: "The floor. MAD 2025 describes the shift from “warehouse vs lakehouse” to object storage with open table formats.",
    },
    examples: ["S3 / GCS / ADLS", "Apache Iceberg", "Delta Lake"],
    roles: ["architect", "engineer"],
  },
  queryEngine: {
    plane: "data",
    name: { es: "Motor de consulta / lakehouse", en: "Query engine / lakehouse" },
    purpose: {
      es: "Donde corren las consultas. Determina buena parte del costo mensual de la plataforma.",
      en: "Where queries run. Drives a large share of the platform's monthly cost.",
    },
    examples: ["BigQuery", "Snowflake", "Databricks SQL", "Redshift", "ClickHouse"],
    roles: ["architect", "engineer"],
  },
  transform: {
    plane: "data",
    name: { es: "Transformación y modelado", en: "Transformation and modelling" },
    purpose: {
      es: "Convertir tablas crudas en tablas en las que un humano puede confiar. Aquí vive el rol de Analytics Engineer.",
      en: "Turn raw tables into tables a human can trust. This is where the analytics engineer lives.",
    },
    examples: ["dbt", "SQLMesh", "Dataform"],
    roles: ["analyticsEngineer"],
  },
  orchestration: {
    plane: "data",
    name: { es: "Orquestación", en: "Orchestration" },
    purpose: {
      es: "Qué corre, en qué orden, y qué pasa cuando algo falla a las 3 de la mañana.",
      en: "What runs, in what order, and what happens when something fails at 3am.",
    },
    examples: ["Airflow", "Dagster", "Prefect"],
    roles: ["engineer"],
  },
  catalog: {
    plane: "data",
    name: { es: "Catálogo y linaje — plano de control", en: "Catalog and lineage — control plane" },
    purpose: {
      es: "El MAD 2025 sitúa al catálogo neutral como el plano de control del stack: qué existe, de dónde viene y quién puede verlo.",
      en: "MAD 2025 places the neutral catalog as the stack's control plane: what exists, where it came from and who may see it.",
    },
    examples: ["Unity Catalog", "Apache Polaris", "DataHub", "Collibra"],
    roles: ["governanceLead", "architect"],
  },
  quality: {
    plane: "data",
    name: { es: "Calidad y observabilidad de datos", en: "Data quality and observability" },
    purpose: {
      es: "Detectar que una tabla se rompió antes de que lo detecte el director en su tablero.",
      en: "Catch a broken table before the executive catches it in their dashboard.",
    },
    examples: ["Monte Carlo", "SYNQ", "Great Expectations", "Soda"],
    roles: ["governanceLead", "engineer"],
  },
  governance: {
    plane: "data",
    name: { es: "Gobierno, acceso y privacidad", en: "Governance, access and privacy" },
    purpose: {
      es: "Quién puede ver qué, con qué base legal, y cómo se demuestra ante un auditor.",
      en: "Who can see what, on what legal basis, and how it is proven to an auditor.",
    },
    examples: ["Immuta", "Privacera", "políticas nativas del catálogo"],
    roles: ["governanceLead"],
  },
  semantic: {
    plane: "analytics",
    name: { es: "Capa semántica y métricas", en: "Semantic and metrics layer" },
    purpose: {
      es: "Que “ingreso” signifique lo mismo en finanzas, comercial y el agente que responde preguntas.",
      en: "So “revenue” means the same thing in finance, in sales, and in the agent answering questions.",
    },
    examples: ["dbt Semantic Layer", "Cube", "LookML"],
    roles: ["analyticsEngineer", "analyst"],
  },
  bi: {
    plane: "analytics",
    name: { es: "BI y visualización", en: "BI and visualization" },
    purpose: {
      es: "La superficie donde el negocio consume. Suele ser también la línea de licencias más cara.",
      en: "The surface the business consumes. Usually the most expensive licence line too.",
    },
    examples: ["Power BI", "Looker", "Tableau", "Metabase"],
    roles: ["analyst"],
  },
  activation: {
    plane: "analytics",
    name: { es: "Activación / reverse ETL", en: "Activation / reverse ETL" },
    purpose: {
      es: "Devolver el resultado al sistema donde alguien actúa: CRM, motor de campañas, cobranza.",
      en: "Push the result back into the system where someone acts: CRM, campaign engine, collections.",
    },
    examples: ["Census", "Hightouch"],
    roles: ["engineer"],
  },
  featureStore: {
    plane: "ml",
    name: { es: "Feature store", en: "Feature store" },
    purpose: {
      es: "Que el modelo vea en producción exactamente las mismas variables con las que se entrenó.",
      en: "So the model sees in production exactly the features it was trained on.",
    },
    examples: ["Feast", "Tecton", "Vertex Feature Store"],
    roles: ["mlEngineer", "engineer"],
  },
  training: {
    plane: "ml",
    name: { es: "Entrenamiento y experimentación", en: "Training and experimentation" },
    purpose: {
      es: "Entrenar, comparar y poder reproducir el modelo que se aprobó.",
      en: "Train, compare, and be able to reproduce the model that got approved.",
    },
    examples: ["MLflow", "Weights & Biases", "SageMaker", "Vertex AI"],
    roles: ["scientist"],
  },
  serving: {
    plane: "ml",
    name: { es: "Serving e inferencia", en: "Serving and inference" },
    purpose: {
      es: "Publicar el modelo como un servicio con latencia y disponibilidad comprometidas.",
      en: "Publish the model as a service with committed latency and availability.",
    },
    examples: ["SageMaker Endpoints", "Vertex Endpoints", "BentoML", "KServe"],
    roles: ["mlopsEngineer", "mlEngineer"],
  },
  modelMonitoring: {
    plane: "ml",
    name: { es: "Monitoreo de modelos y deriva", en: "Model monitoring and drift" },
    purpose: {
      es: "Un modelo se degrada en silencio. Sin esta capa nadie se entera hasta que el negocio duele.",
      en: "A model degrades silently. Without this layer nobody finds out until the business hurts.",
    },
    examples: ["Evidently", "Arize", "Fiddler"],
    roles: ["mlopsEngineer"],
  },
  retrieval: {
    plane: "ai",
    name: { es: "Recuperación vectorial y de grafo (RAG)", en: "Vector and graph retrieval (RAG)" },
    purpose: {
      es: "Darle al modelo el contexto correcto de la empresa. El MAD 2025 nota que la recuperación aumentada con grafos pasó de blog post a patrón.",
      en: "Give the model the right company context. MAD 2025 notes graph-augmented retrieval moved from blog post to pattern.",
    },
    examples: ["pgvector", "Pinecone", "Weaviate", "Neo4j"],
    roles: ["mlEngineer", "engineer"],
  },
  llmGateway: {
    plane: "ai",
    name: { es: "Gateway de modelos y ruteo", en: "Model gateway and routing" },
    purpose: {
      es: "Un solo punto de control para costo, límites, residencia de datos y cambio de proveedor sin reescribir la aplicación.",
      en: "One control point for cost, limits, data residency and swapping providers without rewriting the application.",
    },
    examples: ["Vercel AI Gateway", "LiteLLM", "Bedrock", "Vertex AI"],
    roles: ["mlEngineer", "architect"],
  },
  agentRuntime: {
    plane: "ai",
    name: { es: "Runtime de agentes", en: "Agent runtime" },
    purpose: {
      es: "Planificación y llamada a herramientas, salidas estructuradas, memoria, ejecución en sandbox, aprobaciones y orquestación con estado. El MAD 2025 lo describe como una capa de infraestructura con sus propios SLA, no como pegamento de aplicación.",
      en: "Planning and tool-calling, structured outputs, memory, sandboxed execution, approvals and stateful orchestration. MAD 2025 describes it as an infrastructure tier with its own SLAs, not app glue.",
    },
    examples: ["LangGraph", "MCP", "Temporal", "plataformas de agentes del proveedor"],
    roles: ["fde", "mlEngineer"],
  },
  evals: {
    plane: "ai",
    name: { es: "Evaluación y guardarraíles", en: "Evaluation and guardrails" },
    purpose: {
      es: "La diferencia entre un demo y un sistema. Sin un arnés de evaluación no hay forma de saber si un cambio mejoró o empeoró.",
      en: "The difference between a demo and a system. Without an eval harness there is no way to know whether a change helped or hurt.",
    },
    examples: ["Braintrust", "LangSmith", "Ragas", "Guardrails AI"],
    roles: ["fde", "scientist"],
  },
  aiObservability: {
    plane: "ai",
    name: { es: "Trazas, costo y telemetría de IA", en: "AI traces, cost and telemetry" },
    purpose: {
      es: "Qué preguntó el usuario, qué herramientas se llamaron, qué costó y por qué respondió eso.",
      en: "What the user asked, which tools were called, what it cost, and why it answered that.",
    },
    examples: ["Langfuse", "Arize Phoenix", "Helicone"],
    roles: ["mlopsEngineer"],
  },
  aiSecurity: {
    plane: "ai",
    name: { es: "Seguridad de IA y red teaming", en: "AI security and red teaming" },
    purpose: {
      es: "Inyección de prompts, fuga de datos y agentes con permisos de más. Cisco 2025: sólo 31% se siente capaz de asegurar sistemas agénticos.",
      en: "Prompt injection, data leakage and over-permissioned agents. Cisco 2025: only 31% feel capable of securing agentic systems.",
    },
    examples: ["OWASP LLM Top 10", "Lakera", "revisión de permisos de herramientas"],
    roles: ["securityEngineer"],
  },
};

export const PLANE_ORDER: StackPlane[] = ["data", "analytics", "ml", "ai"];

const LAYER_ORDER = Object.keys(STACK) as StackLayer[];

/**
 * Layers every project gets, regardless of what was selected. You cannot report
 * on data you never landed, and Cisco 2025 finds only 51% of organizations have
 * their data centralized at all — the floor is the work, not an assumption.
 */
const BASELINE: StackLayer[] = ["ingestion", "objectStore", "queryEngine", "transform", "orchestration", "catalog", "quality", "governance"];

/**
 * What each coarse capability declared on a use case actually drags in.
 * This is the point of the file: `vectordb` alone is not a plan.
 */
const IMPLIES: Record<TechComponent, StackLayer[]> = {
  ingestion: ["ingestion"],
  warehouse: ["objectStore", "queryEngine"],
  semantic: ["semantic"],
  bi: ["bi"],
  orchestration: ["orchestration"],
  governance: ["governance", "catalog"],
  streaming: ["streaming"],
  ml: ["featureStore", "training", "serving", "modelMonitoring"],
  mlops: ["serving", "modelMonitoring", "training"],
  llm: ["llmGateway", "evals", "aiObservability", "aiSecurity"],
  vectordb: ["retrieval", "llmGateway", "evals", "aiObservability", "aiSecurity"],
  agent: ["agentRuntime", "llmGateway", "retrieval", "evals", "aiObservability", "aiSecurity", "activation"],
};

/** Tiers that pull in layers on their own, independent of the tool tags. */
const TIER_IMPLIES: Partial<Record<AnalyticsTier, StackLayer[]>> = {
  predictive: ["featureStore", "training", "serving", "modelMonitoring"],
  prescriptive: ["training", "serving", "modelMonitoring", "activation"],
  generative: ["llmGateway", "evals", "aiObservability", "aiSecurity"],
};

/**
 * Expand a selection's declared capabilities into the layers it really needs,
 * returned in pipeline order so the reader sees data before agents.
 */
export function expandStack(
  components: TechComponent[],
  tiers: AnalyticsTier[] = [],
): StackLayer[] {
  const needed = new Set<StackLayer>(BASELINE);
  for (const c of components) for (const l of IMPLIES[c]) needed.add(l);
  for (const t of tiers) for (const l of TIER_IMPLIES[t] ?? []) needed.add(l);
  return LAYER_ORDER.filter((l) => needed.has(l));
}

/** Group layers by plane, dropping planes with nothing in them. */
export function byPlane(layers: StackLayer[]): { plane: StackPlane; layers: StackLayer[] }[] {
  return PLANE_ORDER.map((plane) => ({
    plane,
    layers: layers.filter((l) => STACK[l].plane === plane),
  })).filter((g) => g.layers.length > 0);
}

/**
 * Every role the stack itself requires. This is how a security engineer ends up
 * on an agent project even when no use case listed one: the layer needs an
 * owner, so the plan has to name one.
 */
export function rolesForStack(layers: StackLayer[]): MigrationRole[] {
  const roles = new Set<MigrationRole>();
  for (const l of layers) for (const r of STACK[l].roles) roles.add(r);
  return [...roles];
}

/** Which layers put this role on the team — the "why is this person here" answer. */
export function layersNeedingRole(layers: StackLayer[], role: MigrationRole): StackLayer[] {
  return layers.filter((l) => STACK[l].roles.includes(role));
}

/**
 * Two seats no single layer owns, and that a stack-only derivation would
 * therefore never staff — which is exactly why projects lose them.
 *
 * Product management earns its place once there is more than one workstream to
 * sequence, or once the work spans several planes at the same time. Change
 * management earns its place the moment the output lands in front of a human:
 * Cisco 2025 finds only a third of organizations have a formal change plan,
 * and that gap is where a technically finished build stops producing value.
 *
 * A single dashboard gets neither. That restraint is the point — not every
 * profile belongs on every project.
 */
export function coordinationRoles(
  useCaseCount: number,
  layers: StackLayer[],
): MigrationRole[] {
  const roles: MigrationRole[] = [];
  const planes = new Set(layers.map((l) => STACK[l].plane));

  if (useCaseCount >= 3 || planes.size >= 3) roles.push("productManager");
  if (layers.includes("bi") || layers.includes("agentRuntime") || layers.includes("activation")) {
    roles.push("changeManager");
  }
  return roles;
}
