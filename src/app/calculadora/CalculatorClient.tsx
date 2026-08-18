"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Footer, Header } from "@/components/Chrome";
import { ConsultCTA } from "@/components/ConsultCTA";
import { HeadcountPanel } from "@/components/HeadcountPanel";
import { LlmCostCalculator } from "@/components/LlmCostCalculator";
import {
  MIGRATION,
  PRICING_CHECKED,
  PRICING_SOURCES,
  PROVENANCE,
  REGION_NOTE,
  ROLE_LABEL,
  type MigrationRole,
  type Provenance,
} from "@/lib/cloudPricing";
import {
  DEFAULT_INPUTS,
  estimateAi,
  estimateAll,
  estimateFromUseCases,
  estimateEngineMatrix,
  estimateEngines,
  estimateMigration,
  projectDataGb,
  projectTotals,
  selectedTotals,
  type CostInputs,
  type EngineId,
  type HostCloud,
  type MigrationRates,
  type ProjectDimension,
  type Refresh,
  type StackCost,
  type StackId,
} from "@/lib/costModel";
import type { L } from "@/lib/framework";
import { CALC } from "@/lib/i18nCalc";
import { Gated } from "@/components/Gate";
import type { TierId } from "@/lib/tiers";
import { useUseCaseSelection } from "@/lib/useCaseSelection";

const HOST_LABELS: Record<HostCloud, string> = {
  gcp: "GCP",
  aws: "AWS",
  azure: "Azure",
};

// Two separate rate editors — Migration's technical/process roles, and the
// AI workstream's roles — both write into the same shared `rates` state, so
// an edit in either place applies project-wide, not just to that section.
const DIMENSIONS: { id: ProjectDimension; label: L; hint: L }[] = [
  { id: "tech", label: CALC.dimTech, hint: CALC.dimTechHint },
  { id: "people", label: CALC.dimPeople, hint: CALC.dimPeopleHint },
  { id: "process", label: CALC.dimProcess, hint: CALC.dimProcessHint },
  { id: "ai", label: CALC.dimAi, hint: CALC.dimAiHint },
];

/* The roles these two estimators actually price. Labels come from the rate card
 * so the calculator and the planner never spell a role differently. */
const ROLE_ORDER: MigrationRole[] = ["architect", "engineer", "analyst"];
const AI_ROLE_ORDER: MigrationRole[] = ["mlEngineer", "fde"];

/**
 * Provenance badges. Green for what the vendor publishes, amber for what we
 * assumed — so nobody has to take the whole rate card on faith.
 */
const PROVENANCE_STYLE: Record<
  Provenance,
  { bg: string; fg: string; labelKey: "provOfficial" | "provDerived" | "provSecondary" | "provEstimate" }
> = {
  official: { bg: "var(--good)", fg: "#04081f", labelKey: "provOfficial" },
  derived: { bg: "var(--series-1)", fg: "#ffffff", labelKey: "provDerived" },
  secondary: { bg: "var(--warning)", fg: "#04081f", labelKey: "provSecondary" },
  estimate: { bg: "var(--surface-3)", fg: "var(--text-secondary)", labelKey: "provEstimate" },
};

/** Stacked-bar series. Same validated trio the report charts use. */
const LAYER = {
  platform: "var(--series-1)",
  licenses: "var(--series-2)",
  ops: "var(--series-3)",
} as const;

const usd = (n: number, locale: string) =>
  new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const num = (n: number, locale: string) =>
  new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
    maximumFractionDigits: 0,
  }).format(n);

/** Volume slider runs on a log scale — 10 GB and 100 TB on one track. */
const GB_MIN_LOG = Math.log10(10);
const GB_MAX_LOG = Math.log10(100_000);
const toGb = (pos: number) => Math.round(10 ** (GB_MIN_LOG + (GB_MAX_LOG - GB_MIN_LOG) * pos));
const fromGb = (gb: number) =>
  (Math.log10(Math.max(10, gb)) - GB_MIN_LOG) / (GB_MAX_LOG - GB_MIN_LOG);

function volumeLabel(gb: number, locale: string) {
  if (gb >= 1024) return `${(gb / 1024).toFixed(gb >= 10240 ? 0 : 1)} TB`;
  return `${num(gb, locale)} GB`;
}

function Slider({
  label,
  hint,
  value,
  display,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  display: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-[12.5px] font-medium text-[var(--text-secondary)]">{label}</label>
        <span className="tnum text-[13px] font-semibold text-[var(--text-primary)]">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--accent)]"
      />
      {hint ? (
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

function StackCard({
  stack,
  cheapest,
  expanded,
  onToggle,
  locale,
  t,
}: {
  stack: StackCost;
  cheapest: boolean;
  expanded: boolean;
  onToggle: () => void;
  locale: string;
  t: (v: { es: string; en: string }) => string;
}) {
  const groups = [
    { key: "platform" as const, label: t(CALC.platform), usd: stack.platform, color: LAYER.platform },
    { key: "licenses" as const, label: t(CALC.licenses), usd: stack.licenses, color: LAYER.licenses },
    { key: "ops" as const, label: t(CALC.ops), usd: stack.ops, color: LAYER.ops },
  ];

  return (
    <div
      className={`card card-lit avoid-break flex flex-col p-5 ${
        cheapest ? "ring-1 ring-[var(--cyan)]" : ""
      }`}
    >
      {/* Fixed heights on the title and stack description so the four price
          figures land on the same baseline. Without this, a longer stack name
          pushes one column's number out of line and the row stops reading as
          a comparison. */}
      <div className="flex h-6 items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold tracking-tight">{stack.name}</h3>
        {cheapest ? (
          <span className="shrink-0 rounded-full bg-[var(--cyan)] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[#04081f]">
            {t(CALC.cheapest)}
          </span>
        ) : null}
      </div>
      <p className="mt-1 h-[30px] text-[11px] leading-snug text-[var(--text-muted)]">
        {t(stack.shape)}
      </p>

      <p className="tnum mt-3 text-[26px] font-bold leading-none tracking-tight">
        {usd(stack.total, locale)}
      </p>
      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
        {t(CALC.perMonth)} · {usd(stack.total * 12, locale)} {t(CALC.annual).toLowerCase()}
      </p>

      <ul className="mt-4 space-y-1.5">
        {groups.map((g) => (
          <li key={g.key} className="flex items-center justify-between gap-2 text-[12px]">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ background: g.color }}
                aria-hidden="true"
              />
              {g.label}
            </span>
            <span className="tnum font-medium">{usd(g.usd, locale)}</span>
          </li>
        ))}
      </ul>

      {expanded ? (
        <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-3">
          {(["platform", "licenses", "ops"] as const).map((groupKey) => (
            <div key={groupKey}>
              {stack.groups[groupKey].map((line) => (
                <div key={line.key} className="py-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] text-[var(--text-secondary)]">
                      {t(line.label)}
                    </span>
                    <span className="tnum text-[11.5px] font-medium">{usd(line.usd, locale)}</span>
                  </div>
                  {line.detail ? (
                    <p className="mt-0.5 text-[10.5px] leading-snug text-[var(--text-muted)]">
                      {t(line.detail)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onToggle}
        className="no-print mt-3 self-start text-[11.5px] font-semibold text-[var(--cyan)] underline-offset-4 hover:underline"
      >
        {expanded ? t(CALC.hideDetail) : t(CALC.showDetail)}
      </button>

      {stack.notes.length > 0 ? (
        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t(CALC.whatToSay)}
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {stack.notes.map((n) => (
              <li key={n.en} className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                {t(n)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Horizontal stacked bars. Hand-drawn so print stays reliable. */
function CompareChart({
  stacks,
  locale,
  t,
}: {
  stacks: StackCost[];
  locale: string;
  t: (v: { es: string; en: string }) => string;
}) {
  const max = Math.max(...stacks.map((s) => s.total), 1);
  const rowH = 54;
  const barH = 22;
  const labelW = 132;
  const width = 720;
  const plotW = width - labelW - 90;
  const height = stacks.length * rowH + 8;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label={t(CALC.chartTitle)}
      >
        {stacks.map((s, i) => {
          const y = i * rowH + 10;
          const segments = [
            { v: s.platform, c: LAYER.platform },
            { v: s.licenses, c: LAYER.licenses },
            { v: s.ops, c: LAYER.ops },
          ].filter((seg) => seg.v > 0);

          let x = labelW;
          return (
            <g key={s.id}>
              <text
                x={labelW - 10}
                y={y + barH / 2 + 4}
                textAnchor="end"
                className="fill-[var(--text-primary)] text-[12px] font-medium"
              >
                {s.name}
              </text>
              {segments.map((seg, j) => {
                const w = (seg.v / max) * plotW;
                const rect = (
                  <rect
                    key={seg.c}
                    x={x}
                    y={y}
                    width={Math.max(0, w - (j < segments.length - 1 ? 2 : 0))}
                    height={barH}
                    rx={j === segments.length - 1 ? 4 : 0}
                    fill={seg.c}
                  />
                );
                x += w;
                return rect;
              })}
              <text
                x={labelW + (s.total / max) * plotW + 10}
                y={y + barH / 2 + 4}
                className="tnum fill-[var(--text-secondary)] text-[11.5px]"
              >
                {usd(s.total, locale)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const ENGINE_ROWS: EngineId[] = ["native", "snowflake", "databricks"];
const ENGINE_ROW_LABEL: Record<EngineId, string> = {
  native: "Nativo",
  snowflake: "Snowflake",
  databricks: "Databricks",
};

/**
 * All nine host×engine combinations in one table. The per-host cards below
 * keep the line-item detail and "what to say" notes; this table exists so
 * the three clouds can be read side by side without switching the toggle.
 */
function EngineMatrix({
  matrix,
  locale,
  t,
}: {
  matrix: ReturnType<typeof estimateEngineMatrix>;
  locale: string;
  t: (v: { es: string; en: string }) => string;
}) {
  const cheapestTotal = Math.min(
    ...matrix.flatMap((row) => row.engines.map((e) => e.total)),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-[12.5px]">
        <thead>
          <tr>
            <th className="border-b border-[var(--border)] px-2 py-2 text-left font-semibold text-[var(--text-muted)]">
              {t(CALC.matrixEngine)}
            </th>
            {matrix.map((row) => (
              <th
                key={row.host}
                className="border-b border-[var(--border)] px-3 py-2 text-right font-semibold text-[var(--text-primary)]"
              >
                {HOST_LABELS[row.host]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ENGINE_ROWS.map((engineId) => (
            <tr key={engineId} className="border-b border-[var(--border)] last:border-0">
              <td className="px-2 py-2.5 font-medium text-[var(--text-secondary)]">
                {ENGINE_ROW_LABEL[engineId]}
              </td>
              {matrix.map((row) => {
                const cell = row.engines.find((e) => e.id === engineId)!;
                const isCheapest = cell.total === cheapestTotal;
                return (
                  <td
                    key={row.host}
                    className={`tnum px-3 py-2.5 text-right font-semibold ${
                      isCheapest ? "text-[var(--cyan)]" : "text-[var(--text-primary)]"
                    }`}
                  >
                    {usd(cell.total, locale)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CalculatorClient({ tier }: { tier: TierId }) {
  const { t, locale } = useApp();
  // Read the hash in the initialiser rather than in an effect: setting state
  // synchronously inside an effect makes React render the cloud tab first and
  // then immediately replace it, which flashes the wrong tab on a deep link.
  const [mainTab, setMainTab] = useState<"cloud" | "llm">(() => {
    if (typeof window === "undefined") return "cloud";
    const hash = window.location.hash;
    return hash === "#llm" || hash === "#llm-tokens" ? "llm" : "cloud";
  });

  const switchMainTab = (tab: "cloud" | "llm") => {
    setMainTab(tab);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", tab === "llm" ? "#llm-tokens" : "#cloud-data");
    }
  };

  const [input, setInput] = useState<CostInputs>(DEFAULT_INPUTS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<"now" | "12m">("now");
  // Delivery window for the headcount panel: days become people only once you
  // say over how long. Same default as the planner so the two agree.
  const [months, setMonths] = useState(6);
  const [host, setHost] = useState<HostCloud>("aws");
  const [rates, setRates] = useState<MigrationRates>({ ...MIGRATION.dayRates });
  const { selected: plannerSelection } = useUseCaseSelection();
  const [selected, setSelected] = useState<ProjectDimension[]>([
    "tech",
    "people",
    "process",
    "ai",
  ]);
  const [pinnedStack, setPinnedStack] = useState<StackId | null>(null);

  const set = <K extends keyof CostInputs>(key: K, value: CostInputs[K]) =>
    setInput((current) => ({ ...current, [key]: value }));

  const dataGb =
    horizon === "now" ? input.dataGb : projectDataGb(input.dataGb, input.growthPct, 12);

  const stacks = useMemo(() => estimateAll(input, dataGb), [input, dataGb]);
  const cheapest = useMemo(
    () => stacks.reduce((a, b) => (b.total < a.total ? b : a)).id,
    [stacks],
  );
  const engines = useMemo(() => estimateEngines(input, dataGb, host), [input, dataGb, host]);
  const cheapestEngine = useMemo(
    () => engines.reduce((a, b) => (b.total < a.total ? b : a)).id,
    [engines],
  );
  const engineMatrix = useMemo(() => estimateEngineMatrix(input, dataGb), [input, dataGb]);
  const migration = useMemo(() => estimateMigration(input, rates), [input, rates]);
  // The catalogue is strictly better information than the generic
  // "N use cases x constant days" formula, so it replaces it when present.
  // Never both — that would double-count the same build work.
  const ai = useMemo(
    () =>
      plannerSelection.length > 0
        ? estimateFromUseCases(plannerSelection, rates)
        : estimateAi(input, rates),
    [plannerSelection, input, rates],
  );

  // Defaults to the cheapest stack so the summary shows a number immediately,
  // but a consultant can pin a specific platform to answer "what if we go
  // with Azure?" without re-reading the cards.
  const summaryStack = stacks.find((s) => s.id === (pinnedStack ?? cheapest))!;
  const totals = useMemo(
    () => projectTotals(summaryStack, migration, ai),
    [summaryStack, migration, ai],
  );
  const summary = useMemo(() => selectedTotals(totals, selected), [totals, selected]);

  const toggleDimension = (id: ProjectDimension) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((d) => d !== id) : [...current, id],
    );

  const refreshOptions: { id: Refresh; label: string }[] = [
    { id: "daily", label: t(CALC.refreshDaily) },
    { id: "hourly", label: t(CALC.refreshHourly) },
    { id: "realtime", label: t(CALC.refreshRealtime) },
  ];

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-8">
        {/* Top-Level Navigation Tabs */}
        <div className="no-print mb-8 border-b border-[var(--border)] pb-3">
          <div className="flex gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => switchMainTab("cloud")}
              className={`rounded-lg px-4 py-2.5 text-[14px] font-semibold transition ${
                mainTab === "cloud"
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t(CALC.tabCloudData)}
            </button>
            <button
              type="button"
              onClick={() => switchMainTab("llm")}
              className={`rounded-lg px-4 py-2.5 text-[14px] font-semibold transition ${
                mainTab === "llm"
                  ? "bg-[#A31F34] text-white shadow-sm"
                  : "bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t(CALC.tabLlmToken)}
            </button>
          </div>
        </div>

        {mainTab === "llm" ? (
          <Gated capability="calculator.llm" tier={tier}>
            <LlmCostCalculator />
          </Gated>
        ) : (
          <>
            <header className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
                DataRev
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t(CALC.title)}</h1>
              <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
                {t(CALC.lead)}
              </p>

          {/* Scope switches, not a legend. These deliberately do NOT reuse the
              chart's categorical colours: those encode platform/licences/ops
              (a different three-way split), and sharing a palette across two
              taxonomies made "Procesos" green look like it pointed at the
              "Operación" bar segment. Here colour encodes selected state only. */}
          <p className="mt-5 text-[11.5px] text-[var(--text-muted)]">{t(CALC.dimSelectHint)}</p>
          <ul className="mt-2.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DIMENSIONS.map((d) => {
              const on = selected.includes(d.id);
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => toggleDimension(d.id)}
                    aria-pressed={on}
                    className={`flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left transition ${
                      on
                        ? "border-[var(--accent)] bg-[var(--surface-2)]"
                        : "border-[var(--border)] bg-[var(--surface-1)] opacity-55 hover:opacity-80"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                        on
                          ? "border-[var(--accent)] bg-[var(--accent)]"
                          : "border-[var(--border-strong)]"
                      }`}
                      aria-hidden="true"
                    >
                      {on ? (
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                          <path
                            d="M2.5 6.2 4.8 8.5 9.5 3.8"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </span>
                    <span>
                      <span className="block text-[12.5px] font-semibold text-[var(--text-primary)]">
                        {t(d.label)}
                      </span>
                      <span className="block text-[11px] text-[var(--text-muted)]">
                        {t(d.hint)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </header>

        {/* Everything the tool ANSWERS is gated; everything it ASKS stays
            open. A visitor can work the inputs, see the scope switches and
            read the methodology — they just cannot read the figures. Gating
            the two output regions wholesale rather than panel by panel is
            deliberate: the first attempt gated the four price cards and the
            same numbers still surfaced in the summary, the comparison table
            and the engine matrix. One boundary is auditable; six are not. */}
        <Gated capability="calculator.cloud" tier={tier}>
        {/* Project summary — what the selected dimensions add up to */}
        <section className="card card-lit glow-accent avoid-break mb-8 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="text-[15px] font-semibold tracking-tight">{t(CALC.summaryTitle)}</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                {t(CALC.summaryLead)}
              </p>
            </div>
            <div className="no-print shrink-0">
              <span className="mb-1.5 block text-[11px] font-medium text-[var(--text-muted)]">
                {t(CALC.summaryPlatform)}
              </span>
              <div className="inline-flex flex-wrap rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-0.5">
                {stacks.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPinnedStack(s.id)}
                    className={`rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold transition ${
                      summaryStack.id === s.id
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selected.length === 0 ? (
            <p className="mt-5 text-[13px] text-[var(--text-muted)]">{t(CALC.summaryEmpty)}</p>
          ) : (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  { label: t(CALC.summaryMonthly), value: summary.monthly, hint: null },
                  { label: t(CALC.summaryOneTime), value: summary.oneTime, hint: null },
                  {
                    label: t(CALC.summaryFirstYear),
                    value: summary.firstYear,
                    hint: t(CALC.summaryFirstYearHint),
                  },
                ].map((m, i) => (
                  <div
                    key={m.label}
                    className={`rounded-xl px-4 py-3.5 ${
                      i === 2
                        ? "border border-[var(--cyan)] bg-[var(--surface-2)]"
                        : "border border-[var(--border)] bg-[var(--surface-1)]"
                    }`}
                  >
                    <p className="text-[11px] font-medium text-[var(--text-muted)]">{m.label}</p>
                    <p className="tnum mt-1.5 text-[23px] font-bold leading-none tracking-tight">
                      {usd(m.value, locale)}
                    </p>
                    {m.hint ? (
                      <p className="mt-1.5 text-[10.5px] text-[var(--text-muted)]">{m.hint}</p>
                    ) : null}
                  </div>
                ))}
              </div>

              <ul className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {DIMENSIONS.filter((d) => selected.includes(d.id)).map((d) => {
                  const tot = totals[d.id];
                  return (
                    <li
                      key={d.id}
                      className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-1.5 text-[12px]"
                    >
                      <span className="text-[var(--text-secondary)]">{t(d.label)}</span>
                      {/* Math.round here matches selectedTotals, so the parts
                          visibly add up to the totals above. */}
                      <span className="tnum whitespace-nowrap text-[var(--text-muted)]">
                        {tot.monthly > 0 ? `${usd(Math.round(tot.monthly), locale)}/mes` : null}
                        {tot.monthly > 0 && tot.oneTime > 0 ? " · " : null}
                        {tot.oneTime > 0
                          ? `${usd(Math.round(tot.oneTime), locale)} ${t(CALC.summaryOnce)}`
                          : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        {/* Who builds it. Only the dimensions actually included in the quote
            contribute — a project with the AI dimension switched off must not
            staff an ML engineer. */}
        <HeadcountPanel
          lines={[
            ...(selected.includes("people") ? migration.technical : []),
            ...(selected.includes("process") ? migration.process : []),
            ...(selected.includes("ai") ? ai.lines : []),
          ]}
          months={months}
          onMonths={setMonths}
          locale={locale}
        />

        </Gated>

        {/* Inputs */}
        <section className="card card-lit no-print mb-8 p-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-5">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
                  {t(CALC.inputsTitle)}
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
                  {t(CALC.inputsSubtitle)}
                </p>
              </div>
              <Slider
                label={t(CALC.sources)}
                hint={t(CALC.sourcesHint)}
                value={input.sources}
                display={String(input.sources)}
                min={1}
                max={40}
                step={1}
                onChange={(v) => set("sources", v)}
              />
              <Slider
                label={t(CALC.dataGb)}
                hint={t(CALC.dataGbHint)}
                value={fromGb(input.dataGb)}
                display={volumeLabel(input.dataGb, locale)}
                onChange={(v) => set("dataGb", toGb(v))}
              />
              <Slider
                label={t(CALC.growth)}
                value={input.growthPct}
                display={`${input.growthPct}%`}
                min={0}
                max={20}
                step={1}
                onChange={(v) => set("growthPct", v)}
              />
            </div>

            <div className="space-y-5">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
                  {t(CALC.targetTitle)}
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
                  {t(CALC.targetSubtitle)}
                </p>
              </div>
              <div>
                <label className="text-[12.5px] font-medium text-[var(--text-secondary)]">
                  {t(CALC.refresh)}
                </label>
                <div className="mt-2 flex gap-1.5">
                  {refreshOptions.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => set("refresh", o.id)}
                      className={`flex-1 rounded-lg px-2 py-2 text-[12px] font-semibold transition ${
                        input.refresh === o.id
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <Slider
                label={t(CALC.queryGb)}
                hint={t(CALC.queryGbHint)}
                value={fromGb(input.queryGbPerMonth)}
                display={volumeLabel(input.queryGbPerMonth, locale)}
                onChange={(v) => set("queryGbPerMonth", toGb(v))}
              />
            </div>

            <div className="space-y-5">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
                  {t(CALC.audienceTitle)}
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
                  {t(CALC.audienceSubtitle)}
                </p>
              </div>
              <Slider
                label={t(CALC.viewers)}
                value={input.viewers}
                display={num(input.viewers, locale)}
                min={0}
                max={1000}
                step={5}
                onChange={(v) => set("viewers", v)}
              />
              <Slider
                label={t(CALC.analysts)}
                value={input.analysts}
                display={num(input.analysts, locale)}
                min={0}
                max={100}
                step={1}
                onChange={(v) => set("analysts", v)}
              />
              <Slider
                label={t(CALC.creators)}
                hint={t(CALC.creatorsHint)}
                value={input.creators}
                display={num(input.creators, locale)}
                min={0}
                max={50}
                step={1}
                onChange={(v) => set("creators", v)}
              />
              <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                {t(CALC.peopleHint)}
              </p>
            </div>
          </div>

          {/* Lo que necesitas: derivado, no capturado. Cuando hay selección en
              el planeador, estimateFromUseCases reemplaza a estimateAi por
              completo — el slider de "casos de uso de IA" quedaba visible y
              movible sin efecto alguno sobre el número. Ahora se muestra como
              lo que es: un valor derivado, con liga al lugar donde sí se
              cambia. */}
          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
              {t(CALC.derivedTitle)}
            </h2>
            {plannerSelection.length > 0 ? (
              <>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
                  {t(CALC.derivedSubtitle)}
                </p>
                <p className="mt-2.5 text-[13px] text-[var(--text-secondary)]">
                  <strong className="tnum text-[var(--text-primary)]">
                    {plannerSelection.length}
                  </strong>{" "}
                  {t(plannerSelection.length === 1 ? CALC.derivedFromOne : CALC.derivedFrom)}
                  {" · "}
                  <Link
                    href="/casos-de-uso"
                    className="text-[var(--cyan)] underline underline-offset-2"
                  >
                    {t(CALC.derivedEdit)}
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-[var(--text-muted)]">
                  {t(CALC.derivedEmpty)}
                </p>
                <div className="mt-3 max-w-sm">
                  <Slider
                    label={t(CALC.aiUseCases)}
                    hint={t(CALC.aiUseCasesHint)}
                    value={input.aiUseCases}
                    display={num(input.aiUseCases, locale)}
                    min={0}
                    max={15}
                    step={1}
                    onChange={(v) => set("aiUseCases", v)}
                  />
                </div>
                <Link
                  href="/casos-de-uso"
                  className="mt-3 inline-block text-[12px] text-[var(--cyan)] underline underline-offset-2"
                >
                  {t(CALC.derivedEdit)}
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--border)] pt-5">
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={input.includeOps}
                onChange={(e) => set("includeOps", e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="text-[12.5px] font-medium text-[var(--text-secondary)]">
                {t(CALC.includeOps)}
              </span>
            </label>
            {input.includeOps ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[var(--text-muted)]">{t(CALC.opsRate)}</span>
                <input
                  type="number"
                  min={10}
                  max={300}
                  step={5}
                  value={input.opsHourlyRate}
                  onChange={(e) => set("opsHourlyRate", Number(e.target.value) || 0)}
                  className="tnum w-20 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-2 py-1 text-[12.5px]"
                />
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setInput(DEFAULT_INPUTS)}
              className="ml-auto text-[12px] font-medium text-[var(--text-muted)] underline-offset-4 hover:text-[var(--text-primary)] hover:underline"
            >
              {t(CALC.reset)}
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
            {t(CALC.includeOpsHint)}
          </p>
        </section>

        <Gated capability="calculator.cloud" tier={tier}>
        {/* Horizon toggle + results */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight">
            {t(CALC.resultsTitle)}
            <span className="ml-2 text-[12px] font-normal text-[var(--text-muted)]">
              {volumeLabel(Math.round(dataGb), locale)}
            </span>
          </h2>
          <div className="no-print inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-0.5">
            {(
              [
                { id: "now" as const, label: t(CALC.today) },
                { id: "12m" as const, label: t(CALC.inTwelve) },
              ]
            ).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setHorizon(o.id)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${
                  horizon === o.id
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stacks.map((s) => (
              <StackCard
                key={s.id}
                stack={s}
                cheapest={s.id === cheapest}
                expanded={expanded === s.id}
                onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
                locale={locale}
                t={t}
              />
            ))}
          </div>

        {/* Chart */}
        <section className="card card-lit avoid-break mt-6 p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">{t(CALC.chartTitle)}</h2>
          <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">{t(CALC.chartLead)}</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {[
              { label: t(CALC.platform), c: LAYER.platform },
              { label: t(CALC.licenses), c: LAYER.licenses },
              { label: t(CALC.ops), c: LAYER.ops },
            ].map((l) => (
              <li key={l.label} className="flex items-center gap-2 text-[11.5px] text-[var(--text-secondary)]">
                <span
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{ background: l.c }}
                  aria-hidden="true"
                />
                {l.label}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <CompareChart stacks={stacks} locale={locale} t={t} />
          </div>
        </section>

        {/* Portable engines */}
        <section className="card card-lit avoid-break mt-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <h2 className="text-[15px] font-semibold tracking-tight">{t(CALC.enginesTitle)}</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                {t(CALC.enginesLead)}
              </p>
            </div>
          </div>

          <h3 className="mt-6 text-[12.5px] font-semibold text-[var(--text-primary)]">
            {t(CALC.matrixTitle)}
          </h3>
          <p className="mt-1 text-[11.5px] text-[var(--text-secondary)]">{t(CALC.matrixLead)}</p>
          <div className="mt-3">
            <EngineMatrix matrix={engineMatrix} locale={locale} t={t} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
            <h3 className="text-[12.5px] font-semibold text-[var(--text-primary)]">
              {t(CALC.matrixDetailHeading)}
            </h3>
            <div className="no-print shrink-0">
              <span className="mb-1.5 block text-[11px] font-medium text-[var(--text-muted)]">
                {t(CALC.host)}
              </span>
              <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-0.5">
                {(["gcp", "aws", "azure"] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHost(h)}
                    className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${
                      host === h
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {HOST_LABELS[h]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {engines.map((e) => (
              <div
                key={e.id}
                className={`rounded-xl border p-4 ${
                  e.id === cheapestEngine
                    ? "border-[var(--cyan)] bg-[var(--surface-2)]"
                    : "border-[var(--border)] bg-[var(--surface-1)]"
                }`}
              >
                <div className="flex h-5 items-center justify-between gap-2">
                  <h3 className="text-[13.5px] font-semibold">{e.name}</h3>
                  {e.id === "native" ? (
                    <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {t(CALC.nativeBadge)}
                    </span>
                  ) : null}
                </div>
                <p className="tnum mt-3 text-[21px] font-bold leading-none tracking-tight">
                  {usd(e.total, locale)}
                </p>
                <p className="mt-1 text-[10.5px] text-[var(--text-muted)]">{t(CALC.perMonth)}</p>

                {e.hostUsd > 0 ? (
                  <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
                    {t(CALC.engineCost)} {usd(e.engineUsd, locale)} ·{" "}
                    {t(CALC.hostCost)} {usd(e.hostUsd, locale)}
                  </p>
                ) : null}

                <ul className="mt-3 space-y-1.5 border-t border-[var(--border)] pt-3">
                  {e.lines.map((line) => (
                    <li key={line.key}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {t(line.label)}
                        </span>
                        <span className="tnum text-[11px] font-medium">{usd(line.usd, locale)}</span>
                      </div>
                      {line.detail ? (
                        <p className="mt-0.5 text-[10px] leading-snug text-[var(--text-muted)]">
                          {t(line.detail)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <p className="mt-3 border-t border-[var(--border)] pt-3 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                  {t(e.note)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
            {t(CALC.enginesFootnote)}
          </p>
        </section>

        {/* Migration */}
        <section className="card card-lit avoid-break mt-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-[15px] font-semibold tracking-tight">{t(CALC.migrationTitle)}</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                {t(CALC.migrationLead)}
              </p>
            </div>
          </div>

          <div className="no-print mt-5 grid gap-3 sm:grid-cols-3">
            {ROLE_ORDER.map((role) => (
              <label key={role} className="block">
                <span className="mb-1 block text-[11px] font-medium text-[var(--text-muted)]">
                  {t(ROLE_LABEL[role])} · {t(CALC.migrationRates)}
                </span>
                <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-3 py-2">
                  <span className="text-[12px] text-[var(--text-muted)]">$</span>
                  <input
                    type="number"
                    min={100}
                    max={5000}
                    step={50}
                    value={rates[role]}
                    onChange={(e) =>
                      setRates((current) => ({
                        ...current,
                        [role]: Number(e.target.value) || 0,
                      }))
                    }
                    className="tnum w-full bg-transparent text-[13px] outline-none"
                  />
                  <span className="text-[11px] text-[var(--text-muted)]">/d</span>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-5">
              {[
                { group: migration.technical, titleKey: "migrationTechnical" as const, hintKey: "migrationTechnicalHint" as const },
                { group: migration.process, titleKey: "migrationProcess" as const, hintKey: "migrationProcessHint" as const },
              ].map(({ group, titleKey, hintKey }) => (
                <div key={titleKey}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t(CALC[titleKey])}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-[var(--text-muted)]">{t(CALC[hintKey])}</p>
                  <ul className="mt-2 space-y-2">
                    {group.map((line) => (
                      <li
                        key={line.label.en}
                        className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2 text-[12.5px]"
                      >
                        <span>
                          <span className="text-[var(--text-secondary)]">{t(line.label)}</span>
                          <span className="ml-1.5 text-[10.5px] text-[var(--text-muted)]">
                            · {t(line.role)}
                          </span>
                        </span>
                        <span className="tnum whitespace-nowrap font-medium">
                          {line.days.toLocaleString(locale === "es" ? "es-MX" : "en-US", {
                            maximumFractionDigits: 1,
                          })}{" "}
                          d · {usd(line.cost, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="md:w-64">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {Math.round(migration.days)} {t(CALC.migrationDays)}
              </p>
              <p className="tnum mt-2 text-[22px] font-bold leading-tight tracking-tight">
                {usd(migration.low, locale)} – {usd(migration.high, locale)}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
                {t(CALC.migrationRange)}
              </p>
            </div>
          </div>
        </section>

        {/* AI / agents — the fourth dimension */}
        <section className="card card-lit avoid-break mt-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-[15px] font-semibold tracking-tight">{t(CALC.aiTitle)}</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                {t(CALC.aiLead)}
              </p>
            </div>
          </div>

          {/* Where this number came from. Without saying so, a consultant
              cannot tell whether they are looking at the generic formula or
              the client's actual chosen scope. */}
          <div
            className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border px-3.5 py-2.5 text-[11.5px] leading-relaxed ${
              plannerSelection.length > 0
                ? "border-[var(--cyan)]/40 bg-[var(--surface-2)] text-[var(--text-secondary)]"
                : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)]"
            }`}
          >
            <span>
              {plannerSelection.length > 0
                ? t(CALC.aiFromPlanner).replace("{n}", String(plannerSelection.length))
                : t(CALC.aiGenericNotice)}
            </span>
            <Link
              href="/casos-de-uso"
              className="no-print font-semibold text-[var(--cyan)] underline-offset-4 hover:underline"
            >
              {t(CALC.aiOpenPlanner)} →
            </Link>
          </div>

          <div className="no-print mt-5 grid gap-3 sm:grid-cols-2">
            {AI_ROLE_ORDER.map((role) => (
              <label key={role} className="block">
                <span className="mb-1 block text-[11px] font-medium text-[var(--text-muted)]">
                  {t(ROLE_LABEL[role])} · {t(CALC.migrationRates)}
                </span>
                <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-3 py-2">
                  <span className="text-[12px] text-[var(--text-muted)]">$</span>
                  <input
                    type="number"
                    min={100}
                    max={5000}
                    step={50}
                    value={rates[role]}
                    onChange={(e) =>
                      setRates((current) => ({
                        ...current,
                        [role]: Number(e.target.value) || 0,
                      }))
                    }
                    className="tnum w-full bg-transparent text-[13px] outline-none"
                  />
                  <span className="text-[11px] text-[var(--text-muted)]">/d</span>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
            <ul className="space-y-2">
              {ai.lines.map((line) => (
                <li
                  key={line.label.en}
                  className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2 text-[12.5px]"
                >
                  <span>
                    <span className="text-[var(--text-secondary)]">{t(line.label)}</span>
                    <span className="ml-1.5 text-[10.5px] text-[var(--text-muted)]">
                      · {t(line.role)}
                    </span>
                  </span>
                  <span className="tnum whitespace-nowrap font-medium">
                    {line.days.toLocaleString(locale === "es" ? "es-MX" : "en-US", {
                      maximumFractionDigits: 1,
                    })}{" "}
                    d · {usd(line.cost, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="md:w-64">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {Math.round(ai.days)} {t(CALC.aiDays)}
              </p>
              <p className="tnum mt-2 text-[22px] font-bold leading-tight tracking-tight">
                {usd(ai.low, locale)} – {usd(ai.high, locale)}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
                {t(CALC.migrationRange)}
              </p>
            </div>
          </div>
        </section>

        </Gated>

        {/* Caveats */}
        <section className="card avoid-break mt-6 p-6">
          <h2 className="text-[13px] font-semibold tracking-tight">{t(CALC.caveatTitle)}</h2>
          <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-[var(--text-secondary)]">
            <li>{t(CALC.caveat1)}</li>
            <li>{t(CALC.caveat2)}</li>
            <li>{t(CALC.caveat3).replace("{date}", PRICING_CHECKED)}</li>
            <li>{t(REGION_NOTE)}</li>
          </ul>
          <h3 className="mt-6 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t(CALC.provenanceTitle)}
          </h3>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
            {t(CALC.provenanceLead)}
          </p>
          <ul className="mt-3 space-y-2.5">
            {PROVENANCE.map((p) => (
              <li key={p.group.en} className="flex gap-3">
                <span
                  className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    background: PROVENANCE_STYLE[p.level].bg,
                    color: PROVENANCE_STYLE[p.level].fg,
                  }}
                >
                  {t(CALC[PROVENANCE_STYLE[p.level].labelKey])}
                </span>
                <span className="text-[11.5px] leading-relaxed">
                  <span className="font-medium text-[var(--text-primary)]">{t(p.group)}</span>
                  <span className="text-[var(--text-secondary)]"> — {t(p.detail)}</span>
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t(CALC.sources_)}
          </h3>
          <ul className="mt-2 grid gap-1 text-[11.5px] sm:grid-cols-2">
            {PRICING_SOURCES.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] underline-offset-4 transition hover:text-[var(--cyan)] hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6">
          <ConsultCTA kind="results_review" variant="band" />
        </div>
        </>
        )}
      </main>

      <Footer />
    </>
  );
}
