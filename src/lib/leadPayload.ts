import type { Locale } from "./framework";
import type { Result } from "./scoring";
import { rankedGaps } from "./scoring";
import { encodeState, type AssessmentState } from "./state";

export interface AssessmentPayload {
  mode: AssessmentState["mode"];
  locale: Locale;
  answers: Record<string, number>;
  targets: Record<string, number>;
  ambition: string;
  overallScore: number;
  creditedLevel: number;
  stageId: string;
  dimensionScores: Record<string, number>;
  topGaps: string[];
  shareCode: string;
  companySnapshot: AssessmentState["company"];
}

/**
 * Flatten an in-browser assessment into the shape /api/lead stores. Scores are
 * denormalised on purpose: DataRev needs to sort and filter leads by maturity
 * without replaying the scoring engine over raw answers in SQL.
 */
export function buildAssessmentPayload(
  state: AssessmentState,
  result: Result,
): AssessmentPayload {
  return {
    mode: state.mode,
    locale: state.locale,
    answers: { ...state.answers },
    targets: { ...state.targets },
    ambition: state.ambition,
    overallScore: Number(result.overall.toFixed(2)),
    creditedLevel: result.level,
    stageId: `stage-${result.stage.stage}`,
    dimensionScores: Object.fromEntries(
      result.dimensions.map((score) => [
        score.dimension,
        Number(score.raw.toFixed(2)),
      ]),
    ),
    topGaps: rankedGaps(result)
      .slice(0, 5)
      .map((score) => score.dimension),
    shareCode: encodeState(state),
    companySnapshot: { ...state.company },
  };
}

/** UTM and referrer, for attribution on the lead row. */
export function readAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};

  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
  ]) {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 200);
  }

  if (document.referrer) utm.referrer = document.referrer.slice(0, 200);
  return utm;
}
