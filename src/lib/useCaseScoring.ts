import {
  DEPARTMENT_FOCUS,
  difficultyDrag,
  impactTilt,
  LEGACY_DRAG,
  TIER_EVIDENCE,
  type FocusArea,
} from "./evidence";
import type { L } from "./framework";
import type { Industry, UseCase } from "./useCases";

/**
 * SCORES THAT MOVE WITH THE INDUSTRY
 * ==================================
 * The same use case is not equally attractive everywhere. Predictive
 * maintenance is the single most-prioritised kind of work in manufacturing and
 * an afterthought in retail; a fraud model is table stakes in banking and a
 * nice-to-have in education. A catalogue that shows one fixed pair of numbers
 * regardless of who is looking is telling every client the same thing.
 *
 * So the catalogue's own impact and difficulty are the base, and the industry
 * shifts them using published data — Cisco's 2025 measurement of what each
 * industry actually prioritises, and the documented failure rates for
 * generative and agentic work. Every shift is returned with the reason and the
 * source attached, so the client sees the arithmetic instead of a black box.
 *
 * The tilts are deliberately small (±1 point at most, each). They re-rank
 * neighbours; they never turn a bad idea into a good one. Judgement about the
 * use case stays dominant — the survey breaks ties.
 */

/**
 * Cases whose real focus area is not the one their department implies.
 * A fraud model owned by Risk is measured under "risk and fraud"; an anomaly
 * detector owned by IT is measured under "cybersecurity". Everything not listed
 * inherits `DEPARTMENT_FOCUS`.
 */
const FOCUS_OVERRIDE: Record<string, FocusArea> = {
  "prod-quality": "productInnovation",
  "prod-basket": "marketingSales",
  "mfg-quality": "productInnovation",
  "health-readmission": "rnd",
  "bank-aml": "compliance",
  "ins-claims": "riskFraud",
};

export function focusOf(uc: UseCase): FocusArea {
  return FOCUS_OVERRIDE[uc.id] ?? DEPARTMENT_FOCUS[uc.department];
}

export interface Adjustment {
  /** Signed points applied. */
  delta: number;
  reason: L;
  /** Which entry in SOURCES backs this, if any. */
  sourceId?: string;
}

export interface Scored {
  impact: number;
  difficulty: number;
  baseImpact: number;
  baseDifficulty: number;
  impactAdjustments: Adjustment[];
  difficultyAdjustments: Adjustment[];
}

const clamp = (n: number) => Math.min(10, Math.max(1, Math.round(n * 10) / 10));

/**
 * Score a use case through an industry's lens. `cross` means "no industry
 * chosen" and returns the catalogue's own numbers untouched — an honest
 * default rather than a silent average.
 */
export function scoreFor(uc: UseCase, industry: Industry | "all"): Scored {
  const base = { impact: uc.impact, difficulty: uc.difficulty };
  const impactAdjustments: Adjustment[] = [];
  const difficultyAdjustments: Adjustment[] = [];

  // Difficulty: the published failure rates for this kind of work. These apply
  // regardless of industry — an agent is hard everywhere.
  if (uc.tier === "generative") {
    const isAgentic = uc.tech.includes("agent");
    const ev = isAgentic ? TIER_EVIDENCE.agentic : TIER_EVIDENCE.generative;
    difficultyAdjustments.push({
      delta: ev.penalty,
      reason: ev.stat,
      sourceId: ev.sourceId,
    });
  }

  if (industry !== "all" && industry !== "cross") {
    const tilt = impactTilt(industry, focusOf(uc));
    if (Math.abs(tilt) >= 0.05) {
      impactAdjustments.push({
        delta: tilt,
        reason:
          tilt > 0
            ? {
                es: "Esta industria prioriza esta área por encima del promedio de las industrias medidas.",
                en: "This industry prioritises this area above the average of the measured industries.",
              }
            : {
                es: "Esta industria prioriza esta área por debajo del promedio de las industrias medidas.",
                en: "This industry prioritises this area below the average of the measured industries.",
              },
        sourceId: "cisco2025",
      });
    }

    const drag = difficultyDrag(industry);
    if (drag > 0) {
      difficultyAdjustments.push({ delta: drag, reason: LEGACY_DRAG[industry].why });
    }
  }

  const sum = (xs: Adjustment[]) => xs.reduce((a, x) => a + x.delta, 0);

  return {
    baseImpact: uc.impact,
    baseDifficulty: uc.difficulty,
    impact: clamp(base.impact + sum(impactAdjustments)),
    difficulty: clamp(base.difficulty + sum(difficultyAdjustments)),
    impactAdjustments,
    difficultyAdjustments,
  };
}

/**
 * Quadrant on the scored numbers, not the raw ones — otherwise the matrix and
 * the cards would disagree about where a case sits.
 * Midpoint 5.5 so nothing lands exactly on a boundary.
 */
export function quadrantOfScored(s: {
  impact: number;
  difficulty: number;
}): "quickWin" | "bigBet" | "fillIn" | "avoid" {
  const highImpact = s.impact >= 5.5;
  const lowDifficulty = s.difficulty < 5.5;
  if (highImpact && lowDifficulty) return "quickWin";
  if (highImpact) return "bigBet";
  if (lowDifficulty) return "fillIn";
  return "avoid";
}
