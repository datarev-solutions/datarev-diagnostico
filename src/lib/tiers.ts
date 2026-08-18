import type { L } from "./framework";

/**
 * TIERS AND ENTITLEMENTS
 * ======================
 * The single contract every other piece of the paywall builds against: the
 * database, the Stripe integration and the UI all read tiers from here.
 *
 * Two deliberate design rules, both of which exist because the point of the
 * paywall is to stop another consultancy from lifting the model:
 *
 *   1. CAPABILITIES, NOT PAGES. A tier grants named capabilities, not routes.
 *      Gating by route means one forgotten link leaks everything; gating by
 *      capability means the server can answer "may this user see a number?"
 *      at the point the number is produced.
 *
 *   2. THE SERVER DECIDES. Nothing here may be trusted from the client. A CSS
 *      blur over a real figure is not protection — anyone opens developer
 *      tools and reads it. Values the user has not paid for must never be
 *      serialised into the page at all; see `redactFor`.
 *
 * On prices: `listPrice` below is the ADVERTISED price, and Stripe is the
 * CHARGED price. When Stripe is configured its number wins, always — it is the
 * one that actually takes the money, and a page that advertises a figure it
 * does not honour is a refund conversation at best.
 *
 * The list price exists anyway because the alternative was worse: with no
 * Stripe account yet the pricing page rendered four tiers with a dash where
 * the number goes, which tells a visitor nothing and tells the owner nothing
 * either. It is also the spec for what to create in Stripe — see
 * docs/configurar-pagos.md.
 */

export type TierId = "free" | "diagnostic" | "plan" | "guided";

export const TIER_ORDER: TierId[] = ["free", "diagnostic", "plan", "guided"];

/**
 * Everything the app can gate. Add a capability here before gating anything,
 * so there is one list to audit when asking "what does a paying user get?".
 */
export type Capability =
  // assessment
  | "assessment.express"
  | "assessment.full"
  | "report.pdf"
  | "benchmark.peers"
  // use-case planner
  | "usecases.browse"
  | "usecases.scores"
  | "usecases.effort"
  // calculator
  | "calculator.cloud"
  | "calculator.llm"
  | "calculator.headcount"
  | "calculator.export"
  // human
  | "session.guided";

export interface Tier {
  id: TierId;
  name: L;
  /** What this tier is for, in the voice used across the app. */
  pitch: L;
  /** Env var holding the Stripe price id. Absent on the free tier. */
  priceEnvVar?: string;
  /**
   * Advertised price in MXN centavos, matching Stripe's minor-unit convention
   * so the two are directly comparable. Stripe's live price overrides this
   * whenever it is configured.
   */
  listPrice?: number;
  listCurrency?: string;
  /** Everything this tier unlocks, including what lower tiers already grant. */
  capabilities: Capability[];
}

const FREE: Capability[] = ["assessment.express", "usecases.browse"];

const DIAGNOSTIC: Capability[] = [
  ...FREE,
  "assessment.full",
  "report.pdf",
  "benchmark.peers",
];

const PLAN: Capability[] = [
  ...DIAGNOSTIC,
  "usecases.scores",
  "usecases.effort",
  "calculator.cloud",
  "calculator.llm",
  "calculator.headcount",
  "calculator.export",
];

const GUIDED: Capability[] = [...PLAN, "session.guided"];

export const TIERS: Record<TierId, Tier> = {
  free: {
    id: "free",
    name: { es: "Gratis", en: "Free" },
    pitch: {
      es: "Diagnóstico express y tu nivel de madurez. Requiere cuenta.",
      en: "Express assessment and your maturity level. Account required.",
    },
    capabilities: FREE,
  },
  diagnostic: {
    id: "diagnostic",
    name: { es: "Diagnóstico", en: "Diagnostic" },
    pitch: {
      es: "Diagnóstico completo, reporte en PDF y comparación contra tu industria.",
      en: "Full assessment, PDF report and a benchmark against your industry.",
    },
    priceEnvVar: "STRIPE_PRICE_DIAGNOSTIC",
    listPrice: 49_000,
    listCurrency: "mxn",
    capabilities: DIAGNOSTIC,
  },
  plan: {
    id: "plan",
    name: { es: "Plan", en: "Plan" },
    pitch: {
      es: "Casos de uso puntuados para tu industria y la calculadora completa: nube, LLM y equipo.",
      en: "Use cases scored for your industry and the full calculator: cloud, LLM and team.",
    },
    priceEnvVar: "STRIPE_PRICE_PLAN",
    listPrice: 290_000,
    listCurrency: "mxn",
    capabilities: PLAN,
  },
  guided: {
    id: "guided",
    name: { es: "Sesión guiada", en: "Guided session" },
    pitch: {
      es: "Todo lo anterior más 60 minutos con un consultor y el reporte validado.",
      en: "Everything above plus 60 minutes with a consultant and a validated report.",
    },
    priceEnvVar: "STRIPE_PRICE_GUIDED",
    listPrice: 590_000,
    listCurrency: "mxn",
    capabilities: GUIDED,
  },
};

/** Does this tier grant this capability? */
export function can(tier: TierId, capability: Capability): boolean {
  return TIERS[tier].capabilities.includes(capability);
}

/** The cheapest tier that grants a capability — drives the upgrade prompt. */
export function tierFor(capability: Capability): TierId | null {
  return TIER_ORDER.find((t) => can(t, capability)) ?? null;
}

/**
 * Strip values the user has not paid for.
 *
 * Use this on the SERVER, on the way out. The whole protection rests on the
 * numbers never reaching the browser: a client-side blur leaks to anyone who
 * opens developer tools, which is exactly the audience a competing consultancy
 * belongs to.
 *
 * Returns the same shape with gated fields replaced by null, so the UI can lay
 * out the real structure — how many rows, which categories — and show the
 * shape of the answer without giving away the answer.
 */
export function redactFor<T extends Record<string, unknown>>(
  value: T,
  gatedKeys: (keyof T)[],
  tier: TierId,
  capability: Capability,
): T {
  if (can(tier, capability)) return value;
  const out = { ...value };
  for (const k of gatedKeys) out[k] = null as T[keyof T];
  return out;
}

/** Same, for a list. */
export function redactAll<T extends Record<string, unknown>>(
  rows: T[],
  gatedKeys: (keyof T)[],
  tier: TierId,
  capability: Capability,
): T[] {
  return rows.map((r) => redactFor(r, gatedKeys, tier, capability));
}
