import type { L } from "./framework";
import { REGIME_EVALUATORS } from "./complianceRegimes";

/**
 * Multi-jurisdiction regulatory classifier.
 *
 * The EU AI Act classifier this extends answers one question — how dangerous is
 * this AI system — and answers it only for Europe. That is a single axis, and
 * treating it as the whole answer produces the failure this module exists to
 * prevent: a workflow reported as "Minimal Risk" while it is simultaneously a
 * HIPAA business-associate arrangement, or processing datos sensibles under
 * Mexican law with no aviso de privacidad in sight.
 *
 * So the model here is deliberately two-axis:
 *
 *   - AI-system regimes (EU AI Act) grade the system by what it does.
 *   - Data-protection regimes (LFPDPPP, GDPR, CCPA/CPRA, LGPD) grade the
 *     personal data regardless of whether AI is involved at all.
 *   - Sectoral regimes (HIPAA) attach to a category of data and a type of
 *     entity, and ignore both of the above.
 *
 * A workflow is scored against every regime its jurisdiction and data category
 * put in scope, and the result is a stack of findings rather than one badge.
 */

export type Jurisdiction = "mexico" | "eu" | "us" | "brazil";

/**
 * Where the workflow is deployed. Lives here rather than alongside the agentic
 * feasibility scorer because the deployment domain is a regulatory input — it
 * is what decides whether Annex III bites — and nothing in the feasibility
 * scoring reads it.
 */
export type DeploymentDomain =
  | "recruitment_hr"
  | "financial_credit_scoring"
  | "biometric_identification"
  | "customer_support"
  | "internal_analytics"
  | "critical_infrastructure";

export const DOMAIN_LABEL: Record<DeploymentDomain, L> = {
  recruitment_hr: { es: "Empleo y reclutamiento", en: "Employment & recruitment" },
  financial_credit_scoring: { es: "Scoring crediticio", en: "Credit scoring" },
  biometric_identification: { es: "Identificación biométrica", en: "Biometric identification" },
  customer_support: { es: "Atención a clientes", en: "Customer support" },
  internal_analytics: { es: "Analítica interna", en: "Internal analytics" },
  critical_infrastructure: { es: "Infraestructura crítica", en: "Critical infrastructure" },
};

export type DataCategory =
  | "none"
  | "personal"
  | "sensitive"
  | "health"
  | "biometric"
  | "financial";

export type RegimeId =
  | "eu_ai_act"
  | "gdpr"
  | "lfpdppp"
  | "ccpa_cpra"
  | "hipaa"
  | "lgpd";

/** Ordered least to most constraining; `rank` below depends on this order. */
export type Severity =
  | "not_applicable"
  | "baseline"
  | "elevated"
  | "high"
  | "prohibited";

export type RegimeFamily = "ai_system" | "data_protection" | "sectoral";

export interface ComplianceInputs {
  jurisdictions: readonly Jurisdiction[];
  dataCategory: DataCategory;
  domain: DeploymentDomain;
  autonomousDecisioning: boolean;
  userExposure: "internal_employee" | "public_consumer";
}

export interface RegimeAssessment {
  id: RegimeId;
  /** Rendered as-is in the badge; these are proper nouns, not translated. */
  shortName: string;
  fullName: L;
  jurisdiction: Jurisdiction;
  family: RegimeFamily;
  severity: Severity;
  summary: L;
  obligations: L[];
  /**
   * When the obligations actually bite. Present only where the date is not
   * "already" — an obligation that lands in 2027 should not be sold as though
   * the client is late today.
   */
  timing?: L;
  /** Supervisory authority, where naming it is useful in a client conversation. */
  authority?: L;
}

export interface ComplianceResult {
  regimes: RegimeAssessment[];
  highestSeverity: Severity;
  headline: L;
  /**
   * Fires when the AI Act tier reads reassuringly but a privacy or sectoral
   * regime does not. This is the cross-axis warning that a single-axis
   * classifier structurally cannot produce.
   */
  crossAxisWarning: L | null;
}

const SEVERITY_ORDER: readonly Severity[] = [
  "not_applicable",
  "baseline",
  "elevated",
  "high",
  "prohibited",
];

export function rank(severity: Severity): number {
  return SEVERITY_ORDER.indexOf(severity);
}

export const SEVERITY_LABEL: Record<Severity, L> = {
  not_applicable: { es: "No aplica", en: "Not applicable" },
  baseline: { es: "Obligaciones base", en: "Baseline obligations" },
  elevated: { es: "Obligaciones reforzadas", en: "Elevated obligations" },
  high: { es: "Régimen de alto riesgo", en: "High-risk regime" },
  prohibited: { es: "Práctica prohibida", en: "Prohibited practice" },
};

export const JURISDICTION_LABEL: Record<Jurisdiction, L> = {
  mexico: { es: "México", en: "Mexico" },
  eu: { es: "Unión Europea", en: "European Union" },
  us: { es: "Estados Unidos", en: "United States" },
  brazil: { es: "Brasil", en: "Brazil" },
};

export const DATA_CATEGORY_LABEL: Record<DataCategory, L> = {
  none: { es: "Sin datos personales", en: "No personal data" },
  personal: { es: "Datos personales", en: "Personal data" },
  sensitive: { es: "Datos personales sensibles", en: "Sensitive personal data" },
  health: { es: "Datos de salud", en: "Health data" },
  biometric: { es: "Datos biométricos", en: "Biometric data" },
  financial: { es: "Datos financieros", en: "Financial data" },
};

/**
 * Categories treated as sensitive by essentially every regime in scope. Kept in
 * one place because each regime words it differently — "datos sensibles",
 * "special categories", "sensitive personal information" — but the trigger is
 * the same set.
 */
export const SENSITIVE_CATEGORIES: readonly DataCategory[] = [
  "sensitive",
  "health",
  "biometric",
];

export function isSensitive(category: DataCategory): boolean {
  return SENSITIVE_CATEGORIES.includes(category);
}

export function processesPersonalData(category: DataCategory): boolean {
  return category !== "none";
}

/**
 * Runs every regime evaluator and keeps the ones that landed in scope.
 *
 * Order is by severity descending so the thing that can stop the project shows
 * up first, with jurisdiction as a stable tiebreak — an assessment that
 * reshuffles its own cards between renders reads as untrustworthy.
 */
export function assessCompliance(inputs: ComplianceInputs): ComplianceResult {
  const regimes = REGIME_EVALUATORS.map((evaluate) => evaluate(inputs))
    .filter((regime): regime is RegimeAssessment => regime !== null)
    .sort((a, b) => rank(b.severity) - rank(a.severity) || a.id.localeCompare(b.id));

  const highestSeverity = regimes.reduce<Severity>(
    (worst, regime) => (rank(regime.severity) > rank(worst) ? regime.severity : worst),
    "not_applicable",
  );

  return {
    regimes,
    highestSeverity,
    headline: buildHeadline(regimes, highestSeverity, inputs),
    crossAxisWarning: buildCrossAxisWarning(regimes),
  };
}

function buildHeadline(
  regimes: readonly RegimeAssessment[],
  highestSeverity: Severity,
  inputs: ComplianceInputs,
): L {
  if (regimes.length === 0) {
    return {
      es: "Ningún régimen de los evaluados aplica con los supuestos actuales. Elige al menos una jurisdicción.",
      en: "None of the evaluated regimes apply under the current assumptions. Select at least one jurisdiction.",
    };
  }

  if (highestSeverity === "prohibited") {
    return {
      es: "Este diseño incluye una práctica prohibida. No es un asunto de controles: el flujo debe rediseñarse antes de desplegarse.",
      en: "This design includes a prohibited practice. No amount of controls fixes it — the workflow must be redesigned before deployment.",
    };
  }

  const count = regimes.length;
  const jurisdictions = new Set(regimes.map((regime) => regime.jurisdiction)).size;

  return {
    es: `${count} régimen${count === 1 ? "" : "es"} aplica${count === 1 ? "" : "n"} a este flujo en ${jurisdictions} jurisdicción${jurisdictions === 1 ? "" : "es"}${
      isSensitive(inputs.dataCategory) ? ", con datos sensibles de por medio" : ""
    }.`,
    en: `${count} regime${count === 1 ? "" : "s"} appl${count === 1 ? "ies" : "y"} to this workflow across ${jurisdictions} jurisdiction${jurisdictions === 1 ? "" : "s"}${
      isSensitive(inputs.dataCategory) ? ", with sensitive data in scope" : ""
    }.`,
  };
}

/**
 * The whole reason this module replaced a single classifier: an AI-system tier
 * of "minimal" says nothing about the privacy regimes running in parallel, and
 * a reader who sees only the green badge will draw exactly the wrong
 * conclusion.
 */
function buildCrossAxisWarning(regimes: readonly RegimeAssessment[]): L | null {
  const aiAct = regimes.find((regime) => regime.family === "ai_system");
  const aiActIsCalm =
    !aiAct || aiAct.severity === "baseline" || aiAct.severity === "not_applicable";

  const seriousNonAi = regimes.filter(
    (regime) => regime.family !== "ai_system" && rank(regime.severity) >= rank("elevated"),
  );

  if (!aiActIsCalm || seriousNonAi.length === 0) return null;

  const names = seriousNonAi.map((regime) => regime.shortName).join(", ");

  return {
    es: `Riesgo bajo bajo la Ley de IA de la UE no significa "sin regulación": ${names} impone${seriousNonAi.length === 1 ? "" : "n"} obligaciones sobre estos datos con independencia de qué tan riesgoso sea el sistema.`,
    en: `Low risk under the EU AI Act does not mean unregulated: ${names} impose${seriousNonAi.length === 1 ? "s" : ""} obligations on this data regardless of how risky the system itself is.`,
  };
}
