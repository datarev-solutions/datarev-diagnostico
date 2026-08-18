import { describe, expect, it } from "vitest";
import {
  can,
  redactAll,
  redactFor,
  TIER_ORDER,
  TIERS,
  tierFor,
  type Capability,
  type TierId,
} from "./tiers";

const ALL_CAPABILITIES: Capability[] = [
  "assessment.express",
  "assessment.full",
  "report.pdf",
  "benchmark.peers",
  "usecases.browse",
  "usecases.scores",
  "usecases.effort",
  "calculator.cloud",
  "calculator.llm",
  "calculator.headcount",
  "calculator.export",
  "session.guided",
];

describe("tier ladder", () => {
  it("never takes a capability away as the tier rises", () => {
    // A paying user losing something they had on a cheaper tier is the kind of
    // bug you only hear about from an angry customer.
    for (let i = 1; i < TIER_ORDER.length; i++) {
      const lower = TIERS[TIER_ORDER[i - 1]].capabilities;
      const higher = TIERS[TIER_ORDER[i]].capabilities;
      for (const c of lower) expect(higher, TIER_ORDER[i]).toContain(c);
    }
  });

  it("grows strictly — every paid tier adds something", () => {
    for (let i = 1; i < TIER_ORDER.length; i++) {
      expect(
        TIERS[TIER_ORDER[i]].capabilities.length,
        TIER_ORDER[i],
      ).toBeGreaterThan(TIERS[TIER_ORDER[i - 1]].capabilities.length);
    }
  });

  it("names and pitches every tier in both languages", () => {
    for (const t of TIER_ORDER) {
      expect(TIERS[t].name.es.length).toBeGreaterThan(0);
      expect(TIERS[t].pitch.en.length).toBeGreaterThan(0);
    }
  });

  it("gives every paid tier a Stripe price variable and the free tier none", () => {
    expect(TIERS.free.priceEnvVar).toBeUndefined();
    for (const t of TIER_ORDER.filter((x) => x !== "free")) {
      expect(TIERS[t].priceEnvVar, t).toMatch(/^STRIPE_PRICE_/);
    }
  });

  it("reaches every declared capability from some tier", () => {
    // A capability no tier grants is dead code that silently gates a feature
    // off for everyone.
    for (const c of ALL_CAPABILITIES) {
      expect(tierFor(c), c).not.toBeNull();
    }
  });
});

describe("free tier", () => {
  it("lets an anonymous-but-registered user do the express assessment", () => {
    expect(can("free", "assessment.express")).toBe(true);
    expect(can("free", "usecases.browse")).toBe(true);
  });

  it("gives away no numbers — the whole point of the paywall", () => {
    // Browsing the catalogue is the teaser; scores, effort and every
    // calculator figure are what a competitor would actually want.
    for (const c of [
      "usecases.scores",
      "usecases.effort",
      "calculator.cloud",
      "calculator.llm",
      "calculator.headcount",
      "benchmark.peers",
    ] as Capability[]) {
      expect(can("free", c), c).toBe(false);
    }
  });
});

describe("redactFor", () => {
  const row = { name: "Scoring crediticio", impact: 9, difficulty: 7 };

  it("passes the value through untouched when the tier allows it", () => {
    expect(redactFor(row, ["impact", "difficulty"], "plan", "usecases.scores")).toEqual(row);
  });

  it("nulls gated fields but keeps the shape, so the UI can still lay out", () => {
    const out = redactFor(row, ["impact", "difficulty"], "free", "usecases.scores");
    expect(out.name).toBe("Scoring crediticio");
    expect(out.impact).toBeNull();
    expect(out.difficulty).toBeNull();
  });

  it("does not mutate the input", () => {
    const original = { ...row };
    redactFor(row, ["impact"], "free", "usecases.scores");
    expect(row).toEqual(original);
  });

  it("redacts every row in a list", () => {
    const rows = redactAll([row, row], ["impact"], "free", "usecases.scores");
    expect(rows).toHaveLength(2);
    for (const r of rows) expect(r.impact).toBeNull();
  });

  it("leaves nothing readable behind on a redacted row", () => {
    // The failure this guards against: hiding a number in the UI while still
    // serialising it into the page, where devtools reads it in ten seconds.
    const out = redactFor(row, ["impact", "difficulty"], "free", "usecases.scores");
    expect(JSON.stringify(out)).not.toContain("9");
    expect(JSON.stringify(out)).not.toContain("7");
  });
});

describe("tierFor", () => {
  it("points at the cheapest tier that unlocks a capability", () => {
    expect(tierFor("assessment.express")).toBe("free");
    expect(tierFor("benchmark.peers")).toBe("diagnostic");
    expect(tierFor("calculator.llm")).toBe("plan");
    expect(tierFor("session.guided")).toBe("guided");
  });

  it("returns a tier that really does grant it", () => {
    for (const c of ALL_CAPABILITIES) {
      const t = tierFor(c) as TierId;
      expect(can(t, c), c).toBe(true);
    }
  });
});
