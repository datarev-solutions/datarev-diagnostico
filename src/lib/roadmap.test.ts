import { describe, expect, it } from "vitest";
import { ACTIONS } from "./actions";
import { DIMENSIONS, type Level } from "./framework";
import { QUESTIONS, questionsFor } from "./questions";
import { defaultTargets, scoreAssessment, type Answers } from "./scoring";
import {
  buildRoadmap,
  climbLevels,
  effortByHorizon,
  quadrantOf,
  roadmapByHorizon,
} from "./roadmap";

function answerAll(level: Level): Answers {
  return Object.fromEntries(
    questionsFor("full").map((question) => [question.id, level]),
  ) as Answers;
}

describe("action library integrity", () => {
  it("covers every rung from level 1 to 4 for every dimension", () => {
    for (const dimension of DIMENSIONS) {
      for (const fromLevel of [1, 2, 3, 4]) {
        const match = ACTIONS.find(
          (action) =>
            action.dimension === dimension.id && action.fromLevel === fromLevel,
        );
        expect(match, `${dimension.id} L${fromLevel}->${fromLevel + 1}`).toBeDefined();
      }
    }
  });

  it("has unique action ids", () => {
    const ids = ACTIONS.map((action) => action.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps impact and effort inside the 1..5 range", () => {
    for (const action of ACTIONS) {
      expect(action.impact).toBeGreaterThanOrEqual(1);
      expect(action.impact).toBeLessThanOrEqual(5);
      expect(action.effort).toBeGreaterThanOrEqual(1);
      expect(action.effort).toBeLessThanOrEqual(5);
    }
  });

  it("is fully bilingual", () => {
    for (const action of ACTIONS) {
      for (const field of ["title", "description", "owner", "kpi"] as const) {
        expect(action[field].es, `${action.id}.${field}.es`).toBeTruthy();
        expect(action[field].en, `${action.id}.${field}.en`).toBeTruthy();
      }
    }
  });
});

describe("climbLevels", () => {
  it("lists each rung between current and target", () => {
    expect(climbLevels(2, 4)).toEqual([2, 3]);
    expect(climbLevels(1, 5)).toEqual([1, 2, 3, 4]);
  });

  it("returns nothing when already at or above target", () => {
    expect(climbLevels(4, 4)).toEqual([]);
    expect(climbLevels(5, 3)).toEqual([]);
  });
});

describe("buildRoadmap", () => {
  it("is empty when every dimension already meets its target", () => {
    const result = scoreAssessment(answerAll(5), defaultTargets(3), "full");
    expect(buildRoadmap(result)).toHaveLength(0);
  });

  it("emits one action per rung climbed, for every dimension", () => {
    // Level 1 everywhere, target 5: four rungs x eight dimensions.
    const result = scoreAssessment(answerAll(1), defaultTargets(5), "full");
    expect(buildRoadmap(result)).toHaveLength(32);
  });

  it("only emits actions for the rungs still to be climbed", () => {
    const result = scoreAssessment(answerAll(3), defaultTargets(4), "full");
    const roadmap = buildRoadmap(result);
    expect(roadmap).toHaveLength(8);
    for (const action of roadmap) {
      expect(action.fromLevel).toBe(3);
    }
  });

  it("sorts by priority descending", () => {
    const result = scoreAssessment(answerAll(1), defaultTargets(5), "full");
    const roadmap = buildRoadmap(result);
    for (let i = 1; i < roadmap.length; i += 1) {
      expect(roadmap[i - 1].priority).toBeGreaterThanOrEqual(roadmap[i].priority);
    }
  });

  it("puts a high-impact low-effort action in the Now horizon", () => {
    const result = scoreAssessment(answerAll(1), defaultTargets(5), "full");
    const now = roadmapByHorizon(buildRoadmap(result)).now;
    // The acceptable-use policy is impact 5 / effort 1 on a 0.15-weight
    // dimension, so it must survive into the first horizon.
    expect(now.map((action) => action.id)).toContain("governance-1-2");
  });

  it("splits the backlog across three horizons", () => {
    const result = scoreAssessment(answerAll(1), defaultTargets(5), "full");
    const grouped = roadmapByHorizon(buildRoadmap(result));
    expect(grouped.now.length).toBe(11);
    expect(grouped.next.length).toBe(11);
    expect(grouped.later.length).toBe(10);
  });

  it("ignores dimensions that were never answered", () => {
    const answers: Answers = {};
    for (const question of QUESTIONS) {
      if (question.dimension === "data") answers[question.id] = 1;
    }
    const result = scoreAssessment(answers, defaultTargets(5), "full");
    const roadmap = buildRoadmap(result);
    expect(roadmap).toHaveLength(4);
    for (const action of roadmap) {
      expect(action.dimension).toBe("data");
    }
  });

  it("is deterministic across repeated builds", () => {
    const result = scoreAssessment(answerAll(2), defaultTargets(4), "full");
    const first = buildRoadmap(result).map((action) => action.id);
    const second = buildRoadmap(result).map((action) => action.id);
    expect(first).toEqual(second);
  });

  it("totals effort per horizon", () => {
    const result = scoreAssessment(answerAll(1), defaultTargets(5), "full");
    const roadmap = buildRoadmap(result);
    const totals = effortByHorizon(roadmap);
    const sum = totals.now + totals.next + totals.later;
    expect(sum).toBe(roadmap.reduce((acc, action) => acc + action.effort, 0));
  });
});

describe("quadrantOf", () => {
  it("classifies by impact and effort", () => {
    const base = ACTIONS[0];
    expect(quadrantOf({ ...base, impact: 5, effort: 1 })).toBe("quickWin");
    expect(quadrantOf({ ...base, impact: 5, effort: 4 })).toBe("majorProject");
    expect(quadrantOf({ ...base, impact: 2, effort: 1 })).toBe("fillIn");
    expect(quadrantOf({ ...base, impact: 2, effort: 5 })).toBe("thankless");
  });
});
