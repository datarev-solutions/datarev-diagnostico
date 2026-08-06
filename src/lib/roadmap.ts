import { ACTIONS, type ActionTemplate } from "./actions";
import { DIMENSION_MAP, type DimensionId, type L, type Level } from "./framework";
import type { DimensionScore, Result } from "./scoring";

export type Horizon = "now" | "next" | "later";

export interface RoadmapAction extends ActionTemplate {
  /** weight x gap x impact / effort. Higher is more urgent. */
  priority: number;
  horizon: Horizon;
  dimensionWeight: number;
  gap: number;
}

export const HORIZONS: { id: Horizon; label: L; window: L }[] = [
  {
    id: "now",
    label: { es: "Ahora", en: "Now" },
    window: { es: "0 – 3 meses", en: "0 – 3 months" },
  },
  {
    id: "next",
    label: { es: "Siguiente", en: "Next" },
    window: { es: "3 – 9 meses", en: "3 – 9 months" },
  },
  {
    id: "later",
    label: { es: "Después", en: "Later" },
    window: { es: "9 – 18 meses", en: "9 – 18 months" },
  },
];

/**
 * Levels a dimension must climb through to reach its target.
 * Current level 2 with target 4 needs the 2->3 and 3->4 actions.
 */
export function climbLevels(current: Level, target: Level): number[] {
  if (target <= current) return [];
  const levels: number[] = [];
  for (let level = current; level < target; level += 1) levels.push(level);
  return levels;
}

function actionsForDimension(score: DimensionScore): ActionTemplate[] {
  const levels = climbLevels(score.level, score.target);
  return ACTIONS.filter(
    (action) =>
      action.dimension === score.dimension && levels.includes(action.fromLevel),
  );
}

export function actionPriority(
  action: ActionTemplate,
  score: DimensionScore,
): number {
  return (score.weight * score.gap * action.impact) / action.effort;
}

function assignHorizons(actions: RoadmapAction[]): RoadmapAction[] {
  const total = actions.length;
  if (total === 0) return actions;
  const bucketSize = Math.ceil(total / 3);

  return actions.map((action, index) => ({
    ...action,
    horizon:
      index < bucketSize ? "now" : index < bucketSize * 2 ? "next" : "later",
  }));
}

export function buildRoadmap(result: Result): RoadmapAction[] {
  const candidates = result.dimensions
    .filter((score) => score.gap > 0 && score.answered > 0)
    .flatMap((score) =>
      actionsForDimension(score).map((action) => ({
        ...action,
        priority: actionPriority(action, score),
        horizon: "later" as Horizon,
        dimensionWeight: score.weight,
        gap: score.gap,
      })),
    );

  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    // Stable, meaningful tiebreak: earlier rungs of the ladder come first.
    if (a.fromLevel !== b.fromLevel) return a.fromLevel - b.fromLevel;
    return a.id.localeCompare(b.id);
  });

  return assignHorizons(candidates);
}

export function roadmapByHorizon(
  actions: RoadmapAction[],
): Record<Horizon, RoadmapAction[]> {
  return {
    now: actions.filter((action) => action.horizon === "now"),
    next: actions.filter((action) => action.horizon === "next"),
    later: actions.filter((action) => action.horizon === "later"),
  };
}

export type Quadrant = "quickWin" | "majorProject" | "fillIn" | "thankless";

export const QUADRANT_LABELS: Record<Quadrant, L> = {
  quickWin: { es: "Ganancia rápida", en: "Quick win" },
  majorProject: { es: "Proyecto mayor", en: "Major project" },
  fillIn: { es: "De relleno", en: "Fill-in" },
  thankless: { es: "Bajo retorno", en: "Low return" },
};

export function quadrantOf(action: ActionTemplate): Quadrant {
  const highImpact = action.impact >= 4;
  const highEffort = action.effort >= 3.5;
  if (highImpact && !highEffort) return "quickWin";
  if (highImpact && highEffort) return "majorProject";
  if (!highImpact && !highEffort) return "fillIn";
  return "thankless";
}

export function dimensionLabel(id: DimensionId): L {
  return DIMENSION_MAP[id].short;
}

/** Total effort points per horizon — used for the capacity note in the report. */
export function effortByHorizon(actions: RoadmapAction[]): Record<Horizon, number> {
  const grouped = roadmapByHorizon(actions);
  return {
    now: grouped.now.reduce((sum, action) => sum + action.effort, 0),
    next: grouped.next.reduce((sum, action) => sum + action.effort, 0),
    later: grouped.later.reduce((sum, action) => sum + action.effort, 0),
  };
}
