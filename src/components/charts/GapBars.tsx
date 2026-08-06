"use client";

import { DIMENSION_MAP, type Locale } from "@/lib/framework";
import { t, UI } from "@/lib/i18n";
import { dimensionPriority, type DimensionScore } from "@/lib/scoring";
import {
  ChartFrame,
  ChartTooltip,
  LegendSwatch,
  levelColor,
  useChartTooltip,
} from "./primitives";

const MAX_LEVEL = 5;

export function GapBars({
  scores,
  locale,
}: {
  scores: DimensionScore[];
  locale: Locale;
}) {
  const { tooltip, setTooltip, clear } = useChartTooltip();

  const ordered = [...scores]
    .filter((score) => score.answered > 0)
    .sort((a, b) => dimensionPriority(b) - dimensionPriority(a));

  return (
    <ChartFrame
      title={t(UI.gapsTitle, locale)}
      lead={t(UI.gapsLead, locale)}
      legend={
        <div className="flex flex-wrap gap-4">
          <LegendSwatch color="var(--level-3)" label={t(UI.current, locale)} />
          <LegendSwatch
            color="var(--target-line)"
            label={t(UI.target, locale)}
            dashed
          />
        </div>
      }
    >
      <div className="relative" onMouseLeave={clear}>
        <ol className="space-y-2.5">
          {ordered.map((score) => {
            const dimension = DIMENSION_MAP[score.dimension];
            const currentPct = (score.raw / MAX_LEVEL) * 100;
            const targetPct = (score.target / MAX_LEVEL) * 100;

            return (
              <li key={score.dimension}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-[12.5px] font-medium">
                    {t(dimension.name, locale)}
                  </span>
                  <span className="tnum shrink-0 text-[11px] text-[var(--text-muted)]">
                    {score.raw.toFixed(1)} → {score.target}
                    {score.gap > 0 ? (
                      <span className="ml-2 font-semibold text-[var(--text-secondary)]">
                        +{score.gap.toFixed(1)}
                      </span>
                    ) : null}
                  </span>
                </div>

                <div
                  className="relative h-5 w-full rounded-[4px] bg-[var(--surface-2)]"
                  onMouseEnter={(event) => {
                    const box = event.currentTarget.getBoundingClientRect();
                    const parent =
                      event.currentTarget.offsetParent as HTMLElement | null;
                    const parentBox = parent?.getBoundingClientRect();
                    setTooltip({
                      x: 50,
                      y: parentBox
                        ? ((box.top - parentBox.top) / parentBox.height) * 100
                        : 0,
                      content: (
                        <div>
                          <div className="font-semibold">
                            {t(dimension.name, locale)}
                          </div>
                          <div className="mt-1 tnum text-[var(--text-secondary)]">
                            {t(UI.weight, locale)}{" "}
                            {(score.weight * 100).toFixed(0)}% ·{" "}
                            {t(UI.current, locale)} {score.raw.toFixed(1)} ·{" "}
                            {t(UI.target, locale)} {score.target}
                          </div>
                        </div>
                      ),
                    });
                  }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-[4px] transition-[width] duration-500"
                    style={{
                      width: `${currentPct}%`,
                      background: levelColor(score.level),
                    }}
                  />
                  {/* Target marker sits above the fill with a surface ring */}
                  <div
                    className="absolute inset-y-[-2px] w-0 border-l-2 border-dashed"
                    style={{
                      left: `${targetPct}%`,
                      borderColor: "var(--target-line)",
                    }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ol>

        {/* Shared axis under the stack */}
        <div className="mt-2 flex justify-between px-0 text-[10px] tnum text-[var(--text-muted)]">
          {[0, 1, 2, 3, 4, 5].map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <ChartTooltip tooltip={tooltip} />
      </div>
    </ChartFrame>
  );
}
