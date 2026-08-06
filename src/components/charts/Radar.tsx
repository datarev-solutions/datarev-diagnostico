"use client";

import { DIMENSION_MAP, type Locale } from "@/lib/framework";
import { t, UI } from "@/lib/i18n";
import type { DimensionScore } from "@/lib/scoring";
import {
  ChartFrame,
  ChartTooltip,
  LegendSwatch,
  useChartTooltip,
} from "./primitives";

const SIZE = 340;
const CENTER = SIZE / 2;
const RADIUS = 116;
const MAX_LEVEL = 5;

/* The east/west axis labels ("Procesos", "Datos") are set outside the plot and
   would be clipped by a square viewBox, so the box is widened horizontally
   while the plot geometry stays centred on SIZE. */
const GUTTER = 52;
const VIEW_BOX = `${-GUTTER} 0 ${SIZE + GUTTER * 2} ${SIZE}`;

interface Point {
  x: number;
  y: number;
}

function polar(index: number, count: number, radius: number): Point {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function ringPath(count: number, radius: number): string {
  return (
    Array.from({ length: count }, (_, index) => {
      const point = polar(index, count, radius);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    }).join(" ") + " Z"
  );
}

function seriesPath(values: number[]): string {
  return (
    values
      .map((value, index) => {
        const point = polar(index, values.length, (value / MAX_LEVEL) * RADIUS);
        return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}

export function Radar({
  scores,
  locale,
}: {
  scores: DimensionScore[];
  locale: Locale;
}) {
  const { tooltip, setTooltip, clear } = useChartTooltip();
  const count = scores.length;
  const current = scores.map((score) => score.raw);
  const target = scores.map((score) => score.target);

  return (
    <ChartFrame
      title={t(UI.radarTitle, locale)}
      lead={t(UI.radarLead, locale)}
      legend={
        <div className="flex flex-wrap gap-4">
          <LegendSwatch color="var(--series-1)" label={t(UI.current, locale)} />
          <LegendSwatch
            color="var(--target-line)"
            label={t(UI.target, locale)}
            dashed
          />
        </div>
      }
    >
      <div className="relative" onMouseLeave={clear}>
        <svg
          viewBox={VIEW_BOX}
          className="mx-auto block w-full max-w-[420px]"
          role="img"
          aria-label={t(UI.radarTitle, locale)}
        >
          {/* Rings, one per maturity level */}
          {[1, 2, 3, 4, 5].map((level) => (
            <path
              key={level}
              d={ringPath(count, (level / MAX_LEVEL) * RADIUS)}
              fill="none"
              stroke="var(--grid-line)"
              strokeWidth={level === MAX_LEVEL ? 1.5 : 1}
            />
          ))}

          {/* Spokes */}
          {scores.map((score, index) => {
            const outer = polar(index, count, RADIUS);
            return (
              <line
                key={score.dimension}
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--grid-line)"
                strokeWidth="1"
              />
            );
          })}

          {/* Level scale, printed once along the vertical spoke */}
          {[1, 2, 3, 4, 5].map((level) => (
            <text
              key={`scale-${level}`}
              x={CENTER + 4}
              y={CENTER - (level / MAX_LEVEL) * RADIUS + 3}
              className="tnum"
              fontSize="8"
              fill="var(--text-muted)"
            >
              {level}
            </text>
          ))}

          <path
            d={seriesPath(target)}
            fill="none"
            stroke="var(--target-line)"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />

          <path
            d={seriesPath(current)}
            fill="var(--series-1)"
            fillOpacity="0.22"
            stroke="var(--series-1)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Vertices carry the hover target; 2px surface ring keeps them
              legible where the fill sits under them. */}
          {scores.map((score, index) => {
            const point = polar(
              index,
              count,
              (score.raw / MAX_LEVEL) * RADIUS,
            );
            const dimension = DIMENSION_MAP[score.dimension];
            return (
              <circle
                key={score.dimension}
                cx={point.x}
                cy={point.y}
                r="4.5"
                fill="var(--series-1)"
                stroke="var(--surface-1)"
                strokeWidth="2"
                onMouseEnter={() =>
                  setTooltip({
                    x: ((point.x + GUTTER) / (SIZE + GUTTER * 2)) * 100,
                    y: (point.y / SIZE) * 100 - 2,
                    content: (
                      <div>
                        <div className="font-semibold">
                          {t(dimension.name, locale)}
                        </div>
                        <div className="mt-1 tnum text-[var(--text-secondary)]">
                          {t(UI.current, locale)} {score.raw.toFixed(1)} ·{" "}
                          {t(UI.target, locale)} {score.target}
                        </div>
                      </div>
                    ),
                  })
                }
              />
            );
          })}

          {/* Direct labels: identity is never carried by colour alone */}
          {scores.map((score, index) => {
            const point = polar(index, count, RADIUS + 22);
            const dimension = DIMENSION_MAP[score.dimension];
            const anchor =
              Math.abs(point.x - CENTER) < 8
                ? "middle"
                : point.x > CENTER
                  ? "start"
                  : "end";
            return (
              <g key={score.dimension}>
                <text
                  x={point.x}
                  y={point.y}
                  textAnchor={anchor}
                  fontSize="10.5"
                  fontWeight="600"
                  fill="var(--text-secondary)"
                >
                  {t(dimension.short, locale)}
                </text>
                <text
                  x={point.x}
                  y={point.y + 12}
                  textAnchor={anchor}
                  fontSize="10"
                  className="tnum"
                  fill="var(--text-muted)"
                >
                  {score.raw.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
        <ChartTooltip tooltip={tooltip} />
      </div>
    </ChartFrame>
  );
}
