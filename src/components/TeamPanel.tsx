"use client";

import { useApp } from "@/components/AppProvider";
import {
  ROLE_LABEL,
  ROLE_ORDER,
  ROLE_PURPOSE,
  type MigrationRole,
} from "@/lib/cloudPricing";
import { UC } from "@/lib/i18nUseCases";
import { useRoster } from "@/lib/rosterSelection";
import {
  coordinationRoles,
  layersNeedingRole,
  STACK,
  type StackLayer,
} from "@/lib/stack";

/**
 * The team the selection actually implies — not a fixed list of builders and
 * analysts.
 *
 * Two things decide who is on it: the delivery days each use case books against
 * a role, and the layers of the stack the selection drags in, because a layer
 * with no owner is a layer nobody builds. That second path is how a security
 * engineer lands on an agent project even though no use case ever asked for
 * one.
 *
 * Every seat says why it is there, and every seat can be turned off. A client
 * who already employs a governance lead should not be quoted for ours.
 */
export function TeamPanel({
  roleDays,
  layers,
  useCaseCount,
  months,
  onMonths,
  workingDaysPerMonth = 20,
}: {
  roleDays: Partial<Record<MigrationRole, number>>;
  layers: StackLayer[];
  useCaseCount: number;
  months: number;
  onMonths: (n: number) => void;
  workingDaysPerMonth?: number;
}) {
  const { t, locale } = useApp();

  // A role is auto-selected if the catalogue books days against it, the stack
  // needs someone to own one of its layers, or the project is big enough to
  // need coordinating.
  const coordination = coordinationRoles(useCaseCount, layers);
  const auto = ROLE_ORDER.filter(
    (r) =>
      (roleDays[r] ?? 0) > 0 ||
      layersNeedingRole(layers, r).length > 0 ||
      coordination.includes(r),
  );
  const roster = useRoster<MigrationRole>("roles", auto, ROLE_ORDER);

  const capacity = Math.max(1, months * workingDaysPerMonth);
  const num = (n: number) =>
    new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
      maximumFractionDigits: 1,
    }).format(n);

  const rows = roster.effective.map((role) => {
    const days = roleDays[role] ?? 0;
    const owns = layersNeedingRole(layers, role);
    return {
      role,
      days,
      // A seat with no booked days still costs a person: someone has to own
      // the layer. Show it as a seat with no estimate rather than hide it.
      fte: days > 0 ? Math.max(1, Math.ceil(days / capacity)) : 1,
      owns,
    };
  });

  const off = ROLE_ORDER.filter((r) => !roster.effective.includes(r));

  return (
    <section className="card card-lit avoid-break p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight">{t(UC.teamTitle)}</h2>
        {roster.dirty ? (
          <button
            type="button"
            onClick={roster.reset}
            className="no-print rounded-lg border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            {t(UC.resetAuto)}
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
        {t(UC.teamLead)}
      </p>

      <div className="no-print mt-4 flex items-center gap-2">
        <label className="text-[12px] text-[var(--text-secondary)]" htmlFor="window-months">
          {t(UC.window)}
        </label>
        <input
          id="window-months"
          type="number"
          min={1}
          max={36}
          value={months}
          onChange={(e) => onMonths(Math.min(36, Math.max(1, Number(e.target.value) || 1)))}
          className="w-16 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-2 py-1 text-[13px] text-[var(--text-primary)]"
        />
        <span className="text-[12px] text-[var(--text-secondary)]">{t(UC.months)}</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-[12px] text-[var(--text-muted)]">{t(UC.teamEmpty)}</p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--border)]">
          {rows.map(({ role, days, fte, owns }) => (
            <li key={role} className="py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                  {t(ROLE_LABEL[role])}
                </span>
                <span className="tnum shrink-0 text-[12px] text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">
                    {fte} {fte === 1 ? t(UC.fteOne) : t(UC.fte)}
                  </strong>
                  {days > 0 ? (
                    <>
                      {" · "}
                      {num(days)} {t(UC.personDays)}
                    </>
                  ) : null}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
                {t(ROLE_PURPOSE[role])}
              </p>
              {owns.length > 0 ? (
                <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--text-muted)]">
                  <span className="text-[var(--text-secondary)]">{t(UC.owns)}:</span>{" "}
                  {owns.map((l) => t(STACK[l].name)).join(" · ")}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => roster.toggle(role)}
                className="no-print mt-1.5 text-[10.5px] text-[var(--text-muted)] underline underline-offset-2 transition hover:text-[var(--text-primary)]"
              >
                {t(UC.removeSeat)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {off.length > 0 ? (
        <div className="no-print mt-4 border-t border-[var(--border)] pt-3">
          <p className="text-[11px] text-[var(--text-secondary)]">{t(UC.addSeat)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {off.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => roster.toggle(role)}
                title={t(ROLE_PURPOSE[role])}
                className="rounded-lg border border-dashed border-[var(--border-strong)] px-2 py-1 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
              >
                + {t(ROLE_LABEL[role])}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        {t(UC.teamRounding)}
      </p>
    </section>
  );
}
