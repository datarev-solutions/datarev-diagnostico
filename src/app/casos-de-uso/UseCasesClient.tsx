"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { track } from "@/lib/analytics";
import { Footer, Header } from "@/components/Chrome";
import { ConsultCTA } from "@/components/ConsultCTA";
import { StackPanel } from "@/components/StackPanel";
import { TeamPanel } from "@/components/TeamPanel";
import { SOURCE_BY_ID, SOURCES, READINESS_GAPS } from "@/lib/evidence";
import { APQC_CATEGORY, topProcesses } from "@/lib/processes";
import { quadrantOfScored, scoreFor } from "@/lib/useCaseScoring";
import { expandStack } from "@/lib/stack";
import { getUseCaseAgenticClassification } from "@/lib/agenticGovernance";
import { UC } from "@/lib/i18nUseCases";
import { ACTOR_LABEL, actorsIn, RACI_LABEL, raciFor } from "@/lib/raci";
import { Gated } from "@/components/Gate";
import { can, type Capability, type TierId } from "@/lib/tiers";
import { useUseCaseSelection } from "@/lib/useCaseSelection";
import {
  DEPARTMENT_LABEL,
  forIndustry,
  INDUSTRY_LABEL,
  PROCESS_LABEL,
  rollUpUseCases,
  TIER_LABEL,
  USE_CASES,
  type Department,
  type Industry,
  type ProcessType,
  type UseCase,
} from "@/lib/useCases";

const PROCESS_ORDER: ProcessType[] = ["finance", "customer", "operations", "product", "h2r"];

// Derived from the label records so a new industry or department cannot be
// added to the catalogue and silently go missing from the filters.
// 'cross' is excluded: those cases show up under every industry already, so
// offering it beside "All industries" would only be confusing.
const INDUSTRY_ORDER = (Object.keys(INDUSTRY_LABEL) as Industry[]).filter((i) => i !== "cross");
const DEPARTMENT_ORDER = Object.keys(DEPARTMENT_LABEL) as Department[];

/**
 * Every capability this page gates. Kept beside the page rather than derived
 * from the JSX because a `<Gated>` that stops rendering is exactly the case an
 * automatic derivation would miss — and the paywall event is what tells us
 * which wall people actually hit.
 */
const GATED_HERE: Capability[] = ["usecases.scores", "usecases.effort"];

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
/** A use case with the industry lens already applied. */
interface Plotted {
  uc: UseCase;
  impact: number;
  difficulty: number;
}

function PriorityMatrix({
  cases,
  selectedIds,
  onToggle,
  locale,
  t,
}: {
  cases: Plotted[];
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
  const placed = cases.map((p) => {
    const key = `${p.impact}|${p.difficulty}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    const angle = (n * 2 * Math.PI) / 3;
    const r = n === 0 ? 0 : 7;
    return { ...p, cx: x(p.difficulty) + Math.cos(angle) * r, cy: y(p.impact) + Math.sin(angle) * r };
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
        {placed.map(({ uc, impact, difficulty, cx, cy }) => {
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
                {`${uc.name[locale === "es" ? "es" : "en"]} — ${t(UC.impact)} ${impact}, ${t(UC.difficulty)} ${difficulty}`}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function UseCasesClient({ tier }: { tier: TierId }) {
  const { t, locale, hydrated } = useApp();
  // Shared with the calculator, so a selection made here changes the cost
  // there without the user re-entering anything.
  const { ids: selectedIds, selected, toggle, setAll } = useUseCaseSelection();
  const [months, setMonths] = useState(6);
  const [processFilter, setProcessFilter] = useState<ProcessType | "all">("all");
  const [industryFilter, setIndustryFilter] = useState<Industry | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<Department | "all">("all");
  const roll = useMemo(() => rollUpUseCases(selected), [selected]);
  const raciRows = useMemo(() => raciFor(selected), [selected]);
  const raciActors = useMemo(() => actorsIn(raciRows), [raciRows]);

  // Once per mount. Refs rather than state throughout: none of this changes
  // what is on screen, and this React version lints against setting state
  // synchronously inside an effect.
  const viewTracked = useRef(false);
  useEffect(() => {
    // Waits for hydration on purpose. The selection is a useSyncExternalStore
    // whose server snapshot is the three defaults; firing on the first commit
    // reported "3 selected" to every visitor, including one who had picked a
    // single case. Verified against the events table, which is how it was
    // caught.
    if (!hydrated || viewTracked.current) return;
    viewTracked.current = true;
    track("usecases_viewed", { tier, selected: selectedIds.length });
  }, [hydrated, tier, selectedIds.length]);

  // The wall, recorded where it is actually hit. `tier` is resolved on the
  // server and fixed for the life of this page, so a locked capability here is
  // a section that rendered locked in front of a real visitor — which is the
  // single most useful thing this table can be asked.
  const paywallTracked = useRef(false);
  useEffect(() => {
    if (paywallTracked.current) return;
    paywallTracked.current = true;
    for (const capability of GATED_HERE) {
      if (can(tier, capability)) continue;
      track("paywall_hit", { capability, tier, surface: "usecases" });
    }
  }, [tier]);

  /**
   * Selecting a case is the one deliberate act on this page, so it is worth an
   * event — but only the id and the resulting size of the selection, never the
   * case's text.
   */
  const toggleCase = useCallback(
    (id: string) => {
      const turningOn = !selectedIds.includes(id);
      toggle(id);
      track("usecase_selected", {
        use_case_id: id,
        action: turningOn ? "select" : "deselect",
        // Where the selection ends up, so the average basket size is readable
        // without replaying every event in the session.
        total: turningOn ? selectedIds.length + 1 : selectedIds.length - 1,
      });
    },
    [selectedIds, toggle],
  );

  /** Score through the chosen industry's lens. `all` returns base scores. */
  const scoreOf = useCallback(
    (uc: UseCase) => scoreFor(uc, industryFilter),
    [industryFilter],
  );

  const avgScored = useMemo(() => {
    if (selected.length === 0) return { impact: 0, difficulty: 0 };
    const scores = selected.map(scoreOf);
    const mean = (xs: number[]) => xs.reduce((a, x) => a + x, 0) / xs.length;
    return {
      impact: mean(scores.map((s) => s.impact)),
      difficulty: mean(scores.map((s) => s.difficulty)),
    };
  }, [selected, scoreOf]);

  // The stack the selection really implies — not the handful of capability
  // tags the use cases declare. This is what puts a security engineer and an
  // eval harness on an agent project nobody explicitly asked for either on.
  const layers = useMemo(
    () => expandStack(roll.tech, [...new Set(selected.map((u) => u.tier))]),
    [roll.tech, selected],
  );

  // Industry first — forIndustry keeps cross-industry cases in every filter,
  // so a banking view still shows the executive cockpit.
  const visible = useMemo(
    () =>
      forIndustry(industryFilter).filter(
        (u) =>
          (processFilter === "all" || u.process === processFilter) &&
          (departmentFilter === "all" || u.department === departmentFilter),
      ),
    [industryFilter, processFilter, departmentFilter],
  );

  // The matrix mirrors the filters, plus anything already selected: a dot that
  // is driving the totals below must never be hidden by a filter change.
  const plotted = useMemo(() => {
    const ids = new Set(visible.map((u) => u.id));
    return [...visible, ...selected.filter((u) => !ids.has(u.id))].map((uc) => {
      const s = scoreOf(uc);
      return { uc, impact: s.impact, difficulty: s.difficulty };
    });
  }, [visible, selected, scoreOf]);

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
          <p className="mt-2 max-w-3xl border-l-2 border-[var(--border-strong)] pl-3 text-[11.5px] leading-relaxed text-[var(--text-muted)]">
            {t(UC.provenance)}
          </p>
        </header>

        {/* Summary strip. Gated too: "27 días-persona" is the effort answer
            in miniature, and leaving it open would hand over the headline
            number the panels below are gated to protect. */}
        <Gated capability="usecases.scores" tier={tier}>
        <section className="card card-lit glow-accent avoid-break mb-6 p-5">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: t(UC.caseCount), value: String(selected.length) },
              { label: t(UC.effortTitle), value: `${num(roll.totalDays, locale)} ${t(UC.personDays)}` },
              // Averaged on the scored numbers, not the raw ones — the strip
              // and the cards must not disagree about the same selection.
              { label: t(UC.avgImpact), value: selected.length ? num(avgScored.impact, locale) : "—" },
              {
                label: t(UC.avgDifficulty),
                value: selected.length ? num(avgScored.difficulty, locale) : "—",
              },
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
        </Gated>

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
            {/* The matrix plots the industry-adjusted scores, which is the
                paid artefact. The catalogue underneath stays browsable so a
                visitor can see which cases exist and what questions they
                answer — that is the teaser, and it is genuinely useful. */}
            <Gated capability="usecases.scores" tier={tier}>
              <PriorityMatrix
                cases={plotted}
                selectedIds={selectedIds}
                onToggle={toggleCase}
                locale={locale}
                t={t}
              />
            </Gated>
          </div>
        </section>

        {/* Real processes for the chosen industry + department — not the same
            thing as the catalogue below. The catalogue only covers the ~36
            processes DataRev has authored a use case for; a real company runs
            thousands more. This shows the department's actual process
            landscape first, with the built case flagged when one exists. */}
        {(industryFilter !== "all" || departmentFilter !== "all") && (
          <section className="card card-lit avoid-break mb-6 p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">
              {t(UC.processesTitle)}
            </h2>
            <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
              {t(UC.processesLead)}
            </p>

            {topProcesses(industryFilter, departmentFilter, 10).length === 0 ? (
              <p className="mt-4 text-[12.5px] text-[var(--text-muted)]">
                {t(UC.processesEmpty)}
              </p>
            ) : (
              <ul className="mt-4 grid gap-2.5 lg:grid-cols-2">
                {topProcesses(industryFilter, departmentFilter, 10).map((p) => {
                  const linked = p.linkedUseCaseId
                    ? USE_CASES.find((u) => u.id === p.linkedUseCaseId)
                    : undefined;
                  return (
                    <li
                      key={p.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {t(p.name)}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            linked
                              ? "bg-[var(--cyan)] text-[#04081f]"
                              : "border border-[var(--border-strong)] text-[var(--text-muted)]"
                          }`}
                        >
                          {linked ? t(UC.processesHasCase) : t(UC.processesNoCase)}
                        </span>
                      </div>
                      <p className="mt-1 text-[10.5px] uppercase tracking-wider text-[var(--text-muted)]">
                        {APQC_CATEGORY[p.department].code} · {t(APQC_CATEGORY[p.department].name)}
                      </p>
                      <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
                        {t(p.what)}
                      </p>
                      {linked ? (
                        <p className="mt-2 text-[10.5px] text-[var(--cyan)]">
                          → {t(linked.name)}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="mt-4 max-w-3xl text-[10.5px] leading-relaxed text-[var(--text-muted)]">
              {t(UC.processesProvenance)}
            </p>
          </section>
        )}

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
                aria-label={t(UC.filterIndustry)}
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value as Industry | "all")}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-2.5 py-1.5 text-[12px] text-[var(--text-primary)]"
              >
                <option value="all">{t(UC.filterIndustryAll)}</option>
                {INDUSTRY_ORDER.map((i) => (
                  <option key={i} value={i}>
                    {t(INDUSTRY_LABEL[i])}
                  </option>
                ))}
              </select>
              <select
                aria-label={t(UC.filterDepartment)}
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value as Department | "all")}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-2.5 py-1.5 text-[12px] text-[var(--text-primary)]"
              >
                <option value="all">{t(UC.filterDepartmentAll)}</option>
                {DEPARTMENT_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {t(DEPARTMENT_LABEL[d])}
                  </option>
                ))}
              </select>
              <select
                aria-label={t(UC.filterProcess)}
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
                onClick={() => setAll(visible.map((u) => u.id))}
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
            {grouped.size === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-[12.5px] text-[var(--text-muted)]">
                {t(UC.noMatches)}
              </p>
            ) : null}
            {[...grouped.entries()].map(([process, list]) => (
              <div key={process}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
                  {t(PROCESS_LABEL[process])}
                </h3>
                <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
                  {list.map((uc) => {
                    const on = selectedIds.includes(uc.id);
                    const score = scoreOf(uc);
                    const quadrant = quadrantOfScored(score);
                    const moved =
                      score.impact !== score.baseImpact ||
                      score.difficulty !== score.baseDifficulty;
                    return (
                      <button
                        key={uc.id}
                        type="button"
                        onClick={() => toggleCase(uc.id)}
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
                              <span className="mt-1.5 flex flex-wrap gap-1">
                                <span className="rounded border border-[var(--border)] px-1.5 py-px text-[9.5px] font-medium text-[var(--text-secondary)]">
                                  {t(DEPARTMENT_LABEL[uc.department])}
                                </span>
                                {/* Only sector-specific cases earn an industry tag —
                                    stamping "Any industry" on two thirds of the
                                    catalogue would be noise, not information. */}
                                {uc.industries.includes("cross")
                                  ? null
                                  : uc.industries.map((ind) => (
                                      <span
                                        key={ind}
                                        className="rounded border border-[var(--border)] px-1.5 py-px text-[9.5px] font-medium text-[var(--text-muted)]"
                                      >
                                        {t(INDUSTRY_LABEL[ind])}
                                      </span>
                                    ))}
                              </span>
                            </span>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {quadrant === "quickWin" ? (
                              <span className="rounded-full bg-[var(--cyan)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#04081f]">
                                {t(UC.quickWin)}
                              </span>
                            ) : null}
                            {(() => {
                              const gov = getUseCaseAgenticClassification(uc);
                              return (
                                <div className="flex flex-wrap items-center justify-end gap-1">
                                  <span className="rounded border border-[var(--cyan)]/20 bg-[var(--cyan)]/10 px-1.5 py-px text-[9px] font-medium text-[var(--cyan)]">
                                    🤖 {gov.agenticLabel}
                                  </span>
                                  <span className={`rounded border px-1.5 py-px text-[9px] font-medium ${gov.euBadgeColor}`}>
                                    ⚖️ {gov.euRiskLabel}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <p className="mt-2.5 text-[11.5px] italic leading-relaxed text-[var(--text-secondary)]">
                          “{t(uc.kbq)}”
                        </p>

                        {/* Scores, effort and the adjustment trail are the
                            paid artefact. The card keeps its name, activity,
                            tier, owning department and — most usefully — its
                            key business question, so the teaser still tells a
                            visitor whether this case is about their problem. */}
                        <Gated capability="usecases.scores" tier={tier}>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-[var(--text-muted)]">
                          <span className="tnum">
                            {t(UC.impact)}{" "}
                            <strong className="text-[var(--text-secondary)]">{score.impact}</strong>
                            {score.impact !== score.baseImpact ? (
                              <span className="ml-1 text-[9.5px]">
                                ({t(UC.baseScore)} {score.baseImpact})
                              </span>
                            ) : null}
                          </span>
                          <span className="tnum">
                            {t(UC.difficulty)}{" "}
                            <strong className="text-[var(--text-secondary)]">
                              {score.difficulty}
                            </strong>
                            {score.difficulty !== score.baseDifficulty ? (
                              <span className="ml-1 text-[9.5px]">
                                ({t(UC.baseScore)} {score.baseDifficulty})
                              </span>
                            ) : null}
                          </span>
                          <span className="tnum">
                            {Object.values(uc.effort).reduce((a, d) => a + d, 0)} {t(UC.personDays)}
                          </span>
                        </div>

                        {/* Why the number moved. A score that shifts without a
                            stated reason is the black box this whole rebuild
                            exists to avoid. */}
                        {moved ? (
                          <ul className="mt-1.5 space-y-0.5">
                            {[...score.impactAdjustments, ...score.difficultyAdjustments].map(
                              (a, i) => (
                                <li
                                  key={i}
                                  className="text-[9.5px] leading-relaxed text-[var(--text-muted)]"
                                >
                                  <span className="tnum text-[var(--text-secondary)]">
                                    {a.delta > 0 ? "+" : ""}
                                    {Math.round(a.delta * 10) / 10}
                                  </span>{" "}
                                  {t(a.reason)}
                                  {a.sourceId ? ` — ${SOURCE_BY_ID[a.sourceId].org}` : ""}
                                </li>
                              ),
                            )}
                          </ul>
                        ) : null}
                        </Gated>

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

        {/* Team + stack. Both derive from the selection and both stay editable
            — a client who already employs a governance lead should not be
            quoted for ours. */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Gated capability="usecases.effort" tier={tier}>
            <TeamPanel
              roleDays={roll.roleDays}
              layers={layers}
              useCaseCount={selected.length}
              months={months}
              onMonths={setMonths}
            />
          </Gated>
          <Gated capability="usecases.effort" tier={tier}>
            <StackPanel auto={layers} />
          </Gated>
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

        {/* Readiness gaps: why the plan carries governance, security and
            adoption lines an engineering-only estimate would drop. */}
        <section className="card card-lit avoid-break mt-6 p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">{t(UC.readinessTitle)}</h2>
          <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
            {t(UC.readinessLead)}
          </p>
          <ul className="mt-4 space-y-2.5">
            {READINESS_GAPS.map((gap) => (
              <li key={gap.label.en}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] text-[var(--text-secondary)]">{t(gap.label)}</span>
                  <span className="tnum shrink-0 text-[13px] font-semibold text-[var(--text-primary)]">
                    {gap.pct}%
                  </span>
                </div>
                <div
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]"
                  role="img"
                  aria-label={`${gap.pct}%`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${gap.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Sources. The client can go read them. */}
        <section className="card avoid-break mt-6 p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">{t(UC.evidenceTitle)}</h2>
          <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-[var(--text-secondary)]">
            {t(UC.evidenceLead)}
          </p>
          <ul className="mt-4 space-y-3">
            {SOURCES.map((s) => (
              <li key={s.id} className="border-l-2 border-[var(--border-strong)] pl-3">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12.5px] font-medium text-[var(--text-primary)] underline underline-offset-2 transition hover:text-[var(--cyan)]"
                >
                  {s.org} — {s.title}
                </a>
                <span className="ml-1.5 text-[11px] text-[var(--text-muted)]">({s.published})</span>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
                  {t(s.basis)}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--text-muted)]">
            {t(UC.caveat)}
          </p>
        </section>

        <div className="mt-6">
          <ConsultCTA kind="results_review" variant="band" />
        </div>
      </main>

      <Footer />
    </>
  );
}
