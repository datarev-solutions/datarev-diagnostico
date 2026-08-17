import { describe, expect, it } from "vitest";
import {
  CISCO_PRIORITY,
  focusMean,
  impactTilt,
  INDUSTRY_TO_CISCO,
  LEGACY_DRAG,
  READINESS_GAPS,
  SOURCES,
  SOURCE_BY_ID,
  TIER_EVIDENCE,
  type FocusArea,
} from "./evidence";
import { focusOf, quadrantOfScored, scoreFor } from "./useCaseScoring";
import { USE_CASES, type Industry } from "./useCases";

const byId = (id: string) => USE_CASES.find((u) => u.id === id)!;

const INDUSTRIES: Industry[] = [
  "banking",
  "insurance",
  "retail",
  "manufacturing",
  "healthcare",
  "telco",
  "logistics",
];

describe("published evidence", () => {
  it("gives every source a resolvable id, url and date", () => {
    for (const s of SOURCES) {
      expect(SOURCE_BY_ID[s.id]).toBe(s);
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.published).toMatch(/^\d{4}(-\d{2})?(-\d{2})?$/);
    }
  });

  it("points every citation at a specific document, not a site root", () => {
    // A source that resolves to a homepage is not a citation. (One listed URL
    // 404'd on first check — the SYNQ benchmark — and was removed rather than
    // shipped broken in front of a client.)
    for (const s of SOURCES) {
      const url = new URL(s.url);
      expect(url.pathname.length, s.id).toBeGreaterThan(1);
    }
  });

  it("uses every source it lists", () => {
    // A source nobody cites is decoration. Each one must be referenced by an
    // adjustment or by the readiness panel.
    const cited = new Set<string>([
      ...USE_CASES.flatMap((uc) =>
        INDUSTRIES.flatMap((ind) =>
          [...scoreFor(uc, ind).impactAdjustments, ...scoreFor(uc, ind).difficultyAdjustments]
            .map((a) => a.sourceId)
            .filter((id): id is string => Boolean(id)),
        ),
      ),
      ...READINESS_GAPS.map((g) => g.sourceId),
      // Cited in prose rather than by a numeric adjustment.
      "mad2025",
      "deloitte2026",
    ]);

    for (const s of SOURCES) expect([...cited], s.id).toContain(s.id);
  });

  it("cites only current work — nothing published before 2025", () => {
    // The whole point of the rebuild: the 2022-era maturity charts and the
    // "87% of models never reach production" line predate GenAI in production
    // and would misprice every agentic case.
    for (const s of SOURCES) {
      expect(Number(s.published.slice(0, 4))).toBeGreaterThanOrEqual(2025);
    }
  });

  it("keeps every Cisco figure inside a plausible survey range", () => {
    for (const column of Object.values(CISCO_PRIORITY)) {
      for (const pct of Object.values(column)) {
        expect(pct).toBeGreaterThan(0);
        expect(pct).toBeLessThan(100);
      }
    }
  });

  it("maps every industry we sell to onto a column Cisco actually published", () => {
    for (const ind of INDUSTRIES) {
      const column = INDUSTRY_TO_CISCO[ind as Exclude<Industry, "cross">];
      expect(CISCO_PRIORITY[column]).toBeDefined();
    }
  });

  it("reproduces the report's headline finding", () => {
    // Cisco's own summary line is that operational efficiency leads almost
    // everywhere, and that manufacturing leads it. If a transcription slip
    // broke that, this catches it.
    const mfg = CISCO_PRIORITY.manufacturing;
    const top = (Object.entries(mfg) as [FocusArea, number][]).sort((a, b) => b[1] - a[1])[0];
    expect(top[0]).toBe("opsEfficiency");
    expect(mfg.opsEfficiency).toBe(57);
  });
});

describe("impact tilt", () => {
  it("is zero when no industry is chosen", () => {
    expect(impactTilt("cross", "opsEfficiency")).toBe(0);
  });

  it("stays inside ±1 point for every industry and focus area", () => {
    // The survey breaks ties; it must never overwhelm the catalogue's own
    // judgement about whether a use case is worth doing.
    const areas = Object.keys(CISCO_PRIORITY.retail) as FocusArea[];
    for (const ind of INDUSTRIES) {
      for (const area of areas) {
        expect(Math.abs(impactTilt(ind, area))).toBeLessThanOrEqual(1);
      }
    }
  });

  it("sums to roughly zero across the measured industries", () => {
    // A tilt measured against the mean cannot systematically inflate everyone.
    const columns = Object.keys(CISCO_PRIORITY);
    const total = columns.reduce(
      (a, c) => a + (CISCO_PRIORITY[c].opsEfficiency - focusMean("opsEfficiency")),
      0,
    );
    expect(Math.abs(total)).toBeLessThan(0.001);
  });

  it("ranks manufacturing above retail on operational efficiency", () => {
    expect(impactTilt("manufacturing", "opsEfficiency")).toBeGreaterThan(
      impactTilt("retail", "opsEfficiency"),
    );
  });
});

describe("scoreFor", () => {
  it("returns the catalogue's own numbers when no industry is chosen", () => {
    const uc = byId("fin-cockpit");
    const s = scoreFor(uc, "all");
    expect(s.impact).toBe(uc.impact);
    expect(s.difficulty).toBe(uc.difficulty);
    expect(s.impactAdjustments).toEqual([]);
  });

  it("charges generative work the documented failure rate", () => {
    const generative = USE_CASES.filter((u) => u.tier === "generative");
    expect(generative.length).toBeGreaterThan(0);

    for (const uc of generative) {
      const s = scoreFor(uc, "all");
      expect(s.difficulty).toBeGreaterThan(uc.difficulty);
      const cited = s.difficultyAdjustments.map((a) => a.sourceId);
      expect(cited.some((id) => id === "nanda2025" || id === "gartner2025")).toBe(true);
    }
  });

  it("cites Gartner for agents and MIT for non-agentic generative work", () => {
    const agentic = USE_CASES.find((u) => u.tier === "generative" && u.tech.includes("agent"))!;
    const plainGen = USE_CASES.find(
      (u) => u.tier === "generative" && !u.tech.includes("agent"),
    )!;

    expect(scoreFor(agentic, "all").difficultyAdjustments[0].sourceId).toBe(
      TIER_EVIDENCE.agentic.sourceId,
    );
    expect(scoreFor(plainGen, "all").difficultyAdjustments[0].sourceId).toBe(
      TIER_EVIDENCE.generative.sourceId,
    );
  });

  it("makes the same case harder in banking than in retail", () => {
    // Legacy drag: a mainframe core costs you before you write a line of code.
    const uc = byId("fin-cockpit");
    expect(scoreFor(uc, "banking").difficulty).toBeGreaterThan(
      scoreFor(uc, "retail").difficulty,
    );
    expect(LEGACY_DRAG.banking.points).toBeGreaterThan(LEGACY_DRAG.retail.points);
  });

  it("explains every adjustment it applies", () => {
    // A number that moved without a reason attached is exactly the black box
    // this file exists to avoid.
    for (const uc of USE_CASES) {
      for (const ind of INDUSTRIES) {
        const s = scoreFor(uc, ind);
        for (const a of [...s.impactAdjustments, ...s.difficultyAdjustments]) {
          expect(a.reason.es.length).toBeGreaterThan(0);
          expect(a.reason.en.length).toBeGreaterThan(0);
          expect(a.delta).not.toBe(0);
        }
      }
    }
  });

  it("never leaves the 1-10 scale, whatever the adjustments", () => {
    for (const uc of USE_CASES) {
      for (const ind of [...INDUSTRIES, "all" as const]) {
        const s = scoreFor(uc, ind);
        expect(s.impact).toBeGreaterThanOrEqual(1);
        expect(s.impact).toBeLessThanOrEqual(10);
        expect(s.difficulty).toBeGreaterThanOrEqual(1);
        expect(s.difficulty).toBeLessThanOrEqual(10);
      }
    }
  });

  it("never moves impact more than a point away from the catalogue's own view", () => {
    // The guarantee that matters. Ranking position is not the right thing to
    // assert on: many cases share a score, so an arbitrarily small tilt breaks
    // a tie and jumps a case past every case tied with it. That is a property
    // of ties, not of the tilt. The score distance is the real invariant.
    for (const uc of USE_CASES) {
      for (const ind of INDUSTRIES) {
        expect(Math.abs(scoreFor(uc, ind).impact - uc.impact)).toBeLessThanOrEqual(1);
      }
    }
  });

  it("keeps difficulty adjustments bounded too", () => {
    // Legacy drag (max 0.8) plus the tier penalty (1.0) is the worst case.
    for (const uc of USE_CASES) {
      for (const ind of INDUSTRIES) {
        // Rounded: the subtraction of two one-decimal scores lands on float
        // noise (1.8000000000000007), not on a real bound violation.
        const delta = Math.round((scoreFor(uc, ind).difficulty - uc.difficulty) * 10) / 10;
        expect(delta).toBeGreaterThanOrEqual(0);
        expect(delta).toBeLessThanOrEqual(1.8);
      }
    }
  });
});

describe("focusOf", () => {
  it("gives every use case a focus area Cisco actually measured", () => {
    const areas = new Set(Object.keys(CISCO_PRIORITY.retail));
    for (const uc of USE_CASES) {
      expect(areas.has(focusOf(uc))).toBe(true);
    }
  });

  it("routes the AML case to compliance, not generic risk", () => {
    expect(focusOf(byId("bank-aml"))).toBe("compliance");
  });
});

describe("quadrantOfScored", () => {
  it("classifies the four corners", () => {
    expect(quadrantOfScored({ impact: 9, difficulty: 2 })).toBe("quickWin");
    expect(quadrantOfScored({ impact: 9, difficulty: 9 })).toBe("bigBet");
    expect(quadrantOfScored({ impact: 2, difficulty: 2 })).toBe("fillIn");
    expect(quadrantOfScored({ impact: 2, difficulty: 9 })).toBe("avoid");
  });

  it("can move a case out of quick wins once the industry's legacy drag lands", () => {
    // The behaviour Dante asked for: the matrix has to respond to who is asking.
    const shifted = USE_CASES.filter(
      (u) =>
        quadrantOfScored(scoreFor(u, "retail")) !== quadrantOfScored(scoreFor(u, "banking")),
    );
    expect(shifted.length).toBeGreaterThan(0);
  });
});
