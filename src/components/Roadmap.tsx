"use client";

import { DIMENSION_MAP, type Locale } from "@/lib/framework";
import { t, UI } from "@/lib/i18n";
import {
  HORIZONS,
  roadmapByHorizon,
  type RoadmapAction,
} from "@/lib/roadmap";
import { levelColor, levelInk } from "./charts/primitives";

const HORIZON_ACCENT: Record<string, string> = {
  now: "var(--series-1)",
  next: "var(--series-2)",
  later: "var(--series-3)",
};

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </span>
      <span className="flex gap-[2px]" aria-label={`${label}: ${value}/5`}>
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background:
                step <= value ? "var(--text-secondary)" : "var(--surface-2)",
            }}
          />
        ))}
      </span>
    </div>
  );
}

function ActionCard({
  action,
  index,
  locale,
}: {
  action: RoadmapAction;
  index: number;
  locale: Locale;
}) {
  const dimension = DIMENSION_MAP[action.dimension];

  return (
    <li className="card card-lit avoid-break p-4 transition hover:-translate-y-0.5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-secondary)",
          }}
        >
          {t(dimension.short, locale)}
        </span>
        <span className="tnum shrink-0 text-[11px] font-semibold text-[var(--text-muted)]">
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <h4 className="text-[13.5px] font-semibold leading-snug">
        {t(action.title, locale)}
      </h4>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
        {t(action.description, locale)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--border)] pt-2.5">
        <Meter label={t(UI.impact, locale)} value={action.impact} />
        <Meter label={t(UI.effort, locale)} value={action.effort} />
        <span
          className="tnum inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            background: levelColor(action.fromLevel + 1),
            color: levelInk(action.fromLevel + 1),
          }}
        >
          L{action.fromLevel} → L{action.fromLevel + 1}
        </span>
      </div>

      <dl className="mt-2.5 space-y-1 text-[11px]">
        <div className="flex gap-1.5">
          <dt className="shrink-0 font-semibold text-[var(--text-muted)]">
            {t(UI.owner, locale)}:
          </dt>
          <dd className="text-[var(--text-secondary)]">
            {t(action.owner, locale)}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 font-semibold text-[var(--text-muted)]">
            {t(UI.kpi, locale)}:
          </dt>
          <dd className="text-[var(--text-secondary)]">
            {t(action.kpi, locale)}
          </dd>
        </div>
      </dl>
    </li>
  );
}

export function Roadmap({
  actions,
  locale,
}: {
  actions: RoadmapAction[];
  locale: Locale;
}) {
  const grouped = roadmapByHorizon(actions);

  // Continuous numbering across the three columns. Derived from the already
  // priority-sorted list rather than a counter mutated while rendering.
  const rank = new Map(actions.map((action, position) => [action.id, position + 1]));

  if (actions.length === 0) {
    return (
      <section className="card p-6 text-sm text-[var(--text-secondary)]">
        {t(UI.noActions, locale)}
      </section>
    );
  }

  return (
    <section className="avoid-break">
      <header className="mb-4">
        <h3 className="text-[15px] font-semibold tracking-tight">
          {t(UI.roadmapTitle, locale)}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
          {t(UI.roadmapLead, locale)}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {HORIZONS.map((horizon) => {
          const items = grouped[horizon.id];
          return (
            <div key={horizon.id}>
              <div
                className="mb-3 flex items-baseline justify-between gap-2 border-t-2 pt-2.5"
                style={{ borderColor: HORIZON_ACCENT[horizon.id] }}
              >
                <div>
                  <h4 className="text-[13px] font-bold">
                    {t(horizon.label, locale)}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {t(horizon.window, locale)}
                  </p>
                </div>
                <span className="tnum text-[11px] text-[var(--text-muted)]">
                  {items.length} {t(UI.actions, locale)}
                </span>
              </div>

              <ol className="space-y-3">
                {items.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    index={rank.get(action.id) ?? 0}
                    locale={locale}
                  />
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
