"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Footer, Header } from "@/components/Chrome";
import { ConsultCTA } from "@/components/ConsultCTA";
import type { MigrationRole } from "@/lib/cloudPricing";
import { UC } from "@/lib/i18nUseCases";
import { ACTOR_LABEL, actorsIn, RACI_LABEL, raciFor } from "@/lib/raci";
import { useUseCaseSelection } from "@/lib/useCaseSelection";
import {
  PROCESS_LABEL,
  quadrantOf,
  rollUpUseCases,
  TECH_LABEL,
  teamComposition,
  TIER_LABEL,
  USE_CASES,
  type ProcessType,
  type UseCase,
} from "@/lib/useCases";

const ROLE_LABEL: Record<MigrationRole, { es: string; en: string }> = {
  architect: { es: "Arquitecto / líder", en: "Architect / lead" },
  engineer: { es: "Ingeniero de datos", en: "Data engineer" },
  analyst: { es: "Analista BI", en: "BI analyst" },
  mlEngineer: { es: "ML Engineer", en: "ML Engineer" },
  fde: { es: "Forward Deployed AI Engineer", en: "Forward Deployed AI Engineer" },
};

const PROCESS_ORDER: ProcessType[] = ["finance", "customer", "operations", "product", "h2r"];

const num = (n: number, locale: string) =>
  new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
    maximumFractionDigits: 1,
  }).format(n);

/**
 * Impact vs difficulty, on DataRev's 1-10 scales.
 *
 * Deliberately an emphasis chart, not a categorical one: selected cases carry
 * the accent hue and everything else goes grey. Colouring by tier would need
 * five hues, and the app's validated palette only clears colour-blind
 * separation for three.
 */
function PriorityMatrix({
  cases,
  selectedIds,
  onToggle,
  locale,
  t,
}: {
  cases: UseCase[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  locale: string;
  t: (v: { es: string; en: string }) => string;
}) {
  const W = 720;
  const H = 460;
  const pad = { l: 52, r: 20, t: 26, b: 46 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  // 1..10 domain on both axes.
  const x = (d: number) => pad.l + ((d - 1) / 9) * plotW;
  const y = (i: number) => pad.t + plotH - ((i - 1) / 9) * plotH;

  // Jitter identical coordinates apart so overlapping dots stay clickable.
  const seen = new Map<string, number>();
  const placed = cases.map((uc) => {
    const key = `${uc.impact}|${uc.difficulty}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    const angle = (n * 2 * Math.PI) / 3;
    const r = n === 0 ? 0 : 7;
    return { uc, cx: x(uc.difficulty) + Math.cos(angle) * r, cy: y(uc.impact) + Math.sin(angle) * r };
  });

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label={t(UC.matrixTitle)}
      >
        <rect
          x={pad.l}
          y={pad.t}
          width={plotW}
          height={plotH}
          fill="var(--surface-1)"
          stroke="var(--border)"
        />
        {/* Quadrant split at the 5.5 midpoint */}
        <line x1={x(5.5)} y1={pad.t} x2={x(5.5)} y2={pad.t + plotH} stroke="var(--border-strong)" strokeDasharray="4 4" />
        <line x1={pad.l} y1={y(5.5)} x2={pad.l + plotW} y2={y(5.5)} stroke="var(--border-strong)" strokeDasharray="4 4" />

        <text x={pad.l + 8} y={pad.t + 16} className="fill-[var(--text-muted)] text-[10px] italic">
          {t(UC.quickWin)}
        </text>
        <text x={pad.l + plotW - 8} y={pad.t + 16} textAnchor="end" className="fill-[var(--text-muted)] text-[10px] italic">
          {t(UC.bigBet)}
        </text>
        <text x={pad.l + 8} y={pad.t + plotH - 8} className="fill-[var(--text-muted)] text-[10px] italic">
          {t(UC.fillIn)}
        </text>
        <text x={pad.l + plotW - 8} y={pad.t + plotH - 8} textAnchor="end" className="fill-[var(--text-muted)] text-[10px] italic">
          {t(UC.avoid)}
        </text>

        {/* Axes */}
        <text
          x={pad.l + plotW / 2}
          y={H - 10}
          textAnchor="middle"
          className="fill-[var(--text-secondary)] text-[11px]"
        >
          {t(UC.difficulty)} →
        </text>
        <text
          x={14}
          y={pad.t + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${pad.t + plotH / 2})`}
          className="fill-[var(--text-secondary)] text-[11px]"
        >
          {t(UC.impact)} →
        </text>
        {[1, 4, 7, 10].map((v) => (
          <g key={v}>
            <text x={x(v)} y={pad.t + plotH + 16} textAnchor="middle" className="fill-[var(--text-muted)] text-[10px]">
              {v}
            </text>
            <text x={pad.l - 10} y={y(v) + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[10px]">
              {v}
            </text>
          </g>
        ))}

        {/* Filled vs hollow, not two shades of blue. Colour alone separated
            the two states by too little on this navy surface, and a shape
            difference also survives greyscale printing and colour-blindness —
            which a second blue would not. */}
        {placed.map(({ uc, cx, cy }) => {
          const on = selectedIds.includes(uc.id);
          return (
            <g key={uc.id} onClick={() => onToggle(uc.id)} className="cursor-pointer">
              <circle
                cx={cx}
                cy={cy}
                r={on ? 8 : 5.5}
                fill={on ? "var(--accent)" : "var(--surface-1)"}
                stroke={on ? "var(--surface-1)" : "var(--text-muted)"}
                strokeWidth={on ? 2 : 1.5}
              />
              <title>
                {`${uc.name[locale === "es" ? "es" : "en"]} — ${t(UC.impact)} ${uc.impact}, ${t(UC.difficulty)} ${uc.difficulty}`}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function UseCasesPage() {
  const { t, locale } = useApp();
  // Shared with the calculator, so a selection made here changes the cost
  // there without the user re-entering anything.
  const { ids: selectedIds, selected, toggle, setAll } = useUseCaseSelection();
  const [months, setMonths] = useState(6);
  const [processFilter, setProcessFilter] = useState<ProcessType | "all">("all");
  const roll = useMemo(() => rollUpUseCases(selected), [selected]);
  const raciRows = useMemo(() => raciFor(selected), [selected]);
  const raciActors = useMemo(() => actorsIn(raciRows), [raciRows]);
  const team = useMemo(() => teamComposition(roll.roleDays, months), [roll.roleDays, months]);

  const visible = useMemo(
    () => (processFilter === "all" ? USE_CASES : USE_CASES.filter((u) => u.process === processFilter)),
    [processFilter],
  );

  const grouped = useMemo(() => {
    const map = new Map<ProcessType, UseCase[]>();
    for (const p of PROCESS_ORDER) {
      const list = visible.filter((u) => u.process === p);
      if (list.length) map.set(p, list);
    }
    return map;
  }, [visible]);

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-10">
        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
            DataRev
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t(UC.title)}</h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
            {t(UC.lead)}
          </p>
          <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-[var(--text-muted)]">
            {t(UC.method)}
          </p>
        </header>

        {/* Summary strip */}
        <section className="card card-lit glow-accent avoid-break mb-6 p-5">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: t(UC.caseCount), value: String(selected.length) },
              { label: t(UC.effortTitle), value: `${num(roll.totalDays, locale)} ${t(UC.personDays)}` },
              { label: t(UC.avgImpact), value: selected.length ? num(roll.avgImpact, locale) : "—" },
              { label: t(UC.avgDifficulty), value: selected.length ? num(roll.avgDifficulty, locale) : "—" },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-[11px] font-medium text-[var(--text-muted)]">{m.label}</p>
                <p className="tnum mt-1 text-[20px] font-bold leading-none tracking-tight">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
          {selected.length > 0 ? (
            <Link
              href="/calculadora"
              className="no-print mt-4 inline-block text-[12px] font-semibold text-[var(--cyan)] underline-offset-4 hover:underline"
            >
              {t(UC.toCalculator)} →
            </Link>
          ) : null}
        </section>

        {/* Matrix */}
        <section className="card card-lit avoid-break mb-6 p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">{t(UC.matrixTitle)}</h2>
          <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">{t(UC.matrixLead)}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {[
              { label: t(UC.legendSelected), bg: "var(--accent)", border: "var(--accent)" },
              { label: t(UC.legendAvailable), bg: "transparent", border: "var(--text-muted)" },
            ].map((l) => (
              <li key={l.label} className="flex items-center gap-2 text-[11.5px] text-[var(--text-secondary)]">
                <span
                  className="h-2.5 w-2.5 rounded-full border"
                  style={{ background: l.bg, borderColor: l.border }}
                  aria-hidden="true"
                />
                {l.label}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <PriorityMatrix
              cases={USE_CASES}
              selectedIds={selectedIds}
              onToggle={toggle}
              locale={locale}
              t={t}
            />
          </div>
        </section>

        {/* Catalogue */}
        <section className="card card-lit avoid-break mb-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold tracking-tight">
              {t(UC.catalogTitle)}
              <span className="ml-2 text-[12px] font-normal text-[var(--text-muted)]">
                {selected.length} {t(UC.selected)}
              </span>
            </h2>
            <div className="no-print flex flex-wrap items-center gap-2">
              <select
                value={processFilter}
                onChange={(e) => setProcessFilter(e.target.value as ProcessType | "all")}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-2.5 py-1.5 text-[12px] text-[var(--text-primary)]"
              >
                <option value="all">{t(UC.filterAll)}</option>
                {PROCESS_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {t(PROCESS_LABEL[p])}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setAll(USE_CASES.map((u) => u.id))}
                className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                {t(UC.selectAll)}
              </button>
              <button
                type="button"
                onClick={() => setAll([])}
                className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                {t(UC.clear)}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {[...grouped.entries()].map(([process, list]) => (
              <div key={process}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
                  {t(PROCESS_LABEL[process])}
                </h3>
                <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
                  {list.map((uc) => {
                    const on = selectedIds.includes(uc.id);
                    const quadrant = quadrantOf(uc);
                    return (
                      <button
                        key={uc.id}
                        type="button"
                        onClick={() => toggle(uc.id)}
                        aria-pressed={on}
                        className={`rounded-xl border p-4 text-left transition ${
                          on
                            ? "border-[var(--accent)] bg-[var(--surface-2)]"
                            : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-strong)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                                on
                                  ? "border-[var(--accent)] bg-[var(--accent)]"
                                  : "border-[var(--border-strong)]"
                              }`}
                              aria-hidden="true"
                            >
                              {on ? (
                                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                                  <path
                                    d="M2.5 6.2 4.8 8.5 9.5 3.8"
                                    stroke="#fff"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : null}
                            </span>
                            <span>
                              <span className="block text-[13px] font-semibold text-[var(--text-primary)]">
                                {t(uc.name)}
                              </span>
                              <span className="mt-0.5 block text-[10.5px] text-[var(--text-muted)]">
                                {t(uc.activity)} · {t(TIER_LABEL[uc.tier])}
                              </span>
                            </span>
                          </div>
                          {quadrant === "quickWin" ? (
                            <span className="shrink-0 rounded-full bg-[var(--cyan)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#04081f]">
                              {t(UC.quickWin)}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2.5 text-[11.5px] italic leading-relaxed text-[var(--text-secondary)]">
                          “{t(uc.kbq)}”
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-[var(--text-muted)]">
                          <span className="tnum">
                            {t(UC.impact)} <strong className="text-[var(--text-secondary)]">{uc.impact}</strong>
                          </span>
                          <span className="tnum">
                            {t(UC.difficulty)}{" "}
                            <strong className="text-[var(--text-secondary)]">{uc.difficulty}</strong>
                          </span>
                          <span className="tnum">
                            {Object.values(uc.effort).reduce((a, d) => a + d, 0)} {t(UC.personDays)}
                          </span>
                        </div>

                        <p className="mt-1.5 text-[10.5px] text-[var(--text-muted)]">
                          {t(UC.kpiLabel)}: {t(uc.kpi)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team + tech */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card card-lit avoid-break p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight">{t(UC.teamTitle)}</h2>
                <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{t(UC.teamLead)}</p>
              </div>
              <div className="no-print flex items-center gap-2">
                <span className="text-[11px] text-[var(--text-muted)]">{t(UC.window)}</span>
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={months}
                  onChange={(e) => setMonths(Math.max(1, Number(e.target.value) || 1))}
                  className="tnum w-16 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-2 py-1 text-[12.5px]"
                />
                <span className="text-[11px] text-[var(--text-muted)]">{t(UC.months)}</span>
              </div>
            </div>

            {team.length === 0 ? (
              <p className="mt-5 text-[12.5px] text-[var(--text-muted)]">{t(UC.teamEmpty)}</p>
            ) : (
              <>
                <ul className="mt-4 space-y-2">
                  {team.map((row) => (
                    <li
                      key={row.role}
                      className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2 text-[12.5px]"
                    >
                      <span className="text-[var(--text-secondary)]">{t(ROLE_LABEL[row.role])}</span>
                      <span className="tnum whitespace-nowrap">
                        <strong className="text-[var(--text-primary)]">
                          {row.fte} {t(row.fte === 1 ? UC.fteOne : UC.fte)}
                        </strong>
                        <span className="text-[var(--text-muted)]">
                          {" "}
                          · {num(row.days, locale)} {t(UC.personDays)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[10.5px] leading-relaxed text-[var(--text-muted)]">
                  {t(UC.teamRounding)}
                </p>
              </>
            )}
          </section>

          <section className="card card-lit avoid-break p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">{t(UC.techTitle)}</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
              {t(UC.techLead)}
            </p>
            {roll.tech.length === 0 ? (
              <p className="mt-5 text-[12.5px] text-[var(--text-muted)]">{t(UC.techEmpty)}</p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {roll.tech.map((c) => (
                  <li
                    key={c}
                    className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)]"
                  >
                    {t(TECH_LABEL[c])}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* RACI */}
        <section className="card card-lit avoid-break mt-6 p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">{t(UC.raciTitle)}</h2>
          <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
            {t(UC.raciLead)}
          </p>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {(["R", "A", "C", "I"] as const).map((letter) => (
              <li key={letter} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-[3px] text-[9px] font-bold ${
                    letter === "A"
                      ? "bg-[var(--cyan)] text-[#04081f]"
                      : letter === "R"
                        ? "bg-[var(--accent)] text-white"
                        : "border border-[var(--border-strong)] text-[var(--text-muted)]"
                  }`}
                >
                  {letter}
                </span>
                {t(RACI_LABEL[letter])}
              </li>
            ))}
          </ul>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[11.5px]">
              <thead>
                <tr>
                  <th className="border-b border-[var(--border)] px-2 py-2 text-left font-semibold text-[var(--text-muted)]">
                    {t(UC.raciActivity)}
                  </th>
                  {raciActors.map((a) => (
                    <th
                      key={a}
                      className="border-b border-[var(--border)] px-1 py-2 text-center text-[9.5px] font-medium text-[var(--text-muted)]"
                    >
                      <span className="block max-w-[72px] leading-tight">{t(ACTOR_LABEL[a])}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {raciRows.map((row, i) => {
                  const newPhase = i === 0 || raciRows[i - 1].phase.en !== row.phase.en;
                  return (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-2 py-2 align-top">
                        {newPhase ? (
                          <span className="mb-1 block text-[9.5px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
                            {t(row.phase)}
                          </span>
                        ) : null}
                        <span className="block text-[var(--text-secondary)]">{t(row.activity)}</span>
                        <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">
                          {t(UC.raciDeliverable)}: {t(row.deliverable)}
                        </span>
                      </td>
                      {raciActors.map((a) => {
                        const letter = row.assignments[a];
                        return (
                          <td key={a} className="px-1 py-2 text-center align-top">
                            {letter ? (
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-[3px] text-[10px] font-bold ${
                                  letter === "A"
                                    ? "bg-[var(--cyan)] text-[#04081f]"
                                    : letter === "R"
                                      ? "bg-[var(--accent)] text-white"
                                      : "border border-[var(--border-strong)] text-[var(--text-muted)]"
                                }`}
                              >
                                {letter}
                              </span>
                            ) : (
                              <span className="text-[var(--border-strong)]">·</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-[var(--text-muted)]">
            {t(UC.raciNote)}
          </p>
        </section>

        <section className="card avoid-break mt-6 p-5">
          <p className="text-[11.5px] leading-relaxed text-[var(--text-muted)]">{t(UC.caveat)}</p>
        </section>

        <div className="mt-6">
          <ConsultCTA kind="results_review" variant="band" />
        </div>
      </main>

      <Footer />
    </>
  );
}
