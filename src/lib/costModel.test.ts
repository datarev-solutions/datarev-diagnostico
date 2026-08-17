import { describe, expect, it } from "vitest";
import { AI_IMPLEMENTATION, AZURE, MIGRATION } from "./cloudPricing";
import { rollUpUseCases, USE_CASES } from "./useCases";
import {
  DEFAULT_INPUTS,
  estimateAi,
  estimateAll,
  estimateFromUseCases,
  estimateEngineMatrix,
  estimateEngines,
  estimateMigration,
  ingestGbPerMonth,
  projectDataGb,
  projectTotals,
  selectedTotals,
  type ProjectDimension,
  sizeFabricCu,
  sizeDatabricksWarehouse,
  sizeSnowflakeWarehouse,
  type CostInputs,
  type MigrationRates,
} from "./costModel";

const withInputs = (patch: Partial<CostInputs>): CostInputs => ({
  ...DEFAULT_INPUTS,
  ...patch,
});

const stack = (input: CostInputs, id: string, dataGb?: number) =>
  estimateAll(input, dataGb).find((s) => s.id === id)!;

// One rate for every role, so a test asserting on days is not silently
// asserting on the rate card too. Module scope: several suites need it.
const FLAT_RATES = Object.fromEntries(
  Object.keys(MIGRATION.dayRates).map((r) => [r, 900]),
) as MigrationRates;

describe("derived volumes", () => {
  it("counts reprocessing, not just growth, in monthly ingest", () => {
    const daily = ingestGbPerMonth(withInputs({ dataGb: 1000, growthPct: 0, refresh: "daily" }));
    const realtime = ingestGbPerMonth(withInputs({ dataGb: 1000, growthPct: 0, refresh: "realtime" }));

    // Zero growth still ingests, because each run re-reads part of the set.
    expect(daily).toBeGreaterThan(0);
    expect(realtime).toBeGreaterThan(daily);
  });

  it("compounds growth over the horizon", () => {
    expect(projectDataGb(100, 10, 0)).toBeCloseTo(100);
    expect(projectDataGb(100, 10, 12)).toBeCloseTo(313.84, 1);
  });
});

describe("every stack", () => {
  it("returns four priced columns whose totals equal their parts", () => {
    const stacks = estimateAll(DEFAULT_INPUTS);
    expect(stacks).toHaveLength(4);

    for (const s of stacks) {
      expect(s.total).toBeCloseTo(s.platform + s.licenses + s.ops, 1);
      expect(s.total).toBeGreaterThan(0);
    }
  });

  it("drops the ops line when the toggle is off", () => {
    const withOps = stack(withInputs({ includeOps: true }), "oss");
    const withoutOps = stack(withInputs({ includeOps: false }), "oss");

    expect(withOps.ops).toBeGreaterThan(0);
    expect(withoutOps.ops).toBe(0);
    expect(withOps.total).toBeGreaterThan(withoutOps.total);
  });
});

describe("per-user licensing", () => {
  it("leaves the open stack's licence line at zero however many users pile on", () => {
    const small = stack(withInputs({ viewers: 5 }), "oss");
    const huge = stack(withInputs({ viewers: 5000 }), "oss");

    expect(small.licenses).toBe(0);
    expect(huge.licenses).toBe(0);
  });

  it("charges AWS for readers but not GCP", () => {
    const input = withInputs({ viewers: 200, analysts: 2, creators: 1 });

    // QuickSight bills readers; Looker Studio does not.
    expect(stack(input, "aws").licenses).toBeGreaterThan(stack(input, "gcp").licenses);
  });
});

describe("the Fabric F64 licensing cliff", () => {
  it("sizes capacity up as the workload grows", () => {
    const light = sizeFabricCu(withInputs({ queryGbPerMonth: 100 }), 100);
    const heavy = sizeFabricCu(withInputs({ queryGbPerMonth: 100_000 }), 50_000);

    expect(heavy).toBeGreaterThan(light);
  });

  it("keeps the small capacity when few people read reports", () => {
    const azure = stack(withInputs({ viewers: 5, analysts: 2, creators: 1 }), "azure");
    const capacity = azure.groups.platform.find((l) => l.key === "capacity")!;

    expect(capacity.usd).toBeLessThan(AZURE.fabricSkus.find((s) => s.cu === 64)!.monthly);
  });

  it("jumps to F64 when free viewer seats beat paying for licences", () => {
    // A light technical workload with a big audience: the capacity the
    // workload needs is tiny, but 800 Pro seats cost far more than F64.
    const azure = stack(
      withInputs({ viewers: 800, analysts: 5, creators: 2, queryGbPerMonth: 200, dataGb: 200 }),
      "azure",
    );
    const capacity = azure.groups.platform.find((l) => l.key === "capacity")!;
    const f64 = AZURE.fabricSkus.find((s) => s.cu === 64)!;

    expect(capacity.usd).toBe(f64.monthly);
    // Only the 7 editors keep paying.
    expect(azure.licenses).toBe(7 * AZURE.powerBiPro);
    expect(azure.notes.some((n) => n.es.includes("F64"))).toBe(true);
  });

  it("states the breakeven viewer count algebraically, not inflated by editor headcount", () => {
    // Regression: an earlier version added `+ editors` to the breakeven
    // viewer count in the advisory text. Editors pay Pro under both the
    // small SKU and F64+, so their cost term cancels out of the equation —
    // adding them back overstated the breakeven by exactly the editor count.
    const input = withInputs({ viewers: 40, analysts: 8, creators: 3, dataGb: 500, queryGbPerMonth: 2000 });
    const azure = stack(input, "azure");
    // Independently derive the true crossover for this scenario's fitted SKU.
    const fittedSku = AZURE.fabricSkus.find((s) => s.cu >= sizeFabricCu(input, 500))!;
    const f64 = AZURE.fabricSkus.find((s) => s.cu === 64)!;
    const trueBreakeven = Math.ceil((f64.monthly - fittedSku.monthly) / AZURE.powerBiPro);

    const note = azure.notes.find((n) => n.en.includes("crossover"))!;
    expect(note.en).toContain(String(trueBreakeven));
    // The old (buggy) figure included +11 editors — must not appear.
    expect(note.en).not.toContain(String(trueBreakeven + 11));
  });

  it("never pays more than the naive small-capacity option", () => {
    // Whatever the audience size, the chosen configuration must beat or
    // match "smallest capacity that fits + a Pro seat for everyone".
    for (const viewers of [1, 25, 100, 300, 600, 1200]) {
      const input = withInputs({ viewers, analysts: 4, creators: 2, queryGbPerMonth: 500, dataGb: 300 });
      const azure = stack(input, "azure");
      const capacity = azure.groups.platform.find((l) => l.key === "capacity")!;

      const naive =
        AZURE.fabricSkus.find((s) => s.cu >= sizeFabricCu(input, 300))!.monthly +
        (viewers + 6) * AZURE.powerBiPro;

      expect(capacity.usd + azure.licenses).toBeLessThanOrEqual(naive + 0.01);
    }
  });
});

describe("portable engines", () => {
  it("prices three interchangeable engines on the same host", () => {
    const engines = estimateEngines(DEFAULT_INPUTS, 500, "aws");

    expect(engines.map((e) => e.id)).toEqual(["native", "snowflake", "databricks"]);
    for (const e of engines) {
      expect(e.total).toBeCloseTo(e.engineUsd + e.hostUsd, 1);
      expect(e.total).toBeGreaterThan(0);
    }
  });

  it("still charges the host cloud underneath a portable engine", () => {
    // The whole point of the correction: these are not clouds. Object storage
    // and orchestration stay on the host's bill either way.
    for (const host of ["gcp", "aws", "azure"] as const) {
      const [, snowflake, databricks] = estimateEngines(DEFAULT_INPUTS, 500, host);
      expect(snowflake.hostUsd).toBeGreaterThan(0);
      expect(databricks.hostUsd).toBeGreaterThan(0);
    }
  });

  it("gives Databricks no storage markup and Snowflake one", () => {
    // Delta tables sit on the customer's own object storage; Snowflake keeps
    // its own copy at $23/TB. That gap widens with volume.
    const engineStorage = (id: "snowflake" | "databricks", dataGb: number) => {
      const e = estimateEngines(DEFAULT_INPUTS, dataGb, "aws").find((x) => x.id === id)!;
      return e.lines.find((l) => l.key === "storage")?.usd ?? 0;
    };

    expect(engineStorage("snowflake", 10_000)).toBeGreaterThan(0);
    expect(engineStorage("databricks", 10_000)).toBe(0);
  });

  it("steps the Snowflake warehouse up the doubling ladder", () => {
    const small = sizeSnowflakeWarehouse(100, 5);
    const big = sizeSnowflakeWarehouse(50_000, 400);

    expect(big.creditsPerHour).toBeGreaterThan(small.creditsPerHour);
    // Every size on the ladder is a power of two.
    expect(Math.log2(big.creditsPerHour) % 1).toBe(0);
  });

  it("charges Databricks for keeping a warehouse awake, not just for bytes scanned", () => {
    // Regression guard. Pricing only marginal per-TiB consumption put a real
    // BI workload at USD 3/month, which is off by two orders of magnitude:
    // a 2X-Small serverless warehouse is 4 DBU/hour whenever it is awake.
    const engine = estimateEngines(withInputs({ queryGbPerMonth: 200 }), 200, "aws").find(
      (e) => e.id === "databricks",
    )!;
    const sql = engine.lines.find((l) => l.key === "sql")!;
    const jobs = engine.lines.find((l) => l.key === "jobs")!;

    // 4 DBU/h × 60 awake hours × $0.70 = $168 floor, before any scanning.
    expect(sql.usd).toBeGreaterThan(150);
    // A pipeline that runs at all costs something.
    expect(jobs.usd).toBeGreaterThan(0);
  });

  it("steps the Databricks warehouse up with volume and concurrency", () => {
    const small = sizeDatabricksWarehouse(100, 3);
    const big = sizeDatabricksWarehouse(20_000, 300);

    expect(small.dbuPerHour).toBe(4);
    expect(big.dbuPerHour).toBeGreaterThan(small.dbuPerHour);
  });

  it("scales Snowflake compute with how long the warehouse stays awake", () => {
    const compute = (refresh: "daily" | "realtime") =>
      estimateEngines(withInputs({ refresh }), 500, "aws")
        .find((e) => e.id === "snowflake")!
        .lines.find((l) => l.key === "compute")!.usd;

    // Per-second billing while awake means cadence, not data, drives the bill.
    expect(compute("realtime")).toBeGreaterThan(compute("daily") * 5);
  });
});

describe("migration estimate", () => {
  it("returns a range, never a point estimate", () => {
    const m = estimateMigration(DEFAULT_INPUTS, FLAT_RATES);

    expect(m.low).toBeLessThan(m.high);
    expect(m.days).toBeCloseTo(
      m.lines.reduce((a, l) => a + l.days, 0),
      1,
    );
    expect(m.cost).toBeCloseTo(
      m.lines.reduce((a, l) => a + l.cost, 0),
      1,
    );
  });

  it("grows with sources and analysts, and caps the volume component", () => {
    const few = estimateMigration(withInputs({ sources: 2 }), FLAT_RATES);
    const many = estimateMigration(withInputs({ sources: 20 }), FLAT_RATES);
    expect(many.days).toBeGreaterThan(few.days);

    // Backfill effort flattens out — a 500 TB migration is not 50x a 10 TB one.
    const huge = estimateMigration(withInputs({ dataGb: 500_000 }), FLAT_RATES);
    const backfill = huge.lines.find((l) => l.label.en.includes("backfill"))!;
    expect(backfill.days).toBeLessThanOrEqual(30);
  });

  it("prices each line by the role that actually does the work, not one flat rate", () => {
    // Discovery/architecture is senior work; report rebuilds are BI work.
    // With a real (non-flat) rate card the two must diverge.
    const m = estimateMigration(DEFAULT_INPUTS);
    const discovery = m.lines.find((l) => l.roleKey === "architect")!;
    const reports = m.lines.find((l) => l.roleKey === "analyst")!;

    expect(discovery.rate).toBe(MIGRATION.dayRates.architect);
    expect(reports.rate).toBe(MIGRATION.dayRates.analyst);
    expect(discovery.rate).toBeGreaterThan(reports.rate);
    expect(discovery.cost).toBe(discovery.days * discovery.rate);
  });

  it("only counts a discipline if some line actually uses it", () => {
    const m = estimateMigration(DEFAULT_INPUTS);
    const roles = new Set(m.lines.map((l) => l.roleKey));
    expect(roles).toEqual(new Set(["architect", "engineer", "analyst"]));
  });

  it("prices process work — governance, training, PM — not just technical delivery", () => {
    // The gap Dante flagged: a migration estimate that is only "gente
    // building tecnología" undercounts by skipping governance, change
    // management and coordination entirely.
    const m = estimateMigration(DEFAULT_INPUTS);

    expect(m.process.length).toBe(3);
    expect(m.technical.length).toBe(4);
    expect(m.lines.length).toBe(m.technical.length + m.process.length);
    expect(new Set(m.lines.map((l) => l.category))).toEqual(
      new Set(["technical", "process"]),
    );

    const governance = m.process.find((l) => l.label.en.includes("Governance"))!;
    const training = m.process.find((l) => l.label.en.includes("training"))!;
    const pm = m.process.find((l) => l.label.en.includes("coordination"))!;
    expect(governance.days).toBeGreaterThan(0);
    expect(training.days).toBeGreaterThan(0);
    expect(pm.days).toBeGreaterThan(0);
  });

  it("scales governance with source count and training with headcount", () => {
    const fewSources = estimateMigration(withInputs({ sources: 2 }));
    const manySources = estimateMigration(withInputs({ sources: 30 }));
    const govFew = fewSources.process.find((l) => l.label.en.includes("Governance"))!;
    const govMany = manySources.process.find((l) => l.label.en.includes("Governance"))!;
    expect(govMany.days).toBeGreaterThan(govFew.days);

    const smallTeam = estimateMigration(withInputs({ viewers: 5, analysts: 1, creators: 1 }));
    const bigTeam = estimateMigration(withInputs({ viewers: 900, analysts: 20, creators: 10 }));
    const trainSmall = smallTeam.process.find((l) => l.label.en.includes("training"))!;
    const trainBig = bigTeam.process.find((l) => l.label.en.includes("training"))!;
    expect(trainBig.days).toBeGreaterThan(trainSmall.days);
    // Training is capped — a 930-person rollout is not 15 days times bigger.
    expect(trainBig.days).toBeLessThanOrEqual(MIGRATION.training.maxDays);
  });

  it("prices PM/coordination as a share of every other line's days", () => {
    const m = estimateMigration(DEFAULT_INPUTS, {
      ...FLAT_RATES,
      architect: 1000,
      engineer: 1000,
      analyst: 1000,
      mlEngineer: 1000,
      fde: 1000,
    });
    const pm = m.process.find((l) => l.label.en.includes("coordination"))!;
    const everythingElse = m.lines
      .filter((l) => l !== pm)
      .reduce((a, l) => a + l.days, 0);

    expect(pm.days).toBeCloseTo(round2(everythingElse * MIGRATION.pmOverheadPct), 1);
  });
});

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

describe("AI / agents estimate (the fourth dimension)", () => {
  it("is zero-ish at zero use cases but never negative, and grows with use cases", () => {
    const none = estimateAi(withInputs({ aiUseCases: 0 }));
    const some = estimateAi(withInputs({ aiUseCases: 3 }));

    expect(none.days).toBeGreaterThanOrEqual(0);
    expect(none.cost).toBeGreaterThanOrEqual(0);
    expect(some.days).toBeGreaterThan(none.days);
    expect(some.cost).toBeGreaterThan(none.cost);
  });

  it("prices build work on the ML Engineer rate and deployment on the FDE rate", () => {
    const m = estimateAi(withInputs({ aiUseCases: 4, sources: 6 }));
    const build = m.lines.find((l) => l.label.en.includes("Agent development"))!;
    const deploy = m.lines.find((l) => l.label.en.includes("deployment"))!;

    expect(build.roleKey).toBe("mlEngineer");
    expect(build.rate).toBe(MIGRATION.dayRates.mlEngineer);
    expect(deploy.roleKey).toBe("fde");
    expect(deploy.rate).toBe(MIGRATION.dayRates.fde);
    // FDE is the deck's premium embedded role — priced highest of the five.
    expect(MIGRATION.dayRates.fde).toBeGreaterThan(MIGRATION.dayRates.architect);
  });

  it("scales deployment with source count, independent of use-case count", () => {
    const fewSources = estimateAi(withInputs({ aiUseCases: 2, sources: 2 }));
    const manySources = estimateAi(withInputs({ aiUseCases: 2, sources: 20 }));
    const deployFew = fewSources.lines.find((l) => l.label.en.includes("deployment"))!;
    const deployMany = manySources.lines.find((l) => l.label.en.includes("deployment"))!;

    expect(deployMany.days).toBeGreaterThan(deployFew.days);
    expect(deployMany.days).toBeCloseTo(
      AI_IMPLEMENTATION.deployment.baseDays +
        20 * AI_IMPLEMENTATION.deployment.daysPerSource +
        2 * AI_IMPLEMENTATION.deployment.daysPerUseCase,
      1,
    );
  });

  it("is independent of estimateMigration — a project can order either without the other", () => {
    const input = withInputs({ aiUseCases: 5, sources: 10 });
    const migration = estimateMigration(input);
    const ai = estimateAi(input);

    // Disjoint line sets: no AI line leaks into migration's totals or vice versa.
    const migrationLabels = new Set(migration.lines.map((l) => l.label.en));
    const aiLabels = new Set(ai.lines.map((l) => l.label.en));
    for (const label of aiLabels) expect(migrationLabels.has(label)).toBe(false);
  });

  it("returns a range, never a point estimate", () => {
    const m = estimateAi(withInputs({ aiUseCases: 3 }));
    expect(m.low).toBeLessThan(m.high);
    expect(m.cost).toBeCloseTo(
      m.lines.reduce((a, l) => a + l.cost, 0),
      1,
    );
  });
});

describe("project totals (the four selectable dimensions)", () => {
  const build = (input = DEFAULT_INPUTS) => {
    const stack = estimateAll(input).find((s) => s.id === "gcp")!;
    const migration = estimateMigration(input);
    const ai = estimateAi(input);
    return { stack, migration, ai, totals: projectTotals(stack, migration, ai) };
  };

  it("accounts for every peso exactly once — nothing lost, nothing double-counted", () => {
    // The property that makes the chips safe to toggle: the four dimensions
    // must partition the model's money, not overlap or leave a remainder.
    // Asserted on projectTotals, at full precision — selectedTotals rounds
    // for display, which is a separate concern tested below.
    const { stack, migration, ai, totals } = build();
    const all: ProjectDimension[] = ["tech", "people", "process", "ai"];
    const monthly = all.reduce((a, d) => a + totals[d].monthly, 0);
    const oneTime = all.reduce((a, d) => a + totals[d].oneTime, 0);

    expect(monthly).toBeCloseTo(stack.total, 1);
    expect(oneTime).toBeCloseTo(round2(migration.cost + ai.cost), 1);
  });

  it("puts people on both sides — they cost money to build and to run", () => {
    const { totals } = build();
    expect(totals.people.monthly).toBeGreaterThan(0);
    expect(totals.people.oneTime).toBeGreaterThan(0);

    // The other three sit on exactly one side.
    expect(totals.tech.oneTime).toBe(0);
    expect(totals.process.monthly).toBe(0);
    expect(totals.ai.monthly).toBe(0);
  });

  it("drops a dimension's cost entirely when it is deselected", () => {
    const { totals } = build();
    const withAi = selectedTotals(totals, ["tech", "people", "process", "ai"]);
    const withoutAi = selectedTotals(totals, ["tech", "people", "process"]);

    expect(withAi.oneTime - withoutAi.oneTime).toBeCloseTo(totals.ai.oneTime, 1);
    expect(withAi.monthly).toBeCloseTo(withoutAi.monthly, 1);
  });

  it("returns zero for an empty selection rather than NaN", () => {
    const { totals } = build();
    const none = selectedTotals(totals, []);
    expect(none).toEqual({ monthly: 0, oneTime: 0, firstYear: 0 });
  });

  it("computes first-year as one-time plus twelve months", () => {
    const { totals } = build();
    const t = selectedTotals(totals, ["tech", "people"]);
    expect(t.firstYear).toBeCloseTo(round2(t.oneTime + t.monthly * 12), 1);
  });

  it("adds up exactly in whole dollars, the way a client checks it by hand", () => {
    // Regression: hidden cents in the monthly figure, multiplied by 12, put
    // first-year 6 dollars above what the displayed monthly predicts. All
    // three headline figures must reconcile against the displayed parts.
    const all: ProjectDimension[] = ["tech", "people", "process", "ai"];
    for (const input of [
      DEFAULT_INPUTS,
      withInputs({ dataGb: 12_000, viewers: 300, sources: 14, aiUseCases: 6 }),
      withInputs({ dataGb: 60, viewers: 3, sources: 1, aiUseCases: 0 }),
    ]) {
      const stack = estimateAll(input).find((s) => s.id === "gcp")!;
      const totals = projectTotals(stack, estimateMigration(input), estimateAi(input));
      const t = selectedTotals(totals, all);

      // Every headline is an integer, and the parts sum to it exactly.
      expect(Number.isInteger(t.monthly)).toBe(true);
      expect(Number.isInteger(t.oneTime)).toBe(true);
      expect(t.monthly).toBe(all.reduce((a, d) => a + Math.round(totals[d].monthly), 0));
      expect(t.oneTime).toBe(all.reduce((a, d) => a + Math.round(totals[d].oneTime), 0));
      expect(t.firstYear).toBe(t.oneTime + t.monthly * 12);
    }
  });
});

describe("catalogue-driven delivery (planner feeding the calculator)", () => {
  const picks = USE_CASES.filter((u) =>
    ["fin-cockpit", "cust-churn", "cust-support-agent"].includes(u.id),
  );

  it("prices exactly the role-days the catalogue says, at the shared rates", () => {
    const est = estimateFromUseCases(picks);
    const roll = rollUpUseCases(picks);

    expect(est.days).toBeCloseTo(roll.totalDays, 1);
    for (const line of est.lines) {
      expect(line.cost).toBeCloseTo(line.days * MIGRATION.dayRates[line.roleKey], 1);
    }
  });

  it("is an alternative to estimateAi, never additive", () => {
    // The calculator swaps one for the other. If a future edit ever summed
    // them, the same build work would be billed twice — this pins the intent.
    const fromCatalogue = estimateFromUseCases(picks);
    const generic = estimateAi(withInputs({ aiUseCases: picks.length }));

    expect(fromCatalogue.cost).toBeGreaterThan(0);
    expect(generic.cost).toBeGreaterThan(0);
    // Different methods, so they must not coincidentally be equal — that
    // would hide a swap that silently did nothing.
    expect(fromCatalogue.cost).not.toBe(generic.cost);
  });

  it("distinguishes a dashboard from an agent, which the generic formula cannot", () => {
    // The whole reason the planner exists.
    const dashboard = estimateFromUseCases(USE_CASES.filter((u) => u.id === "fin-budget"));
    const agent = estimateFromUseCases(
      USE_CASES.filter((u) => u.id === "cust-support-agent"),
    );

    expect(agent.cost).toBeGreaterThan(dashboard.cost);
    // And they draw on different people, not just more of the same.
    expect(agent.lines.some((l) => l.roleKey === "fde")).toBe(true);
    expect(dashboard.lines.some((l) => l.roleKey === "fde")).toBe(false);
  });

  it("returns zero for an empty selection so the caller can fall back", () => {
    const est = estimateFromUseCases([]);
    expect(est.cost).toBe(0);
    expect(est.days).toBe(0);
    expect(est.lines).toEqual([]);
  });

  it("respects edited day rates", () => {
    const cheap = estimateFromUseCases(picks, {
      ...FLAT_RATES,
      architect: 100,
      engineer: 100,
      analyst: 100,
      mlEngineer: 100,
      fde: 100,
    });
    const roll = rollUpUseCases(picks);
    expect(cheap.cost).toBeCloseTo(roll.totalDays * 100, 0);
  });
});

describe("engine matrix (all hosts together)", () => {
  it("returns three hosts, each with the three engines", () => {
    const matrix = estimateEngineMatrix(DEFAULT_INPUTS, 500);
    expect(matrix.map((m) => m.host)).toEqual(["gcp", "aws", "azure"]);
    for (const row of matrix) {
      expect(row.engines.map((e) => e.id)).toEqual(["native", "snowflake", "databricks"]);
    }
  });

  it("matches estimateEngines called per host directly", () => {
    const matrix = estimateEngineMatrix(DEFAULT_INPUTS, 500);
    for (const row of matrix) {
      const direct = estimateEngines(DEFAULT_INPUTS, 500, row.host);
      expect(row.engines.map((e) => e.total)).toEqual(direct.map((e) => e.total));
    }
  });
});

describe("BigQuery compute model", () => {
  it("stays on-demand at low scan volumes", () => {
    const gcp = stack(withInputs({ queryGbPerMonth: 2000 }), "gcp");
    const compute = gcp.groups.platform.find((l) => l.key === "compute")!;

    expect(compute.detail!.es).toContain("on-demand");
  });

  it("switches to a reservation once scanning gets expensive", () => {
    const gcp = stack(withInputs({ queryGbPerMonth: 900 * 1024 }), "gcp");
    const compute = gcp.groups.platform.find((l) => l.key === "compute")!;

    expect(compute.detail!.es).toContain("Reserva");
    expect(compute.usd).toBe(100 * 730 * 0.06);
  });

  it("puts the on-demand/reservation crossover just past 700 TiB", () => {
    // Worth pinning down: a 100-slot Enterprise reservation is $4,380/month,
    // which buys 701.8 TiB of on-demand scanning at $6.25/TiB after the free
    // TiB. Popular guidance says to switch at "$5,000/month of spend", which
    // lands in the right neighbourhood but is not the actual break-even —
    // and the gap is a few hundred TiB of scanning either way.
    const below = stack(withInputs({ queryGbPerMonth: 690 * 1024 }), "gcp");
    const above = stack(withInputs({ queryGbPerMonth: 715 * 1024 }), "gcp");

    expect(below.groups.platform.find((l) => l.key === "compute")!.detail!.es).toContain("on-demand");
    expect(above.groups.platform.find((l) => l.key === "compute")!.detail!.es).toContain("Reserva");
  });

  it("gives away the first TiB", () => {
    const free = stack(withInputs({ queryGbPerMonth: 1024 }), "gcp");
    const compute = free.groups.platform.find((l) => l.key === "compute")!;

    expect(compute.usd).toBe(0);
  });
});
