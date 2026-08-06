"use client";

import { DIMENSION_MAP, LEVELS, type Level, type Locale } from "@/lib/framework";
import { t, UI } from "@/lib/i18n";
import type { DimensionScore } from "@/lib/scoring";
import { ChartFrame, levelInk } from "./primitives";

/**
 * The CMMI-DMM style capability grid: dimensions across, maturity levels down.
 * The filled cell in each column is the level that dimension reached; the
 * dashed cell is its target. Level 5 sits at the top so the eye reads the
 * climb upward.
 */
export function MaturityGrid({
  scores,
  locale,
}: {
  scores: DimensionScore[];
  locale: Locale;
}) {
  const rows = [...LEVELS].reverse();

  return (
    <ChartFrame
      title={t(UI.gridTitle, locale)}
      lead={t(UI.gridLead, locale)}
      legend={
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-3 w-5 rounded-[3px]"
              style={{ background: "var(--level-3)" }}
              aria-hidden="true"
            />
            {t(UI.current, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-3 w-5 rounded-[3px] border-2 border-dashed"
              style={{ borderColor: "var(--target-line)" }}
              aria-hidden="true"
            />
            {t(UI.target, locale)}
          </span>
        </div>
      }
    >
      {/* Wide content scrolls inside its own container; the page never does. */}
      <div className="-mx-1 overflow-x-auto px-1 pb-2">
        <table className="w-full min-w-[64rem] border-separate border-spacing-[2px] text-left">
          <caption className="sr-only">{t(UI.gridTitle, locale)}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="w-24 pb-1 align-bottom text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
              >
                {t(UI.level, locale)}
              </th>
              {scores.map((score) => (
                <th
                  key={score.dimension}
                  scope="col"
                  className="pb-1 align-bottom text-[11px] font-semibold leading-tight text-[var(--text-secondary)]"
                >
                  {t(DIMENSION_MAP[score.dimension].name, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.level}>
                <th
                  scope="row"
                  className="rounded-md bg-[var(--surface-2)] px-2 py-2 align-top text-[11px] font-semibold leading-tight"
                >
                  <span className="tnum text-[var(--text-muted)]">
                    {row.level}
                  </span>
                  <span className="ml-1.5">{t(row.name, locale)}</span>
                </th>

                {scores.map((score) => {
                  const dimension = DIMENSION_MAP[score.dimension];
                  const isCurrent =
                    score.answered > 0 && score.level === row.level;
                  const isTarget = score.target === row.level;

                  return (
                    <td
                      key={score.dimension}
                      className="rounded-md px-2 py-2 align-top text-[10.5px] leading-snug transition-colors"
                      style={{
                        background: isCurrent
                          ? `var(--level-${row.level})`
                          : "var(--surface-2)",
                        color: isCurrent
                          ? levelInk(row.level)
                          : "var(--text-muted)",
                        outline:
                          isTarget && !isCurrent
                            ? "2px dashed var(--target-line)"
                            : undefined,
                        outlineOffset: isTarget && !isCurrent ? "-2px" : undefined,
                        boxShadow: isCurrent
                          ? "inset 0 0 0 2px var(--surface-1)"
                          : undefined,
                      }}
                    >
                      {isCurrent ? (
                        <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider opacity-90">
                          {t(UI.current, locale)}
                        </span>
                      ) : null}
                      {t(dimension.descriptors[row.level as Level], locale)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartFrame>
  );
}
