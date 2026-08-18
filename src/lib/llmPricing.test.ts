import { describe, expect, it } from "vitest";
import {
  allModelIds,
  BATCH_DISCOUNT,
  cacheSavings,
  compareModels,
  DEFAULT_WORKLOAD,
  estimateLlm,
  modelPrice,
  PROVIDER_PRICING_URL,
  WORKLOAD_PRESETS,
  type LlmWorkload,
  type Provider,
} from "./llmPricing";

const PROVIDERS: Provider[] = ["anthropic", "openai", "google"];

const w = (patch: Partial<LlmWorkload> = {}): LlmWorkload => ({ ...DEFAULT_WORKLOAD, ...patch });

describe("prices read from the shared catalogue", () => {
  it("resolves every catalogue id to a usable price", () => {
    for (const id of allModelIds()) {
      const p = modelPrice(id);
      expect(p.model.length, id).toBeGreaterThan(0);
      expect(p.input, id).toBeGreaterThan(0);
      expect(p.output, id).toBeGreaterThan(0);
    }
  });

  it("throws on an unknown id rather than pricing at zero", () => {
    // Silently costing nothing is far worse than failing loudly.
    expect(() => modelPrice("no-such-model")).toThrow();
  });

  it("charges more for output than input on every model", () => {
    for (const id of allModelIds()) {
      const p = modelPrice(id);
      expect(p.output, id).toBeGreaterThan(p.input);
    }
  });

  it("bills a missing cache rate at full input price, never free", () => {
    // The catalogue stores null when a provider publishes no cache rate.
    // Treating that as free would understate the quote.
    for (const id of allModelIds()) {
      const p = modelPrice(id);
      if (p.noCacheRate) expect(p.cachedInput).toBe(p.input);
      else expect(p.cachedInput).toBeLessThan(p.input);
    }
  });

  it("points every provider at its own official pricing page", () => {
    for (const p of PROVIDERS) {
      expect(PROVIDER_PRICING_URL[p]).toMatch(/^https:\/\//);
    }
  });
});

describe("estimateLlm", () => {
  it("splits the bill into fresh input, cache reads and output", () => {
    const c = estimateLlm(w());
    expect(c.monthlyUsd).toBeCloseTo(c.inputUsd + c.cachedUsd + c.outputUsd, 1);
    expect(c.monthlyUsd).toBeGreaterThan(0);
  });

  it("counts calls, not interactions — the multiplier people forget", () => {
    // An agent that plans, calls two tools and answers costs several times a
    // chatbot serving the same number of questions. Missing this is the same
    // class of error as pricing a warehouse on marginal scans only.
    const chatbot = estimateLlm(w({ callsPerInteraction: 1 }));
    const agent = estimateLlm(w({ callsPerInteraction: 8 }));

    expect(agent.calls).toBe(chatbot.calls * 8);
    expect(agent.monthlyUsd).toBeCloseTo(chatbot.monthlyUsd * 8, 0);
  });

  it("makes caching cut the bill, and says by how much", () => {
    const s = cacheSavings(w({ cacheHitRate: 0.9 }));
    expect(s.withCache).toBeLessThan(s.without);
    expect(s.savedPct).toBeGreaterThan(0);
    expect(s.savedPct).toBeLessThanOrEqual(100);
  });

  it("applies the batch discount to both input and output", () => {
    const live = estimateLlm(w({ batch: false }));
    const batched = estimateLlm(w({ batch: true }));
    expect(batched.monthlyUsd).toBeCloseTo(live.monthlyUsd * BATCH_DISCOUNT, 1);
  });

  it("clamps a nonsense cache rate instead of producing a negative bill", () => {
    expect(estimateLlm(w({ cacheHitRate: 5 })).monthlyUsd).toBeGreaterThan(0);
    expect(estimateLlm(w({ cacheHitRate: -3 })).monthlyUsd).toBeGreaterThan(0);
  });

  it("survives a zero workload without dividing by zero", () => {
    const c = estimateLlm(w({ interactionsPerMonth: 0 }));
    expect(c.monthlyUsd).toBe(0);
    expect(Number.isNaN(c.perInteractionUsd)).toBe(false);
    expect(c.perInteractionUsd).toBe(0);
  });

  it("reports a per-interaction cost a business owner can sanity-check", () => {
    const c = estimateLlm(w());
    expect(c.perInteractionUsd).toBeCloseTo(c.monthlyUsd / DEFAULT_WORKLOAD.interactionsPerMonth, 4);
  });

  it("spreads the same workload widely across models", () => {
    // The single most valuable thing this comparison shows: model choice moves
    // the bill by more than an order of magnitude on identical work.
    const rows = compareModels(w());
    const cheapest = rows[0].monthlyUsd;
    const dearest = rows[rows.length - 1].monthlyUsd;
    expect(dearest).toBeGreaterThan(cheapest * 10);
  });
});

describe("compareModels", () => {
  it("prices the workload on every catalogue model, cheapest first", () => {
    const rows = compareModels(w());
    expect(rows).toHaveLength(allModelIds().length);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].monthlyUsd).toBeGreaterThanOrEqual(rows[i - 1].monthlyUsd);
    }
  });

  it("does not let the currently selected model change the ranking", () => {
    const fromA = compareModels(w({ modelId: "claude-opus-5" })).map((r) => r.price.id);
    const fromB = compareModels(w({ modelId: "gemini-3.1-pro" })).map((r) => r.price.id);
    expect(fromA).toEqual(fromB);
  });
});

describe("workload presets", () => {
  it("gives every preset a label and a real patch", () => {
    for (const p of WORKLOAD_PRESETS) {
      expect(p.label.es.length).toBeGreaterThan(0);
      expect(p.label.en.length).toBeGreaterThan(0);
      expect(Object.keys(p.patch).length).toBeGreaterThan(0);
    }
  });

  it("makes a multi-step tool agent cost more than a single-shot copilot", () => {
    const preset = (id: string) => WORKLOAD_PRESETS.find((p) => p.id === id)!.patch;
    const agent = estimateLlm(w(preset("toolAgent")));
    const copilot = estimateLlm(w(preset("copilot")));
    expect(agent.monthlyUsd).toBeGreaterThan(copilot.monthlyUsd);
  });

  it("batches the classification preset, because it is asynchronous", () => {
    const preset = WORKLOAD_PRESETS.find((p) => p.id === "classify")!.patch;
    expect(preset.batch).toBe(true);
  });
});
