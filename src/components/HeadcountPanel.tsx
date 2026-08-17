"use client";

import { useApp } from "@/components/AppProvider";
import { ROLE_LABEL, ROLE_ORDER, ROLE_PURPOSE, type MigrationRole } from "@/lib/cloudPricing";
import type { MigrationLine } from "@/lib/costModel";
import { CALC } from "@/lib/i18nCalc";
import { teamComposition } from "@/lib/useCases";

/**
 * Who actually builds this, and how many of them.
 *
 * The calculator priced the work from the first version but never said who does
 * it — a client could read "USD 79,638 una sola vez" without ever learning it
 * buys two data engineers, an architect, an ML engineer and a PM. Cost without
 * headcount is not a plan you can staff.
 *
 * Everything here is derived from the same lines that produce the money, so the
 * two can never disagree: each estimate line already carries the role that does
 * it and the days it takes.
 */
export function HeadcountPanel({
  lines,
  months,
  onMonths,
  locale,
  workingDaysPerMonth = 20,
}: {
  lines: MigrationLine[];
  months: number;
  onMonths: (n: number) => void;
  locale: string;
  workingDaysPerMonth?: number;
}) {
  const { t } = useApp();

  const roleDays: Partial<Record<MigrationRole, number>> = {};
  const roleCost: Partial<Record<MigrationRole, number>> = {};
  for (const line of lines) {
    roleDays[line.roleKey] = (roleDays[line.roleKey] ?? 0) + line.days;
    roleCost[line.roleKey] = (roleCost[line.roleKey] ?? 0) + line.cost;
  }

  // Same function the planner uses, so a role sized at 2 people there is not
  // sized at 1 here.
  const team = teamComposition(roleDays, months, workingDaysPerMonth);
  const ordered = [...team].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );

  const totalPeople = ordered.reduce((a, r) => a + r.fte, 0);
  const totalDays = ordered.reduce((a, r) => a + r.days, 0);

  const usd = (n: number) =>
    new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const num = (n: number) =>
    new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
      maximumFractionDigits: 1,
    }).format(n);

  return (
    <section className="card card-lit avoid-break mb-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">{t(CALC.headcountTitle)}</h2>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
            {t(CALC.headcountLead)}
          </p>
        </div>
        <div className="no-print flex items-center gap-2">
          <label
            className="text-[11px] text-[var(--text-muted)]"
            htmlFor="calc-window-months"
          >
            {t(CALC.headcountWindow)}
          </label>
          <input
            id="calc-window-months"
            type="number"
            min={1}
            max={36}
            value={months}
            onChange={(e) => onMonths(Math.min(36, Math.max(1, Number(e.target.value) || 1)))}
            className="tnum w-16 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-2 py-1 text-[12.5px]"
          />
          <span className="text-[11px] text-[var(--text-muted)]">{t(CALC.headcountMonths)}</span>
        </div>
      </div>

      {ordered.length === 0 ? (
        <p className="mt-5 text-[12.5px] text-[var(--text-muted)]">{t(CALC.headcountEmpty)}</p>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border-strong)]">
                  <th className="pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t(CALC.headcountRole)}
                  </th>
                  <th className="pb-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t(CALC.headcountPeople)}
                  </th>
                  <th className="pb-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t(CALC.headcountDays)}
                  </th>
                  <th className="pb-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t(CALC.headcountCost)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((row) => (
                  <tr key={row.role} className="border-b border-[var(--border)] align-top">
                    <td className="py-2.5 pr-3">
                      <span className="block text-[12.5px] font-medium text-[var(--text-primary)]">
                        {t(ROLE_LABEL[row.role])}
                      </span>
                      <span className="mt-0.5 block max-w-md text-[10.5px] leading-relaxed text-[var(--text-muted)]">
                        {t(ROLE_PURPOSE[row.role])}
                      </span>
                    </td>
                    <td className="tnum py-2.5 text-right text-[13px] font-semibold text-[var(--text-primary)]">
                      {row.fte}
                    </td>
                    <td className="tnum py-2.5 text-right text-[12px] text-[var(--text-secondary)]">
                      {num(row.days)}
                    </td>
                    <td className="tnum py-2.5 text-right text-[12px] text-[var(--text-secondary)]">
                      {usd(roleCost[row.role] ?? 0)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-3 text-[12px] font-semibold text-[var(--text-primary)]">
                    {t(CALC.headcountTotal)}
                  </td>
                  <td className="tnum pt-3 text-right text-[13px] font-semibold text-[var(--text-primary)]">
                    {totalPeople}
                  </td>
                  <td className="tnum pt-3 text-right text-[12px] text-[var(--text-secondary)]">
                    {num(totalDays)}
                  </td>
                  <td className="tnum pt-3 text-right text-[12px] font-semibold text-[var(--text-primary)]">
                    {usd(Object.values(roleCost).reduce((a, c) => a + c, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-[var(--text-muted)]">
            {t(CALC.headcountNote)}
          </p>
        </>
      )}
    </section>
  );
}
