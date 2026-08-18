import type { L } from "./framework";
import type { Capability } from "./tiers";

/**
 * Copy for the paywall. Separate file so neither i18n file sprawls, and so the
 * wording of what is locked can be reviewed on its own — this is the text a
 * visitor reads at the exact moment we ask them for money, and it is the one
 * place where an overclaim turns into a refund.
 */
export const TIERS_COPY = {
  /** Eyebrow on the upgrade card. */
  locked: { es: "Bloqueado", en: "Locked" },
  /** Announced to screen readers in place of a figure that was never sent. */
  lockedValue: { es: "Cifra bloqueada", en: "Figure locked" },
  /** Composed as `${unlockWith} ${TIERS[x].name}` — reads in both languages. */
  unlockWith: { es: "Se desbloquea con", en: "Unlocks with" },
  whatYouGet: { es: "Qué incluye", en: "What you get" },
  seeWhatYouGet: { es: "Ver qué incluye", en: "See what you get" },
  upgrade: { es: "Desbloquear", en: "Unlock" },

  /**
   * The honest line. It is deliberately specific about the mechanism because
   * the claim "we hide it" is worth nothing to a technical reader — saying
   * where the number lives is what makes the promise checkable.
   */
  hiddenUntilPurchase: {
    es: "La cifra se calcula en el servidor y no viaja al navegador hasta que la compras. Aquí ves la estructura del cálculo —cuántas líneas, qué categorías, en qué unidad—, no el número.",
    en: "The figure is computed on the server and is not sent to your browser until you buy it. What you see here is the shape of the calculation — how many lines, which categories, in what unit — not the number.",
  },
} satisfies Record<string, L>;

/**
 * What each capability actually is, in the visitor's words. The upgrade card
 * says what is locked; naming a capability id there ("calculator.llm") would
 * be honest and useless.
 */
export const CAPABILITY_COPY = {
  "assessment.express": {
    es: "Diagnóstico express",
    en: "Express assessment",
  },
  "assessment.full": {
    es: "Diagnóstico completo, con las cinco dimensiones",
    en: "Full assessment, across all five dimensions",
  },
  "report.pdf": {
    es: "Reporte en PDF para compartir",
    en: "Shareable PDF report",
  },
  "benchmark.peers": {
    es: "Comparación contra tu industria",
    en: "Benchmark against your industry",
  },
  "usecases.browse": {
    es: "Catálogo de casos de uso",
    en: "Use-case catalogue",
  },
  "usecases.scores": {
    es: "Puntajes de impacto y dificultad ajustados a tu industria",
    en: "Impact and difficulty scores adjusted for your industry",
  },
  "usecases.effort": {
    es: "Esfuerzo en días-persona y el equipo que exige",
    en: "Effort in person-days and the team it demands",
  },
  "calculator.cloud": {
    es: "Costo de nube y migración",
    en: "Cloud and migration cost",
  },
  "calculator.llm": {
    es: "Costo de LLM por modelo y por volumen",
    en: "LLM cost by model and volume",
  },
  "calculator.headcount": {
    es: "Costo del equipo y su composición",
    en: "Team cost and composition",
  },
  "calculator.export": {
    es: "Exportar el modelo de costos",
    en: "Export the cost model",
  },
  "session.guided": {
    es: "Sesión de 60 minutos con un consultor",
    en: "60-minute session with a consultant",
  },
} satisfies Record<Capability, L>;
