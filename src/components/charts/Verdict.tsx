"use client";

import {
  CISR_STAGES,
  LEVELS,
  type Locale,
} from "@/lib/framework";
import { t, UI } from "@/lib/i18n";
import type { Result } from "@/lib/scoring";
import { ChartFrame, levelColor, levelInk } from "./primitives";

/**
 * The headline. A single number is a stat tile, not a chart — the five-segment
 * strip below it carries the ordinal position so the number is not the only
 * encoding.
 */
export function ScoreHero({
  result,
  locale,
}: {
  result: Result;
  locale: Locale;
}) {
  const levelDef = LEVELS.find((item) => item.level === result.level)!;

  return (
    <section className="card card-lit glow-accent avoid-break overflow-hidden">
      <div className="grid gap-px bg-[var(--border)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="bg-[var(--surface-1)] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t(UI.overallMaturity, locale)}
          </p>

          <div className="mt-3 flex items-baseline gap-3">
            <span
              className="tnum text-6xl font-semibold leading-none tracking-tight"
              style={{ color: levelColor(result.level) }}
            >
              {result.overall.toFixed(1)}
            </span>
            <span className="text-lg text-[var(--text-muted)]">/ 5</span>
          </div>

          <p className="mt-3 text-[15px] font-semibold">
            {t(UI.level, locale)} {result.level} · {t(levelDef.name, locale)}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
            {t(levelDef.summary, locale)}
          </p>

          {/* Ordinal strip: which of the five levels was credited */}
          <div className="mt-4 flex gap-1" aria-hidden="true">
            {LEVELS.map((item) => (
              <div
                key={item.level}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  background:
                    item.level <= result.level
                      ? levelColor(item.level)
                      : "var(--surface-2)",
                }}
              />
            ))}
          </div>

          {result.completion < 1 ? (
            <p className="mt-4 rounded-md bg-[var(--surface-2)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
              {t(UI.incomplete, locale)} ·{" "}
              <span className="tnum">
                {result.answeredCount}/{result.questionCount}
              </span>{" "}
              {t(UI.answered, locale)}
            </p>
          ) : null}
        </div>

        <StagePanel result={result} locale={locale} />
      </div>
    </section>
  );
}

function StagePanel({ result, locale }: { result: Result; locale: Locale }) {
  const isAbove = result.stage.performance === "above";

  return (
    <div className="bg-[var(--surface-1)] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {t(UI.yourStage, locale)}
      </p>

      <p className="mt-3 text-[17px] font-semibold leading-snug">
        {locale === "es" ? "Etapa" : "Stage"} {result.stage.stage} ·{" "}
        {t(result.stage.name, locale)}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
        {t(result.stage.description, locale)}
      </p>

      <p
        className="mt-4 flex items-start gap-2 rounded-md px-3 py-2 text-[11.5px] leading-relaxed"
        style={{
          background: "var(--surface-2)",
          color: "var(--text-secondary)",
        }}
      >
        <span
          aria-hidden="true"
          className="mt-[3px] inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ background: isAbove ? "var(--good)" : "var(--warning)" }}
        />
        {t(isAbove ? UI.performanceAbove : UI.performanceBelow, locale)}
      </p>
    </div>
  );
}

/** Where the organisation sits in the MIT CISR distribution of 721 enterprises. */
export function StageDistribution({
  result,
  locale,
}: {
  result: Result;
  locale: Locale;
}) {
  const maxShare = Math.max(...CISR_STAGES.map((stage) => stage.share));

  return (
    <ChartFrame
      title={t(UI.distributionTitle, locale)}
      lead={t(UI.distributionLead, locale)}
    >
      <div className="flex gap-2 sm:gap-3">
        {CISR_STAGES.map((stage) => {
          const isYou = stage.stage === result.stage.stage;
          const heightPct = (stage.share / maxShare) * 100;

          return (
            <div key={stage.stage} className="flex flex-1 flex-col">
              <span
                className={`tnum mb-1.5 text-center text-[12px] ${
                  isYou
                    ? "font-bold text-[var(--text-primary)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {Math.round(stage.share * 100)}%
              </span>

              {/* The bar's percentage height must resolve against the plot
                  area alone — nesting it under the labels made 28% and 31%
                  render at the same height. */}
              <div className="flex flex-col justify-end" style={{ height: 132 }}>
                <div
                  className="rounded-t-[4px] transition-all"
                  style={{
                    height: `${heightPct}%`,
                    background: isYou ? levelColor(4) : "var(--surface-2)",
                    outline: isYou
                      ? "2px solid var(--accent-strong)"
                      : undefined,
                    outlineOffset: "-2px",
                  }}
                />
              </div>

              <div className="mt-2 text-center">
                <p
                  className={`text-[10.5px] leading-tight ${
                    isYou
                      ? "font-bold text-[var(--text-primary)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {t(stage.name, locale)}
                </p>
                {isYou ? (
                  <p
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                    style={{
                      background: levelColor(4),
                      color: levelInk(4),
                    }}
                  >
                    {locale === "es" ? "Tu organización" : "You are here"}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
        {locale === "es"
          ? "Las barras muestran qué proporción de las 721 empresas estudiadas por MIT CISR se encuentra en cada etapa."
          : "Bars show what share of the 721 enterprises studied by MIT CISR sits in each stage."}
      </p>
    </ChartFrame>
  );
}
