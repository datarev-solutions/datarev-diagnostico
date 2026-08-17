import { ROLE_LABEL, type MigrationRole } from "./cloudPricing";
import type { L } from "./framework";
import type { TechComponent, UseCase } from "./useCases";

/**
 * Process and responsibility mapping.
 *
 * RACI in its strict form: exactly one Accountable per activity — the whole
 * point of the model is that a single named person carries the decision. A
 * chart with two A's is the most common way RACI is filled in wrong, and a
 * test enforces the constraint here rather than trusting the data.
 *
 * The client-side roles are deliberately business roles, not IT ones. A data
 * project stalls when the business owner is listed as "Informed" on decisions
 * only they can actually make — which is why `businessOwner` is Accountable
 * on the two activities that decide whether anyone uses the thing.
 */

export type RaciLetter = "R" | "A" | "C" | "I";

/** Everyone who appears in the chart: DataRev's delivery team plus the client's. */
export type Actor = MigrationRole | "businessOwner" | "dataSteward" | "itSecurity" | "endUser";

/** Delivery roles reuse the rate card's labels, tagged with whose payroll they
 * sit on. Spelling a role differently here than in the team panel would read as
 * two different people. */
const DELIVERY_ACTORS = Object.fromEntries(
  (Object.keys(ROLE_LABEL) as MigrationRole[]).map((r) => [
    r,
    {
      es: `${ROLE_LABEL[r].es} (DataRev)`,
      en: `${ROLE_LABEL[r].en} (DataRev)`,
    },
  ]),
) as Record<MigrationRole, L>;

export const ACTOR_LABEL: Record<Actor, L> = {
  ...DELIVERY_ACTORS,
  businessOwner: { es: "Dueño del proceso (cliente)", en: "Process owner (client)" },
  dataSteward: { es: "Data steward (cliente)", en: "Data steward (client)" },
  itSecurity: { es: "TI / Seguridad (cliente)", en: "IT / Security (client)" },
  endUser: { es: "Usuario final (cliente)", en: "End user (client)" },
};

export const RACI_LABEL: Record<RaciLetter, L> = {
  R: { es: "Responsable (hace)", en: "Responsible (does)" },
  A: { es: "Aprobador (responde por)", en: "Accountable (answers for)" },
  C: { es: "Consultado", en: "Consulted" },
  I: { es: "Informado", en: "Informed" },
};

export interface RaciActivity {
  id: string;
  phase: L;
  activity: L;
  /** What has to exist for this activity to be considered done. */
  deliverable: L;
  assignments: Partial<Record<Actor, RaciLetter>>;
  /**
   * Only include this activity when the selection needs one of these
   * capabilities. Undefined means it always applies.
   */
  requiresAnyTech?: TechComponent[];
}

/**
 * The delivery process. Phases mirror the cost model's own split so the RACI
 * chart and the estimate describe the same project rather than two different
 * ones.
 */
export const RACI_ACTIVITIES: RaciActivity[] = [
  {
    id: "kbq",
    phase: { es: "1 · Encuadre", en: "1 · Framing" },
    activity: {
      es: "Definir preguntas clave de negocio (KBQ) y criterios de éxito",
      en: "Define key business questions (KBQ) and success criteria",
    },
    deliverable: { es: "KBQ priorizadas con métrica y meta", en: "Prioritised KBQs with metric and target" },
    assignments: {
      businessOwner: "A",
      architect: "R",
      analyst: "C",
      endUser: "C",
    },
  },
  {
    id: "architecture",
    phase: { es: "1 · Encuadre", en: "1 · Framing" },
    activity: { es: "Diseño de arquitectura de datos", en: "Data architecture design" },
    deliverable: { es: "Diagrama de arquitectura y decisiones (ADR)", en: "Architecture diagram and decision records" },
    assignments: {
      architect: "A",
      engineer: "R",
      itSecurity: "C",
      businessOwner: "I",
    },
  },
  {
    id: "access",
    phase: { es: "2 · Fundamentos", en: "2 · Foundations" },
    activity: { es: "Accesos, seguridad y cumplimiento", en: "Access, security and compliance" },
    deliverable: { es: "Roles, permisos y NDA firmados", en: "Roles, permissions and signed NDAs" },
    assignments: {
      itSecurity: "A",
      architect: "R",
      dataSteward: "C",
      engineer: "I",
    },
  },
  {
    id: "ingestion",
    phase: { es: "2 · Fundamentos", en: "2 · Foundations" },
    activity: { es: "Integrar fuentes y automatizar ingesta", en: "Integrate sources and automate ingestion" },
    deliverable: { es: "Pipelines corriendo con monitoreo", en: "Pipelines running with monitoring" },
    assignments: {
      engineer: "A",
      architect: "C",
      dataSteward: "C",
      businessOwner: "I",
    },
    requiresAnyTech: ["ingestion"],
  },
  {
    id: "quality",
    phase: { es: "2 · Fundamentos", en: "2 · Foundations" },
    activity: { es: "Calidad del dato y definiciones compartidas", en: "Data quality and shared definitions" },
    deliverable: { es: "Catálogo, linaje y reglas de calidad", en: "Catalogue, lineage and quality rules" },
    assignments: {
      dataSteward: "A",
      engineer: "R",
      analyst: "C",
      businessOwner: "C",
    },
    requiresAnyTech: ["governance", "semantic"],
  },
  {
    id: "semantic",
    phase: { es: "3 · Construcción", en: "3 · Build" },
    activity: { es: "Capa semántica y modelo de métricas", en: "Semantic layer and metric model" },
    deliverable: { es: "Métricas certificadas, una sola versión", en: "Certified metrics, one version" },
    assignments: {
      analyst: "A",
      engineer: "R",
      dataSteward: "C",
      businessOwner: "C",
    },
    requiresAnyTech: ["semantic"],
  },
  {
    id: "bi",
    phase: { es: "3 · Construcción", en: "3 · Build" },
    activity: { es: "Construir tableros y reportes", en: "Build dashboards and reports" },
    deliverable: { es: "Tableros validados contra la KBQ", en: "Dashboards validated against the KBQ" },
    assignments: {
      analyst: "A",
      endUser: "C",
      businessOwner: "I",
    },
    requiresAnyTech: ["bi"],
  },
  {
    id: "model",
    phase: { es: "3 · Construcción", en: "3 · Build" },
    activity: { es: "Entrenar y validar modelos", en: "Train and validate models" },
    deliverable: { es: "Modelo con métricas de desempeño documentadas", en: "Model with documented performance metrics" },
    assignments: {
      mlEngineer: "A",
      engineer: "R",
      businessOwner: "C",
      dataSteward: "C",
    },
    requiresAnyTech: ["ml", "mlops"],
  },
  {
    id: "agent",
    phase: { es: "3 · Construcción", en: "3 · Build" },
    activity: { es: "Construir agentes y guardrails", en: "Build agents and guardrails" },
    deliverable: { es: "Agente con evaluación y límites definidos", en: "Agent with evaluation suite and defined limits" },
    assignments: {
      mlEngineer: "A",
      fde: "R",
      itSecurity: "C",
      businessOwner: "C",
    },
    requiresAnyTech: ["llm", "agent", "vectordb"],
  },
  {
    id: "uat",
    phase: { es: "4 · Adopción", en: "4 · Adoption" },
    activity: { es: "Validación con usuarios (UAT)", en: "User acceptance testing" },
    deliverable: { es: "Firma de aceptación del dueño del proceso", en: "Sign-off from the process owner" },
    assignments: {
      businessOwner: "A",
      endUser: "R",
      analyst: "C",
      architect: "I",
    },
  },
  {
    id: "training",
    phase: { es: "4 · Adopción", en: "4 · Adoption" },
    activity: { es: "Capacitación y gestión del cambio", en: "Training and change management" },
    deliverable: { es: "Equipo capacitado y material entregado", en: "Team trained and material handed over" },
    assignments: {
      businessOwner: "A",
      analyst: "R",
      endUser: "C",
    },
  },
  {
    id: "handover",
    phase: { es: "4 · Adopción", en: "4 · Adoption" },
    activity: { es: "Transferencia y operación continua", en: "Handover and ongoing operation" },
    deliverable: { es: "Runbook, alertas y responsable asignado", en: "Runbook, alerting and a named owner" },
    assignments: {
      itSecurity: "A",
      engineer: "R",
      architect: "C",
      dataSteward: "C",
    },
  },
];

/** Actors in the order the chart should show them: DataRev, then client. */
export const ACTOR_ORDER: Actor[] = [
  "architect",
  "engineer",
  "analyst",
  "mlEngineer",
  "fde",
  "businessOwner",
  "dataSteward",
  "itSecurity",
  "endUser",
];

/**
 * The activities a given use-case selection actually triggers.
 *
 * An empty selection still returns the always-on activities: framing,
 * architecture, access, UAT, training and handover happen on every
 * engagement regardless of what gets built.
 */
export function raciFor(selected: UseCase[]): RaciActivity[] {
  const tech = new Set<TechComponent>(selected.flatMap((u) => u.tech));
  return RACI_ACTIVITIES.filter(
    (a) => !a.requiresAnyTech || a.requiresAnyTech.some((c) => tech.has(c)),
  );
}

/** Only the actors that appear at least once, in chart order. */
export function actorsIn(activities: RaciActivity[]): Actor[] {
  const present = new Set<Actor>();
  for (const a of activities) {
    for (const actor of Object.keys(a.assignments) as Actor[]) present.add(actor);
  }
  return ACTOR_ORDER.filter((a) => present.has(a));
}
