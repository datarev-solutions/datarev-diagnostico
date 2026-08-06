import {
  CISR_STAGES,
  DIMENSIONS,
  DIMENSION_MAP,
  type CisrStage,
  type DimensionId,
  type Level,
} from "./framework";
import { questionsFor, type Question } from "./questions";

export type Mode = "express" | "full";

/** questionId -> chosen level. Unanswered questions are simply absent. */
export type Answers = Record<string, Level>;

/** dimensionId -> target level chosen by the user. */
export type Targets = Record<DimensionId, Level>;

export interface DimensionScore {
  dimension: DimensionId;
  /** Mean of answered questions, 1..5. Zero when nothing is answered. */
  raw: number;
  /** Credited maturity level. */
  level: Level;
  target: Level;
  /** Distance to target, never negative. */
  gap: number;
  weight: number;
  answered: number;
  total: number;
}

export interface Result {
  /** Weighted mean across dimensions, 1..5. */
  overall: number;
  /** Credited overall level. */
  level: Level;
  stage: CisrStage;
  dimensions: DimensionScore[];
  /** 0..1 share of applicable questions answered. */
  completion: number;
  answeredCount: number;
  questionCount: number;
}

export function clampLevel(value: number): Level {
  const rounded = Math.min(5, Math.max(1, Math.trunc(value)));
  return rounded as Level;
}

/**
 * Credit a maturity level once a dimension has substantially achieved it.
 *
 * A strict CMMI reading (floor) punishes a 3.9 as a level 3; a plain round
 * promotes a 2.5 to level 3 on half the evidence. The .75 threshold sits
 * between the two and is the rule reported to the user.
 */
export function levelFromScore(raw: number): Level {
  if (raw <= 0) return 1;
  return clampLevel(Math.floor(raw + 0.25));
}

/**
 * Map the credited level onto the four MIT CISR stages.
 *
 * Deriving this from the credited level rather than from the raw score keeps
 * one threshold rule in the report: a 1.9 that earns level 2 must not also be
 * shown as stage 1. Levels 4 and 5 both land in stage 4, which is where the
 * CISR model puts the rare "AI future-ready" enterprises.
 */
export function stageFromScore(overall: number): CisrStage {
  const level = levelFromScore(overall);
  return CISR_STAGES[Math.min(level, 4) - 1];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function groupByDimension(questions: Question[]): Map<DimensionId, Question[]> {
  const groups = new Map<DimensionId, Question[]>();
  for (const dimension of DIMENSIONS) groups.set(dimension.id, []);
  for (const question of questions) {
    groups.get(question.dimension)?.push(question);
  }
  return groups;
}

export function defaultTargets(level: Level): Targets {
  return Object.fromEntries(
    DIMENSIONS.map((dimension) => [dimension.id, level]),
  ) as Targets;
}

export function scoreAssessment(
  answers: Answers,
  targets: Targets,
  mode: Mode,
): Result {
  const questions = questionsFor(mode);
  const groups = groupByDimension(questions);

  const dimensions: DimensionScore[] = DIMENSIONS.map((dimension) => {
    const group = groups.get(dimension.id) ?? [];
    const values = group
      .map((question) => answers[question.id])
      .filter((value): value is Level => typeof value === "number");

    const raw = mean(values);
    const target = targets[dimension.id];

    return {
      dimension: dimension.id,
      raw,
      level: levelFromScore(raw),
      target,
      gap: values.length === 0 ? 0 : Math.max(0, target - raw),
      weight: dimension.weight,
      answered: values.length,
      total: group.length,
    };
  });

  // Renormalise over dimensions that actually have evidence, so a partially
  // completed run is not dragged toward zero by empty dimensions.
  const scored = dimensions.filter((dimension) => dimension.answered > 0);
  const weightSum = scored.reduce((sum, dimension) => sum + dimension.weight, 0);
  const overall =
    weightSum === 0
      ? 0
      : scored.reduce(
          (sum, dimension) => sum + dimension.raw * dimension.weight,
          0,
        ) / weightSum;

  const answeredCount = dimensions.reduce(
    (sum, dimension) => sum + dimension.answered,
    0,
  );

  return {
    overall,
    level: levelFromScore(overall),
    stage: stageFromScore(overall),
    dimensions,
    completion: questions.length === 0 ? 0 : answeredCount / questions.length,
    answeredCount,
    questionCount: questions.length,
  };
}

/**
 * Weighted priority of closing a dimension's gap. Drives which dimensions the
 * narrative and the roadmap lead with.
 */
export function dimensionPriority(score: DimensionScore): number {
  return score.weight * score.gap;
}

export function rankedGaps(result: Result): DimensionScore[] {
  return [...result.dimensions]
    .filter((dimension) => dimension.gap > 0)
    .sort((a, b) => dimensionPriority(b) - dimensionPriority(a));
}

export function strongestDimensions(result: Result): DimensionScore[] {
  return [...result.dimensions]
    .filter((dimension) => dimension.answered > 0)
    .sort((a, b) => b.raw - a.raw);
}

export function dimensionName(id: DimensionId) {
  return DIMENSION_MAP[id].name;
}
