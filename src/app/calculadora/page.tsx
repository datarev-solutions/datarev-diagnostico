"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Footer, Header } from "@/components/Chrome";
import { ConsultCTA } from "@/components/ConsultCTA";
import {
  MIGRATION,
  PRICING_CHECKED,
  PRICING_SOURCES,
  PROVENANCE,
  REGION_NOTE,
  type Provenance,
} from "@/lib/cloudPricing";
import {
  DEFAULT_INPUTS,
  estimateAll,
  estimateEngines,
  estimateMigration,
  projectDataGb,
  type CostInputs,
  type HostCloud,
  type Refresh,
  type StackCost,
} from "@/lib/costModel";
import { CALC } from "@/lib/i18nCalc";

const HOST_LABELS: Record<HostCloud, string> = {
  gcp: "GCP",
  aws: "AWS",
  azure: "Azure",
};

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

export default function CalculatorPage() {
  const { t, locale } = useApp();
  const [input, setInput] = useState<CostInputs>(DEFAULT_INPUTS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<"now" | "12m">("now");
  const [host, setHost] = useState<HostCloud>("aws");
  // Explicit number: MIGRATION is `as const`, so the literal 900 would
  // otherwise narrow the state type and reject any other rate.
  const [dayRate, setDayRate] = useState<number>(MIGRATION.defaultDayRate);

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
  const migration = useMemo(() => estimateMigration(input, dayRate), [input, dayRate]);

  const refreshOptions: { id: Refresh; label: string }[] = [
    { id: "daily", label: t(CALC.refreshDaily) },
    { id: "hourly", label: t(CALC.refreshHourly) },
    { id: "realtime", label: t(CALC.refreshRealtime) },
  ];

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-10">
        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
            DataRev
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t(CALC.title)}</h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
            {t(CALC.lead)}
          </p>
        </header>

        {/* Inputs */}
        <section className="card card-lit no-print mb-8 p-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(CALC.inputsTitle)}
              </h2>
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
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                &nbsp;
              </h2>
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
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(CALC.peopleTitle)}
              </h2>
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
            <div className="no-print flex items-center gap-2">
              <span className="text-[11.5px] text-[var(--text-muted)]">{t(CALC.migrationRate)}</span>
              <input
                type="number"
                min={100}
                max={5000}
                step={50}
                value={dayRate}
                onChange={(e) => setDayRate(Number(e.target.value) || 0)}
                className="tnum w-24 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-2 py-1 text-[12.5px]"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[1fr_auto]">
            <ul className="space-y-2">
              {migration.lines.map((line) => (
                <li
                  key={line.label.en}
                  className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2 text-[12.5px]"
                >
                  <span className="text-[var(--text-secondary)]">{t(line.label)}</span>
                  <span className="tnum whitespace-nowrap font-medium">
                    {line.days.toLocaleString(locale === "es" ? "es-MX" : "en-US", {
                      maximumFractionDigits: 1,
                    })}{" "}
                    d
                  </span>
                </li>
              ))}
            </ul>

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
      </main>

      <Footer />
    </>
  );
}
