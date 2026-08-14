import { describe, expect, it } from "vitest";
import {
  PROCESS_LABEL,
  quadrantOf,
  rollUpUseCases,
  TECH_LABEL,
  teamComposition,
  TIER_LABEL,
  USE_CASES,
  type TechComponent,
  type UseCase,
} from "./useCases";

const byId = (id: string) => USE_CASES.find((u) => u.id === id)!;

describe("catalogue integrity", () => {
  it("has unique ids", () => {
    const ids = USE_CASES.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("scores every use case on both 1-10 axes", () => {
    for (const uc of USE_CASES) {
      expect(uc.impact).toBeGreaterThanOrEqual(1);
      expect(uc.impact).toBeLessThanOrEqual(10);
      expect(uc.difficulty).toBeGreaterThanOrEqual(1);
      expect(uc.difficulty).toBeLessThanOrEqual(10);
    }
  });

  it("gives every use case a KBQ phrased as a question", () => {
    // DataRev's methodology: a use case that cannot be stated as a decision
    // someone is trying to make does not belong in a roadmap.
    for (const uc of USE_CASES) {
      expect(uc.kbq.es).toMatch(/\?$/);
      expect(uc.kbq.en).toMatch(/\?$/);
    }
  });

  it("gives every use case real effort and a tech footprint", () => {
    for (const uc of USE_CASES) {
      const days = Object.values(uc.effort).reduce((a, d) => a + d, 0);
      expect(days).toBeGreaterThan(0);
      expect(uc.tech.length).toBeGreaterThan(0);
    }
  });

  it("has a label for every process, tier and tech component in use", () => {
    for (const uc of USE_CASES) {
      expect(PROCESS_LABEL[uc.process]).toBeDefined();
      expect(TIER_LABEL[uc.tier]).toBeDefined();
      for (const c of uc.tech) expect(TECH_LABEL[c]).toBeDefined();
    }
  });

  it("costs generative and prescriptive work more than descriptive work", () => {
    // Sanity on the estimates: the whole point of typing use cases is that a
    // dashboard and an agent must not price the same.
    const daysOf = (uc: UseCase) => Object.values(uc.effort).reduce((a, d) => a + d, 0);
    const descriptive = USE_CASES.filter((u) => u.tier === "descriptive").map(daysOf);
    const advanced = USE_CASES.filter(
      (u) => u.tier === "prescriptive" || u.tier === "generative",
    ).map(daysOf);

    const avg = (xs: number[]) => xs.reduce((a, x) => a + x, 0) / xs.length;
    expect(avg(advanced)).toBeGreaterThan(avg(descriptive));
  });

  it("covers all five process types", () => {
    expect(new Set(USE_CASES.map((u) => u.process)).size).toBe(5);
  });
});

describe("rollUpUseCases", () => {
  it("sums role-days across the selection", () => {
    const a = byId("fin-budget");
    const b = byId("h2r-headcount");
    const roll = rollUpUseCases([a, b]);

    expect(roll.roleDays.engineer).toBe((a.effort.engineer ?? 0) + (b.effort.engineer ?? 0));
    expect(roll.roleDays.analyst).toBe((a.effort.analyst ?? 0) + (b.effort.analyst ?? 0));
    expect(roll.totalDays).toBeCloseTo(
      Object.values(roll.roleDays).reduce((x, d) => x + d, 0),
      1,
    );
  });

  it("unions tech components without duplicating them", () => {
    const roll = rollUpUseCases([byId("fin-budget"), byId("h2r-headcount")]);
    expect(new Set(roll.tech).size).toBe(roll.tech.length);
    // Both are plain dashboards — neither should drag in ML or agents.
    expect(roll.tech).not.toContain("ml");
    expect(roll.tech).not.toContain("agent");
  });

  it("returns the tech footprint in pipeline order, not selection order", () => {
    // Selecting an agent use case first must not put 'agent' before 'ingestion'.
    const roll = rollUpUseCases([byId("cust-support-agent"), byId("fin-budget")]);
    const order = Object.keys(TECH_LABEL) as TechComponent[];
    const positions = roll.tech.map((c) => order.indexOf(c));
    expect(positions).toEqual([...positions].sort((x, y) => x - y));
  });

  it("survives an empty selection without dividing by zero", () => {
    const roll = rollUpUseCases([]);
    expect(roll.totalDays).toBe(0);
    expect(roll.tech).toEqual([]);
    expect(Number.isNaN(roll.avgImpact)).toBe(false);
    expect(Number.isNaN(roll.avgDifficulty)).toBe(false);
  });
});

describe("teamComposition", () => {
  it("rounds part-time need up to a whole person", () => {
    // 5 days of work over 6 months is still one person you have to have.
    const team = teamComposition({ architect: 5 }, 6);
    expect(team).toHaveLength(1);
    expect(team[0].fte).toBe(1);
  });

  it("adds people when the work will not fit the window", () => {
    // 200 engineer-days in 2 months (40 working days) needs 5 engineers.
    const team = teamComposition({ engineer: 200 }, 2);
    expect(team[0].fte).toBe(5);
  });

  it("compresses the same work into fewer people given more time", () => {
    const rushed = teamComposition({ engineer: 200 }, 2)[0].fte;
    const relaxed = teamComposition({ engineer: 200 }, 12)[0].fte;
    expect(relaxed).toBeLessThan(rushed);
  });

  it("omits roles with no work and sorts by effort", () => {
    const team = teamComposition({ engineer: 40, analyst: 0, architect: 10 }, 3);
    expect(team.map((t) => t.role)).toEqual(["engineer", "architect"]);
  });
});

describe("quadrantOf", () => {
  it("classifies the four corners", () => {
    const mk = (impact: number, difficulty: number) =>
      ({ ...USE_CASES[0], impact, difficulty }) as UseCase;

    expect(quadrantOf(mk(9, 2))).toBe("quickWin");
    expect(quadrantOf(mk(9, 9))).toBe("bigBet");
    expect(quadrantOf(mk(2, 2))).toBe("fillIn");
    expect(quadrantOf(mk(2, 9))).toBe("avoid");
  });

  it("leaves nothing sitting exactly on a boundary", () => {
    // Scores are whole or half numbers; the 5.5 midpoint is unreachable.
    for (const uc of USE_CASES) {
      expect(uc.impact).not.toBe(5.5);
      expect(uc.difficulty).not.toBe(5.5);
    }
  });
});
