"use client";

import { useApp } from "@/components/AppProvider";
import { ROLE_LABEL } from "@/lib/cloudPricing";
import { UC } from "@/lib/i18nUseCases";
import { useRoster } from "@/lib/rosterSelection";
import { byPlane, PLANE_LABEL, STACK, type StackLayer } from "@/lib/stack";

const ALL_LAYERS = Object.keys(STACK) as StackLayer[];

/**
 * The stack the selection actually implies, drawn the way the market draws it:
 * data → analytics → ML → generative AI and agents, following the 2025 MAD
 * landscape.
 *
 * A list of five capability chips was hiding the layers where budgets break —
 * evaluation, guardrails, tracing, cost telemetry, AI security. Those are not
 * optional extras on an agent project; they are what separates a demo from a
 * system, which is why they are here and why they can be seen being added.
 */
export function StackPanel({ auto }: { auto: StackLayer[] }) {
  const { t } = useApp();
  const roster = useRoster<StackLayer>("stack", auto, ALL_LAYERS);
  const groups = byPlane(roster.effective);
  const off = ALL_LAYERS.filter((l) => !roster.effective.includes(l));

  return (
    <section className="card card-lit avoid-break p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight">{t(UC.techTitle)}</h2>
        <span className="text-[11px] text-[var(--text-muted)]">
          {roster.effective.length} {t(UC.layers)}
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
        {t(UC.techLead)}
      </p>

      {groups.length === 0 ? (
        <p className="mt-4 text-[12px] text-[var(--text-muted)]">{t(UC.techEmpty)}</p>
      ) : (
        <div className="mt-4 space-y-5">
          {groups.map(({ plane, layers }) => (
            <div key={plane}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
                {t(PLANE_LABEL[plane])}
              </h3>
              <ul className="mt-2 space-y-2.5">
                {layers.map((id) => {
                  const spec = STACK[id];
                  return (
                    <li
                      key={id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-3"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[12.5px] font-medium text-[var(--text-primary)]">
                          {t(spec.name)}
                        </span>
                        <button
                          type="button"
                          onClick={() => roster.toggle(id)}
                          className="no-print shrink-0 text-[10.5px] text-[var(--text-muted)] underline underline-offset-2 transition hover:text-[var(--text-primary)]"
                        >
                          {t(UC.removeLayer)}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        {t(spec.purpose)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {spec.examples.map((tool) => (
                          <span
                            key={tool}
                            className="rounded border border-[var(--border)] px-1.5 py-px text-[9.5px] text-[var(--text-muted)]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1.5 text-[10.5px] text-[var(--text-muted)]">
                        {t(UC.ownedBy)}: {spec.roles.map((r) => t(ROLE_LABEL[r])).join(" · ")}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {off.length > 0 ? (
        <div className="no-print mt-5 border-t border-[var(--border)] pt-3">
          <p className="text-[11px] text-[var(--text-secondary)]">{t(UC.addLayer)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {off.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => roster.toggle(id)}
                title={t(STACK[id].purpose)}
                className="rounded-lg border border-dashed border-[var(--border-strong)] px-2 py-1 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
              >
                + {t(STACK[id].name)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">{t(UC.stackNote)}</p>
    </section>
  );
}
