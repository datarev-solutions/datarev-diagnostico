import { describe, expect, it } from "vitest";
import { APQC_CATEGORY, BUSINESS_PROCESSES, topProcesses } from "./processes";
import { USE_CASES } from "./useCases";

describe("catalogue integrity", () => {
  it("has unique ids", () => {
    const ids = BUSINESS_PROCESSES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every process a name, a one-line purpose, and at least one industry", () => {
    for (const p of BUSINESS_PROCESSES) {
      expect(p.name.es.length, p.id).toBeGreaterThan(0);
      expect(p.name.en.length, p.id).toBeGreaterThan(0);
      expect(p.what.es.length, p.id).toBeGreaterThan(0);
      expect(p.industries.length, p.id).toBeGreaterThan(0);
    }
  });

  it("has an APQC category for every department in use", () => {
    for (const p of BUSINESS_PROCESSES) {
      expect(APQC_CATEGORY[p.department], p.id).toBeDefined();
    }
  });

  it("only links to use cases that actually exist in the catalogue", () => {
    const ids = new Set(USE_CASES.map((u) => u.id));
    for (const p of BUSINESS_PROCESSES) {
      if (p.linkedUseCaseId) expect(ids, p.id).toContain(p.linkedUseCaseId);
    }
  });

  it("agrees with the use case's own department when linked", () => {
    // A process listed under Risk should not silently link to a use case that
    // the catalogue files under Operations — that would make the two screens
    // disagree about who owns the work.
    const byId = new Map(USE_CASES.map((u) => [u.id, u]));
    for (const p of BUSINESS_PROCESSES) {
      if (!p.linkedUseCaseId) continue;
      const uc = byId.get(p.linkedUseCaseId)!;
      expect(uc.department, p.id).toBe(p.department);
    }
  });

  it("covers every department with at least five processes", () => {
    const departments = Object.keys(APQC_CATEGORY);
    for (const d of departments) {
      const count = BUSINESS_PROCESSES.filter((p) => p.department === d).length;
      expect(count, d).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("topProcesses", () => {
  it("returns everything for a department when there is no industry filter", () => {
    const all = BUSINESS_PROCESSES.filter((p) => p.department === "hr");
    const result = topProcesses("all", "hr", 999);
    expect(result.length).toBe(all.length);
  });

  it("ranks industry-specific processes above cross-industry ones", () => {
    const result = topProcesses("banking", "risk", 20);
    const firstCrossIndex = result.findIndex((p) => !p.industries.includes("banking"));
    const lastSpecificIndex = result.map((p) => p.industries.includes("banking")).lastIndexOf(true);
    // Every banking-specific entry must come before every generic one.
    if (firstCrossIndex !== -1 && lastSpecificIndex !== -1) {
      expect(lastSpecificIndex).toBeLessThan(firstCrossIndex);
    }
  });

  it("excludes processes tagged to a different specific industry", () => {
    const result = topProcesses("retail", "risk", 20);
    const ids = result.map((p) => p.id);
    // AML and credit scoring are banking-only, not cross — must not leak into retail.
    expect(ids).not.toContain("proc-aml");
    expect(ids).not.toContain("proc-credit-scoring");
  });

  it("respects the limit", () => {
    const result = topProcesses("all", "operations", 3);
    expect(result.length).toBe(3);
  });

  it("gives a banking risk team its sector-specific processes, not just generic risk", () => {
    // The same gap that was flagged in the use-case catalogue, one level up:
    // a real department has processes beyond the ones DataRev built a case for.
    const result = topProcesses("banking", "risk", 10);
    const ids = result.map((p) => p.id);
    expect(ids).toContain("proc-aml");
    expect(ids).toContain("proc-credit-scoring");
    expect(ids).toContain("proc-ecl");
  });

  it("filters by industry alone when department is 'all'", () => {
    const result = topProcesses("manufacturing", "all", 50);
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.industries.includes("cross") || p.industries.includes("manufacturing")).toBe(true);
    }
  });
});
