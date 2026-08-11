import { describe, expect, it } from "vitest";
import { AZURE } from "./cloudPricing";
import {
  DEFAULT_INPUTS,
  estimateAll,
  ingestGbPerMonth,
  projectDataGb,
  sizeFabricCu,
  type CostInputs,
} from "./costModel";

const withInputs = (patch: Partial<CostInputs>): CostInputs => ({
  ...DEFAULT_INPUTS,
  ...patch,
});

const stack = (input: CostInputs, id: string, dataGb?: number) =>
  estimateAll(input, dataGb).find((s) => s.id === id)!;

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
