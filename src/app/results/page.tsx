"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Footer, Header, DataRevLogo } from "@/components/Chrome";
import { ConsultCTA } from "@/components/ConsultCTA";
import { LeadGate } from "@/components/LeadGate";
import { useSession } from "@/components/SessionProvider";
import { GapBars } from "@/components/charts/GapBars";
import { ImpactEffort } from "@/components/charts/ImpactEffort";
import { MaturityGrid } from "@/components/charts/MaturityGrid";
import { Radar } from "@/components/charts/Radar";
import { ScoreHero, StageDistribution } from "@/components/charts/Verdict";
import { Roadmap } from "@/components/Roadmap";
import { ExecutiveBlueprintPDF } from "@/components/ExecutiveBlueprintPDF";
import { track } from "@/lib/analytics";
import { DATAREV } from "@/lib/datarev";
import { DIMENSION_MAP } from "@/lib/framework";
import { formatDate, SOURCE_LIST, UI } from "@/lib/i18n";
import { buildAssessmentPayload, readAttribution } from "@/lib/leadPayload";
import { buildRoadmap } from "@/lib/roadmap";
import { rankedGaps, scoreAssessment, strongestDimensions } from "@/lib/scoring";
import { encodeState } from "@/lib/state";

export default function ResultsPage() {
  const { state, hydrated, t, locale, hasProgress } = useApp();
  const { user, ready, lead, unlocked, rememberLead } = useSession();
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scoreAssessment(state.answers, state.targets, state.mode),
    [state.answers, state.targets, state.mode],
  );
  const roadmap = useMemo(() => buildRoadmap(result), [result]);
  const gaps = useMemo(() => rankedGaps(result), [result]);
  const strengths = useMemo(() => strongestDimensions(result), [result]);

  // A Google sign-in unlocks the report before the assessment has been stored.
  // Attach it once, here, so the lead row is not just an email with no result.
  const saveAttempted = useRef(false);
  useEffect(() => {
    if (!hydrated || !ready || !hasProgress) return;
    if (!user?.email || lead || saveAttempted.current) return;

    saveAttempted.current = true;

    void (async () => {
      try {
        const response = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            fullName: user.user_metadata?.full_name,
            company: state.company.name || undefined,
            industry: state.company.industry || undefined,
            companySize: state.company.size || undefined,
            locale,
            consentMarketing: true,
            utm: readAttribution(),
            assessment: buildAssessmentPayload(state, result),
          }),
        });
        const body = await response.json();
        if (response.ok && body.success) {
          // The other half of `lead_captured`: the form path fires in
          // LeadGate, but a Google sign-in never touches that form and its
          // row is written here. Counting only the form would report the
          // Google funnel as pure drop-off.
          track("lead_captured", {
            method: "google",
            locale,
            level: result.level,
          });

          rememberLead({
            leadId: body.data.leadId,
            assessmentId: body.data.assessmentId,
            email: user.email!,
            name: user.user_metadata?.full_name,
          });
        }
      } catch {
        // The visitor still sees their report; the row can be recovered from
        // the auth user, which the callback route already wrote.
      }
    })();
  }, [
    hydrated,
    ready,
    hasProgress,
    user,
    lead,
    state,
    result,
    locale,
    rememberLead,
  ]);

  /**
   * The report itself, counted once per mount and only when it actually
   * renders — the same component also renders the empty state and the lead
   * gate, and neither of those is a report anyone read.
   *
   * A ref, not state, for the same reason as the save above: this decides
   * nothing the user can see, and this React version lints against setting
   * state from inside an effect.
   */
  const reportTracked = useRef(false);
  useEffect(() => {
    if (!hydrated || !ready || !hasProgress || !unlocked) return;
    if (reportTracked.current) return;
    reportTracked.current = true;

    track("report_viewed", {
      mode: state.mode,
      level: result.level,
      // One decimal, matching what the page prints.
      overall: Math.round(result.overall * 10) / 10,
      answered: Object.keys(state.answers).length,
      actions: roadmap.length,
      // Which key opened the door — the email form or a Google account.
      unlocked_by: user ? "account" : "lead",
    });
  }, [
    hydrated,
    ready,
    hasProgress,
    unlocked,
    state.mode,
    state.answers,
    result,
    roadmap.length,
    user,
  ]);

  async function copyLink() {
    const url = `${window.location.origin}/results?r=${encodeURIComponent(encodeState(state))}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t(UI.copyLink), url);
    }
  }

  if (!hydrated || !ready) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-20" />
      </>
    );
  }

  if (!hasProgress) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-24 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t(UI.noResultsTitle)}
          </h1>
          <p className="mt-3 text-[14px] text-[var(--text-secondary)]">
            {t(UI.noResultsBody)}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            {t(UI.goToStart)}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // The gate. The assessment was free; the report is what the email buys.
  if (!unlocked) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <LeadGate state={state} result={result} />
        </main>
        <Footer />
      </>
    );
  }

  const topGap = gaps[0];
  const topStrength = strengths[0];

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-8">
        {/* Report masthead — the first thing on the printed page */}
        <header className="avoid-break mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t(UI.reportFor)}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {state.company.name || t(UI.tagline)}
            </h1>
            <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
              {[
                state.company.industry,
                state.company.size,
                formatDate(locale),
                state.company.assessor
                  ? `${t(UI.preparedBy)}: ${state.company.assessor}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <DataRevLogo className="hidden h-14 print:block sm:block" />
        </header>

        {/* Action bar */}
        <div className="no-print mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            {t(UI.downloadReport)}
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-[13px] font-semibold transition hover:bg-[var(--surface-2)]"
          >
            {copied ? t(UI.linkCopied) : t(UI.copyLink)}
          </button>
          <Link
            href="/assessment"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-[13px] font-semibold transition hover:bg-[var(--surface-2)]"
          >
            {t(UI.editAnswers)}
          </Link>
          <Link
            href="/"
            className="rounded-lg px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            {t(UI.newAssessment)}
          </Link>
        </div>

        <div className="space-y-6">
          <ScoreHero result={result} locale={locale} />

          {/* Narrative verdict: what the numbers mean in one paragraph */}
          <section className="card card-lit avoid-break p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">
              {t(UI.verdictTitle)}
            </h2>
            <p className="mt-2.5 max-w-4xl text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
              {topGap ? (
                locale === "es" ? (
                  <>
                    La organización se ubica en el nivel{" "}
                    <strong className="text-[var(--text-primary)]">
                      {result.level}
                    </strong>{" "}
                    con una puntuación ponderada de{" "}
                    <strong className="tnum text-[var(--text-primary)]">
                      {result.overall.toFixed(1)}
                    </strong>
                    . La brecha más costosa está en{" "}
                    <strong className="text-[var(--text-primary)]">
                      {t(DIMENSION_MAP[topGap.dimension].name)}
                    </strong>{" "}
                    ({topGap.raw.toFixed(1)} contra un objetivo de{" "}
                    {topGap.target}), que pesa{" "}
                    {Math.round(topGap.weight * 100)}% del índice. La mayor
                    fortaleza es{" "}
                    <strong className="text-[var(--text-primary)]">
                      {t(DIMENSION_MAP[topStrength.dimension].name)}
                    </strong>{" "}
                    ({topStrength.raw.toFixed(1)}). El roadmap propone{" "}
                    {roadmap.length} acciones para cerrar las brechas.
                  </>
                ) : (
                  <>
                    The organisation sits at level{" "}
                    <strong className="text-[var(--text-primary)]">
                      {result.level}
                    </strong>{" "}
                    with a weighted score of{" "}
                    <strong className="tnum text-[var(--text-primary)]">
                      {result.overall.toFixed(1)}
                    </strong>
                    . The costliest gap is in{" "}
                    <strong className="text-[var(--text-primary)]">
                      {t(DIMENSION_MAP[topGap.dimension].name)}
                    </strong>{" "}
                    ({topGap.raw.toFixed(1)} against a target of{" "}
                    {topGap.target}), which carries{" "}
                    {Math.round(topGap.weight * 100)}% of the index. The
                    strongest area is{" "}
                    <strong className="text-[var(--text-primary)]">
                      {t(DIMENSION_MAP[topStrength.dimension].name)}
                    </strong>{" "}
                    ({topStrength.raw.toFixed(1)}). The roadmap proposes{" "}
                    {roadmap.length} actions to close the gaps.
                  </>
                )
              ) : (
                t(UI.noGaps)
              )}
            </p>

            {strengths.length > 0 ? (
              <div className="mt-4 border-t border-[var(--border)] pt-3.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {t(UI.strengthsTitle)}
                </h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {strengths.slice(0, 3).map((score) => (
                    <li
                      key={score.dimension}
                      className="tnum rounded-full bg-[var(--surface-2)] px-3 py-1 text-[11.5px] text-[var(--text-secondary)]"
                    >
                      {t(DIMENSION_MAP[score.dimension].short)}{" "}
                      <span className="font-semibold">
                        {score.raw.toFixed(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {/* items-start so the shorter card keeps its natural height instead
              of stretching to match the radar. */}
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Radar scores={result.dimensions} locale={locale} />
            <StageDistribution result={result} locale={locale} />
          </div>

          <div className="page-break">
            <MaturityGrid scores={result.dimensions} locale={locale} />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <GapBars scores={result.dimensions} locale={locale} />
            {roadmap.length > 0 ? (
              <ImpactEffort actions={roadmap} locale={locale} />
            ) : null}
          </div>

          <div className="page-break pt-2">
            <Roadmap actions={roadmap} locale={locale} />
          </div>

          {/* The commercial ask, once the value has been delivered. */}
          <ConsultCTA
            kind="results_review"
            variant="band"
            assessmentId={lead?.assessmentId ?? null}
          />

          <section className="card card-lit avoid-break p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">
              {t(UI.methodology)}
            </h2>
            <p className="mt-2 max-w-4xl text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
              {t(UI.methodologyBody)}
            </p>

            <h3 className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t(UI.sources)}
            </h3>
            <ul className="mt-2 grid gap-1 text-[12px] text-[var(--text-secondary)] sm:grid-cols-2">
              {SOURCE_LIST.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>

            <div className="mt-5 border-t border-[var(--border)] pt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
              <p>{t(UI.frameworkDisclaimer)}</p>
              <p className="mt-1.5">
                {DATAREV.fullName} · {DATAREV.site.replace("https://", "")} ·{" "}
                {DATAREV.email}
              </p>
            </div>
          </section>
        </div>
      </main>

      <ExecutiveBlueprintPDF
        score={result.overall}
        level={result.level}
        stageName={t(result.stage.name)}
        dimensionScores={Object.fromEntries(result.dimensions.map((d) => [d.dimension, d.raw])) as Record<string, number>}
        topGaps={gaps.map((g) => t(DIMENSION_MAP[g.dimension].name))}
        clientDomain={state.company.name || "Empresa Prospecto"}
      />

      <Footer />
    </>
  );
}
