import type { L } from "./framework";
import { FRONTIER_MODELS } from "./llmModels";

/**
 * LLM INFERENCE PRICING
 * =====================
 * The calculator priced AI projects without a single token of inference cost:
 * the AI dimension charged design, build, evaluation and deployment days and
 * stopped there. For a tool that claims to cost an AI project, that is the
 * largest hole in the model — and the easiest to close honestly, because every
 * provider publishes per-token rates.
 *
 * Prices are NOT restated here. `llmModels.ts` already carries the model
 * catalogue with its own references; a second table would drift from it the
 * first time a provider repriced. This module contributes the missing half —
 * the workload: how many calls an interaction really makes, what caching is
 * worth, and what a month of that costs.
 *
 * Deliberately NOT modelled: fine-tuning and training runs, dedicated/reserved
 * throughput, image/audio/video tokens, and self-hosted GPU inference. Each is
 * a different cost shape, and quoting one blended number across them would be
 * worse than saying they are out of scope.
 */

export const PRICES_CHECKED = "2026-08-17";

export type Provider = "anthropic" | "openai" | "google";

export const PROVIDER_LABEL: Record<Provider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
};

export const PROVIDER_PRICING_URL: Record<Provider, string> = {
  anthropic: "https://platform.claude.com/docs/en/about-claude/pricing",
  openai: "https://openai.com/api/pricing/",
  google: "https://ai.google.dev/gemini-api/docs/pricing",
};

export interface ModelPrice {
  id: string;
  model: string;
  provider: string;
  /** USD per million input tokens. */
  input: number;
  /** USD per million tokens read from cache. The biggest lever in the model. */
  cachedInput: number;
  /** USD per million output tokens. */
  output: number;
  /** True when the provider publishes no cache rate, so caching buys nothing. */
  noCacheRate: boolean;
}

export function modelPrice(modelId: string): ModelPrice {
  const m = FRONTIER_MODELS.find((x) => x.id === modelId);
  if (!m) throw new Error(`Unknown model id: ${modelId}`);
  return {
    id: m.id,
    model: m.name,
    provider: m.co,
    input: m.pin,
    // A provider with no published cache rate is charged full input price.
    // Treating a missing rate as free would understate every quote.
    cachedInput: m.pc ?? m.pin,
    output: m.pout,
    noCacheRate: m.pc === null,
  };
}

export function allModelIds(): string[] {
  return FRONTIER_MODELS.map((m) => m.id);
}

/** All three providers discount asynchronous batch work by the same 50%. */
export const BATCH_DISCOUNT = 0.5;

/* --------------------------------------------------------- the workload */

export interface LlmWorkload {
  /** An id from the shared model catalogue in llmModels.ts. */
  modelId: string;
  /** End-user interactions per month (a question asked, a document filed). */
  interactionsPerMonth: number;
  /**
   * Model calls per interaction. THE number people forget: a chatbot is 1, but
   * an agent that plans, calls two tools, reads the results and answers is 5 or
   * more. Cost scales on this, not on the number of users.
   */
  callsPerInteraction: number;
  /** Input tokens per call: system prompt + retrieved context + history. */
  inputTokensPerCall: number;
  /** Output tokens per call, including reasoning/thinking tokens. */
  outputTokensPerCall: number;
  /** 0..1 share of input tokens served from cache. The single biggest lever. */
  cacheHitRate: number;
  /** Asynchronous workloads qualify for the 50% batch discount. */
  batch: boolean;
}

export const DEFAULT_WORKLOAD: LlmWorkload = {
  modelId: "claude-opus-5",
  interactionsPerMonth: 20_000,
  callsPerInteraction: 3,
  inputTokensPerCall: 6_000,
  outputTokensPerCall: 700,
  cacheHitRate: 0.6,
  batch: false,
};

export interface LlmCost {
  price: ModelPrice;
  /** Total calls to the model per month. */
  calls: number;
  inputTokens: number;
  cachedTokens: number;
  outputTokens: number;
  inputUsd: number;
  cachedUsd: number;
  outputUsd: number;
  monthlyUsd: number;
  /** Cost of one end-user interaction — the number a business owner recognises. */
  perInteractionUsd: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function estimateLlm(w: LlmWorkload): LlmCost {
  const price = modelPrice(w.modelId);
  const discount = w.batch ? BATCH_DISCOUNT : 1;

  const calls = w.interactionsPerMonth * w.callsPerInteraction;
  const totalInput = calls * w.inputTokensPerCall;
  const hit = Math.min(1, Math.max(0, w.cacheHitRate));

  const cachedTokens = totalInput * hit;
  const freshTokens = totalInput - cachedTokens;
  const outputTokens = calls * w.outputTokensPerCall;

  const perM = (tokens: number, rate: number) => (tokens / 1_000_000) * rate * discount;

  const inputUsd = perM(freshTokens, price.input);
  const cachedUsd = perM(cachedTokens, price.cachedInput);
  const outputUsd = perM(outputTokens, price.output);
  const monthlyUsd = inputUsd + cachedUsd + outputUsd;

  return {
    price,
    calls,
    inputTokens: Math.round(freshTokens),
    cachedTokens: Math.round(cachedTokens),
    outputTokens: Math.round(outputTokens),
    inputUsd: round(inputUsd),
    cachedUsd: round(cachedUsd),
    outputUsd: round(outputUsd),
    monthlyUsd: round(monthlyUsd),
    perInteractionUsd:
      w.interactionsPerMonth === 0
        ? 0
        : Math.round((monthlyUsd / w.interactionsPerMonth) * 10000) / 10000,
  };
}

/**
 * The same workload priced across every model in the catalogue, cheapest first.
 * This is the comparison that actually changes an architecture decision: the
 * spread between the cheapest and dearest model on one real workload is
 * routinely more than an order of magnitude.
 */
export function compareModels(w: LlmWorkload, ids: string[] = allModelIds()): LlmCost[] {
  return ids
    .map((modelId) => estimateLlm({ ...w, modelId }))
    .sort((a, b) => a.monthlyUsd - b.monthlyUsd);
}

/**
 * What the workload would cost with no prompt caching, so the client can see
 * what the cache is worth before an engineer argues for it in a design review.
 */
export function cacheSavings(w: LlmWorkload): { withCache: number; without: number; savedPct: number } {
  const withCache = estimateLlm(w).monthlyUsd;
  const without = estimateLlm({ ...w, cacheHitRate: 0 }).monthlyUsd;
  return {
    withCache,
    without,
    savedPct: without === 0 ? 0 : Math.round(((without - withCache) / without) * 100),
  };
}

/**
 * Sensible starting workload for a kind of AI use case. These are shapes, not
 * measurements: a retrieval agent really is input-heavy and really does make
 * several calls per question, but the exact numbers must be replaced with
 * measurements from a pilot before anyone signs anything.
 */
export const WORKLOAD_PRESETS: { id: string; label: L; patch: Partial<LlmWorkload> }[] = [
  {
    id: "ragAgent",
    label: { es: "Agente con recuperación (RAG)", en: "Retrieval agent (RAG)" },
    patch: { callsPerInteraction: 3, inputTokensPerCall: 6_000, outputTokensPerCall: 700, cacheHitRate: 0.6 },
  },
  {
    id: "toolAgent",
    label: { es: "Agente con herramientas (multi-paso)", en: "Tool-using agent (multi-step)" },
    patch: { callsPerInteraction: 8, inputTokensPerCall: 9_000, outputTokensPerCall: 900, cacheHitRate: 0.7 },
  },
  {
    id: "classify",
    label: { es: "Clasificación y extracción por lote", en: "Batch classification and extraction" },
    patch: { callsPerInteraction: 1, inputTokensPerCall: 1_500, outputTokensPerCall: 150, cacheHitRate: 0.2, batch: true },
  },
  {
    id: "summarize",
    label: { es: "Resumen de documentos largos", en: "Long-document summarisation" },
    patch: { callsPerInteraction: 1, inputTokensPerCall: 40_000, outputTokensPerCall: 1_200, cacheHitRate: 0.1 },
  },
  {
    id: "copilot",
    label: { es: "Copiloto conversacional", en: "Conversational copilot" },
    patch: { callsPerInteraction: 1, inputTokensPerCall: 3_000, outputTokensPerCall: 500, cacheHitRate: 0.5 },
  },
];
