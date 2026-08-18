import { describe, expect, it } from "vitest";
import {
  breakEvenDay,
  DEFAULT_ASSUMPTIONS,
  deriveAll,
  deriveRate,
  MEXICO_MONTHLY_MXN,
  RATE_SOURCES,
  salaryUsd,
  SENIORITY_LABEL,
  SENIORITY_ORDER,
  SENIORITY_YEARS,
  US_BENCHMARK,
  type RateAssumptions,
} from "./rateCard";

const a = (patch: Partial<RateAssumptions> = {}): RateAssumptions => ({
  ...DEFAULT_ASSUMPTIONS,
  ...patch,
});

describe("salary bands", () => {
  it("labels every seniority in both languages", () => {
    for (const s of SENIORITY_ORDER) {
      expect(SENIORITY_LABEL[s].es.length).toBeGreaterThan(0);
      expect(SENIORITY_YEARS[s].en.length).toBeGreaterThan(0);
    }
  });

  it("keeps every band ordered low <= mid <= high", () => {
    for (const s of SENIORITY_ORDER) {
      for (const band of [US_BENCHMARK[s], MEXICO_MONTHLY_MXN[s]]) {
        expect(band.low, s).toBeLessThanOrEqual(band.mid);
        expect(band.mid, s).toBeLessThanOrEqual(band.high);
      }
    }
  });

  it("pays more as seniority rises, in both markets", () => {
    const rising = (get: (s: (typeof SENIORITY_ORDER)[number]) => number) => {
      // Architect is a parallel track to principal, not strictly above it, so
      // the monotonic check covers the individual-contributor ladder only.
      const ladder = ["junior", "mid", "senior", "principal"] as const;
      for (let i = 1; i < ladder.length; i++) {
        expect(get(ladder[i]), ladder[i]).toBeGreaterThan(get(ladder[i - 1]));
      }
    };
    rising((s) => US_BENCHMARK[s].mid);
    rising((s) => MEXICO_MONTHLY_MXN[s].mid);
  });

  it("converts Mexican monthly MXN into annual USD", () => {
    const s = salaryUsd("senior", a({ market: "mexico", fx: 20 }));
    expect(s).toBeCloseTo((MEXICO_MONTHLY_MXN.senior.mid * 12) / 20, 2);
  });

  it("never divides by a zero exchange rate", () => {
    expect(Number.isFinite(salaryUsd("senior", a({ market: "mexico", fx: 0 })))).toBe(true);
  });
});

describe("deriveRate", () => {
  it("charges more per day than the person costs per day", () => {
    for (const r of deriveAll()) {
      expect(r.ratePerDay, r.seniority).toBeGreaterThan(r.costPerDay);
    }
  });

  it("adds employer burden on top of salary", () => {
    const r = deriveRate("senior", a({ loadFactor: 1.35 }));
    expect(r.loadedUsd).toBeCloseTo(r.salaryUsd * 1.35, 0);
  });

  it("bills far fewer days than the year contains", () => {
    // The error this file exists to prevent: dividing salary by 260 days
    // produces a rate that cannot cover the person who earns it.
    const r = deriveRate("senior", a({ workingDaysPerYear: 240, utilisation: 0.75 }));
    expect(r.billableDays).toBe(180);
    expect(r.billableDays).toBeLessThan(240);
  });

  it("raises the day rate when utilisation falls", () => {
    // Same salary spread over fewer billable days has to cost more per day.
    const busy = deriveRate("senior", a({ utilisation: 0.9 })).ratePerDay;
    const idle = deriveRate("senior", a({ utilisation: 0.5 })).ratePerDay;
    expect(idle).toBeGreaterThan(busy);
  });

  it("refuses an impossible utilisation instead of producing a free consultant", () => {
    expect(deriveRate("senior", a({ utilisation: 0 })).ratePerDay).toBeGreaterThan(0);
    expect(deriveRate("senior", a({ utilisation: 5 })).billableDays).toBeLessThanOrEqual(240);
  });

  it("prices the US benchmark above the Mexican market at the same seniority", () => {
    const mx = deriveRate("senior", a({ market: "mexico" })).ratePerDay;
    const us = deriveRate("senior", a({ market: "usBenchmark" })).ratePerDay;
    expect(us).toBeGreaterThan(mx);
  });

  it("moves with the band point, so a quote can be conservative or aggressive", () => {
    const low = deriveRate("senior", DEFAULT_ASSUMPTIONS, "low").ratePerDay;
    const high = deriveRate("senior", DEFAULT_ASSUMPTIONS, "high").ratePerDay;
    expect(high).toBeGreaterThan(low);
  });

  it("exposes every intermediate step, so the client argues with the assumption", () => {
    const r = deriveRate("principal");
    expect(r.salaryUsd).toBeGreaterThan(0);
    expect(r.loadedUsd).toBeGreaterThan(r.salaryUsd);
    expect(r.costPerDay).toBeGreaterThan(0);
    expect(r.ratePerDay).toBeGreaterThan(r.costPerDay);
  });
});

describe("breakEvenDay", () => {
  it("sits below the quoted rate — that gap is the margin", () => {
    for (const s of SENIORITY_ORDER) {
      expect(breakEvenDay(s)).toBeLessThan(deriveRate(s).ratePerDay);
    }
  });

  it("ignores margin entirely, because a floor is not a price", () => {
    const cheap = breakEvenDay("senior", a({ marginMultiplier: 1.1 }));
    const rich = breakEvenDay("senior", a({ marginMultiplier: 4 }));
    expect(cheap).toBe(rich);
  });
});

describe("provenance", () => {
  it("marks the margin as an assumption, never as measured", () => {
    // The honesty rule for this file: salary is sourced, markup is a choice.
    const assumption = RATE_SOURCES.find((s) => s.kind === "assumption")!;
    expect(assumption.label.es).toMatch(/supuesto/i);
    expect(RATE_SOURCES.some((s) => s.kind === "measured")).toBe(true);
  });

  it("links every sourced claim to somewhere the reader can check it", () => {
    for (const s of RATE_SOURCES) {
      if (s.kind === "assumption") continue;
      expect(s.url).toMatch(/^https:\/\//);
    }
  });
});
