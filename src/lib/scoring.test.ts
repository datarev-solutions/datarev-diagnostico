import { describe, expect, it } from "vitest";
import { DIMENSIONS, type Level } from "./framework";
import { QUESTIONS, questionsFor } from "./questions";
import {
  defaultTargets,
  levelFromScore,
  rankedGaps,
  scoreAssessment,
  stageFromScore,
  type Answers,
} from "./scoring";

/** Answer every question in the given mode with one fixed level. */
function answerAll(level: Level, mode: "express" | "full" = "full"): Answers {
  return Object.fromEntries(
    questionsFor(mode).map((question) => [question.id, level]),
  ) as Answers;
}

describe("framework integrity", () => {
  it("has weights summing to 1", () => {
    const sum = DIMENSIONS.reduce((total, d) => total + d.weight, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it("has five questions per dimension", () => {
    for (const dimension of DIMENSIONS) {
      const count = QUESTIONS.filter((q) => q.dimension === dimension.id).length;
      expect(count, `dimension ${dimension.id}`).toBe(5);
    }
  });

  it("has exactly two express questions per dimension", () => {
    for (const dimension of DIMENSIONS) {
      const count = QUESTIONS.filter(
        (q) => q.dimension === dimension.id && q.express,
      ).length;
      expect(count, `dimension ${dimension.id}`).toBe(2);
    }
  });

  it("has unique question ids", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every question a bilingual anchor for all five levels", () => {
    for (const question of QUESTIONS) {
      for (const level of [1, 2, 3, 4, 5] as Level[]) {
        const anchor = question.anchors[level];
        expect(anchor?.es, `${question.id} L${level} es`).toBeTruthy();
        expect(anchor?.en, `${question.id} L${level} en`).toBeTruthy();
      }
    }
  });
});

describe("levelFromScore", () => {
  it("credits a level once the score is three quarters of the way there", () => {
    expect(levelFromScore(2.74)).toBe(2);
    expect(levelFromScore(2.75)).toBe(3);
  });

  it("clamps to the 1..5 range", () => {
    expect(levelFromScore(0)).toBe(1);
    expect(levelFromScore(-3)).toBe(1);
    expect(levelFromScore(9)).toBe(5);
  });
});

describe("stageFromScore", () => {
  it("maps the five-level score onto the four MIT CISR stages", () => {
    expect(stageFromScore(1.4).stage).toBe(1);
    expect(stageFromScore(2.0).stage).toBe(2);
    expect(stageFromScore(3.0).stage).toBe(3);
    expect(stageFromScore(4.0).stage).toBe(4);
  });

  it("collapses the top two levels into the final stage", () => {
    expect(stageFromScore(4.2).stage).toBe(4);
    expect(stageFromScore(5).stage).toBe(4);
  });

  it("agrees with the credited level so the report never contradicts itself", () => {
    // A 1.9 credits level 2, so it must not be reported as stage 1.
    for (const score of [1.0, 1.4, 1.75, 1.9, 2.4, 2.8, 3.3, 4.1, 5]) {
      const expected = Math.min(levelFromScore(score), 4);
      expect(stageFromScore(score).stage, `score ${score}`).toBe(expected);
    }
  });

  it("puts stages 1-2 below and 3-4 above industry average", () => {
    expect(stageFromScore(1.5).performance).toBe("below");
    expect(stageFromScore(2.5).performance).toBe("below");
    expect(stageFromScore(3.5).performance).toBe("above");
    expect(stageFromScore(4.5).performance).toBe("above");
  });
});

describe("scoreAssessment", () => {
  it("returns the uniform level when every answer is the same", () => {
    const result = scoreAssessment(answerAll(3), defaultTargets(4), "full");
    expect(result.overall).toBeCloseTo(3, 10);
    expect(result.level).toBe(3);
    expect(result.completion).toBe(1);
    expect(result.answeredCount).toBe(40);
  });

  it("weights dimensions rather than averaging them evenly", () => {
    // Data carries 0.18, Measurement 0.08. Scoring data high and the rest low
    // must beat the reverse, which an unweighted mean would treat as equal.
    const base = answerAll(2);
    const dataHigh: Answers = { ...base };
    const measurementHigh: Answers = { ...base };
    for (const question of QUESTIONS) {
      if (question.dimension === "data") dataHigh[question.id] = 5;
      if (question.dimension === "measurement") measurementHigh[question.id] = 5;
    }

    const a = scoreAssessment(dataHigh, defaultTargets(4), "full");
    const b = scoreAssessment(measurementHigh, defaultTargets(4), "full");
    expect(a.overall).toBeGreaterThan(b.overall);
  });

  it("renormalises over answered dimensions on a partial run", () => {
    const partial: Answers = {};
    for (const question of QUESTIONS) {
      if (question.dimension === "data") partial[question.id] = 4;
    }
    const result = scoreAssessment(partial, defaultTargets(4), "full");

    // Only data has evidence, so the overall must be data's score, not a
    // value dragged toward zero by the seven empty dimensions.
    expect(result.overall).toBeCloseTo(4, 10);
    expect(result.completion).toBeCloseTo(5 / 40, 10);
  });

  it("never reports a negative gap when current exceeds target", () => {
    const result = scoreAssessment(answerAll(5), defaultTargets(3), "full");
    for (const dimension of result.dimensions) {
      expect(dimension.gap).toBe(0);
    }
    expect(rankedGaps(result)).toHaveLength(0);
  });

  it("reports zero gap for dimensions with no evidence", () => {
    const result = scoreAssessment({}, defaultTargets(5), "full");
    expect(result.overall).toBe(0);
    for (const dimension of result.dimensions) {
      expect(dimension.answered).toBe(0);
      expect(dimension.gap).toBe(0);
    }
  });

  it("scores express mode over sixteen questions", () => {
    const result = scoreAssessment(
      answerAll(2, "express"),
      defaultTargets(4),
      "express",
    );
    expect(result.questionCount).toBe(16);
    expect(result.completion).toBe(1);
    expect(result.overall).toBeCloseTo(2, 10);
  });

  it("ranks gaps by weight times distance, not distance alone", () => {
    const answers = answerAll(3);
    // Push measurement (weight 0.08) two levels below data (weight 0.18).
    for (const question of QUESTIONS) {
      if (question.dimension === "measurement") answers[question.id] = 1;
      if (question.dimension === "data") answers[question.id] = 2;
    }
    const ranked = rankedGaps(
      scoreAssessment(answers, defaultTargets(5), "full"),
    );
    const measurement = ranked.find((d) => d.dimension === "measurement")!;
    const data = ranked.find((d) => d.dimension === "data")!;

    expect(measurement.gap).toBeGreaterThan(data.gap);
    // 0.18 * 3 = 0.54 beats 0.08 * 4 = 0.32, so data still outranks it.
    expect(ranked.indexOf(data)).toBeLessThan(ranked.indexOf(measurement));
  });
});
