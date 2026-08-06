"use client";

import { DIMENSION_MAP, type Locale } from "@/lib/framework";
import { t, UI } from "@/lib/i18n";
import { HORIZONS, type Horizon, type RoadmapAction } from "@/lib/roadmap";
import {
  ChartFrame,
  ChartTooltip,
  LegendSwatch,
  useChartTooltip,
} from "./primitives";

const W = 420;
const H = 300;
const PAD = { top: 16, right: 18, bottom: 36, left: 46 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/* Three horizons map onto the three categorical slots that clear the
   all-pairs CVD gates — which is exactly why the scatter is coloured by
   horizon and never by dimension (eight would fail). */
const HORIZON_COLOR: Record<Horizon, string> = {
  now: "var(--series-1)",
  next: "var(--series-2)",
  later: "var(--series-3)",
};

/** Effort runs 1..5 left to right; impact 1..5 bottom to top. */
function scaleX(effort: number): number {
  return PAD.left + ((effort - 0.5) / 5) * PLOT_W;
}

function scaleY(impact: number): number {
  return PAD.top + PLOT_H - ((impact - 0.5) / 5) * PLOT_H;
}

/** Nudge coincident dots apart so overlapping actions stay countable. */
function spread(actions: RoadmapAction[]) {
  const seen = new Map<string, number>();
  return actions.map((action) => {
    const key = `${action.impact}:${action.effort}`;
    const seenCount = seen.get(key) ?? 0;
    seen.set(key, seenCount + 1);
    const angle = seenCount * 2.4;
    const radius = seenCount === 0 ? 0 : 5 + seenCount * 1.6;
    return {
      action,
      cx: scaleX(action.effort) + Math.cos(angle) * radius,
      cy: scaleY(action.impact) + Math.sin(angle) * radius,
    };
  });
}

export function ImpactEffort({
  actions,
  locale,
}: {
  actions: RoadmapAction[];
  locale: Locale;
}) {
  const { tooltip, setTooltip, clear } = useChartTooltip();
  const points = spread(actions);

  return (
    <ChartFrame
      title={t(UI.quadrantTitle, locale)}
      lead={t(UI.quadrantLead, locale)}
      legend={
        <div className="flex flex-wrap gap-4">
          {HORIZONS.map((horizon) => (
            <LegendSwatch
              key={horizon.id}
              color={HORIZON_COLOR[horizon.id]}
              label={`${t(horizon.label, locale)} · ${t(horizon.window, locale)}`}
            />
          ))}
        </div>
      }
    >
      <div className="relative" onMouseLeave={clear}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full"
          role="img"
          aria-label={t(UI.quadrantTitle, locale)}
        >
          {/* Quadrant split at the midpoint of both scales */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={PLOT_W / 2}
            height={PLOT_H / 2}
            fill="var(--accent-soft)"
            opacity="0.55"
          />
          <text
            x={PAD.left + 8}
            y={PAD.top + 15}
            fontSize="9.5"
            fontWeight="700"
            fill="var(--text-muted)"
            className="uppercase"
            letterSpacing="0.06em"
          >
            {locale === "es" ? "Ganancias rápidas" : "Quick wins"}
          </text>

          {[1, 2, 3, 4, 5].map((tick) => (
            <g key={`grid-${tick}`}>
              <line
                x1={scaleX(tick)}
                y1={PAD.top}
                x2={scaleX(tick)}
                y2={PAD.top + PLOT_H}
                stroke="var(--grid-line)"
                strokeWidth="1"
              />
              <line
                x1={PAD.left}
                y1={scaleY(tick)}
                x2={PAD.left + PLOT_W}
                y2={scaleY(tick)}
                stroke="var(--grid-line)"
                strokeWidth="1"
              />
              <text
                x={scaleX(tick)}
                y={PAD.top + PLOT_H + 14}
                textAnchor="middle"
                fontSize="9"
                className="tnum"
                fill="var(--text-muted)"
              >
                {tick}
              </text>
              <text
                x={PAD.left - 8}
                y={scaleY(tick) + 3}
                textAnchor="end"
                fontSize="9"
                className="tnum"
                fill="var(--text-muted)"
              >
                {tick}
              </text>
            </g>
          ))}

          <text
            x={PAD.left + PLOT_W / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--text-secondary)"
          >
            {t(UI.effort, locale)} →
          </text>
          <text
            x={12}
            y={PAD.top + PLOT_H / 2}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--text-secondary)"
            transform={`rotate(-90 12 ${PAD.top + PLOT_H / 2})`}
          >
            {t(UI.impact, locale)} →
          </text>

          {points.map(({ action, cx, cy }) => (
            <circle
              key={action.id}
              cx={cx}
              cy={cy}
              r="6.5"
              fill={HORIZON_COLOR[action.horizon]}
              stroke="var(--surface-1)"
              strokeWidth="2"
              onMouseEnter={() =>
                setTooltip({
                  x: (cx / W) * 100,
                  y: (cy / H) * 100 - 3,
                  content: (
                    <div>
                      <div className="font-semibold">
                        {t(action.title, locale)}
                      </div>
                      <div className="mt-1 text-[var(--text-secondary)]">
                        {t(DIMENSION_MAP[action.dimension].short, locale)} ·{" "}
                        <span className="tnum">
                          {t(UI.impact, locale)} {action.impact} ·{" "}
                          {t(UI.effort, locale)} {action.effort}
                        </span>
                      </div>
                    </div>
                  ),
                })
              }
            >
              <title>{t(action.title, locale)}</title>
            </circle>
          ))}
        </svg>
        <ChartTooltip tooltip={tooltip} />
      </div>
    </ChartFrame>
  );
}
