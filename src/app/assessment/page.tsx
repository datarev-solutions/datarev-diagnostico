"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Header } from "@/components/Chrome";
import { ConsultCTA } from "@/components/ConsultCTA";
import {
  AMBITIONS,
  DIMENSION_MAP,
  DIMENSIONS,
  LEVEL_VALUES,
  type AmbitionId,
  type DimensionId,
  type L,
  type Level,
  type Locale,
} from "@/lib/framework";
import { INDUSTRIES, SIZES, UI } from "@/lib/i18n";
import { questionsFor } from "@/lib/questions";
import type { Targets } from "@/lib/scoring";
import type { CompanyContext } from "@/lib/state";

type Step = "context" | "questions" | "ambition";

interface Nav {
  step: Step;
  index: number;
}

/**
 * Where a returning visitor should land, derived from what they have already
 * answered. Held as derived-with-override rather than pushed in from an
 * effect, so the persisted answers are read during render.
 */
function initialNav(questionIds: string[], answers: Record<string, Level>): Nav {
  if (Object.keys(answers).length === 0) return { step: "context", index: 0 };
  const firstGap = questionIds.findIndex((id) => !answers[id]);
  return firstGap === -1
    ? { step: "ambition", index: Math.max(0, questionIds.length - 1) }
    : { step: "questions", index: firstGap };
}

export default function AssessmentPage() {
  const router = useRouter();
  const {
    state,
    hydrated,
    t,
    locale,
    setCompany,
    setAnswer,
    setAmbition,
    setTarget,
  } = useApp();

  const questions = useMemo(() => questionsFor(state.mode), [state.mode]);
  const questionIds = useMemo(
    () => questions.map((item) => item.id),
    [questions],
  );

  const [override, setOverride] = useState<Nav | null>(null);
  const nav = override ?? initialNav(questionIds, state.answers);
  const { step, index } = nav;

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  const answeredCount = Object.keys(state.answers).length;
  const question = questions[Math.min(index, questions.length - 1)];

  const goNext = useCallback(() => {
    setOverride((current) => {
      const from = current ?? { step: "questions" as Step, index: 0 };
      return from.index + 1 >= questionIds.length
        ? { step: "ambition", index: from.index }
        : { step: "questions", index: from.index + 1 };
    });
  }, [questionIds.length]);

  function choose(level: Level) {
    setAnswer(question.id, level);
    // Pin the position before the answer lands, so the derived fallback
    // cannot jump the user to a different question mid-transition.
    setOverride({ step: "questions", index });
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(goNext, 260);
  }

  if (!hydrated) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-20" />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-20 pt-8">
        {step === "context" ? (
          <ContextStep
            values={state.company}
            onChange={setCompany}
            onContinue={() => setOverride({ step: "questions", index: 0 })}
            labels={{
              title: t(UI.contextTitle),
              lead: t(UI.contextLead),
              name: t(UI.companyName),
              namePlaceholder: t(UI.companyPlaceholder),
              industry: t(UI.industry),
              size: t(UI.size),
              assessor: t(UI.assessorName),
              assessorPlaceholder: t(UI.assessorPlaceholder),
              next: t(UI.next),
              skip: t(UI.skip),
            }}
            industries={INDUSTRIES.map((item) => t(item))}
            sizes={SIZES.map((item) => t(item))}
          />
        ) : null}

        {/* Offered at the top of the long assessment, where the cost of doing
            it alone is most visible — 40 questions still ahead. */}
        {step === "context" && state.mode === "full" ? (
          <div className="mt-6">
            <ConsultCTA kind="guided_full" variant="panel" />
            <p className="mt-3 text-center text-[12px] text-[var(--text-muted)]">
              {t(UI.orDoItYourself)}
            </p>
          </div>
        ) : null}

        {step === "questions" ? (
          <>
            <ProgressBar
              answered={answeredCount}
              total={questions.length}
              index={index}
              labels={{
                question: t(UI.question),
                of: t(UI.of),
                answered: t(UI.answered),
              }}
            />

            <div key={question.id} className="rise mt-7">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                {t(DIMENSION_MAP[question.dimension].name)}
              </p>
              <h1 className="mt-2 text-[22px] font-semibold leading-snug tracking-tight">
                {t(question.text)}
              </h1>
              <p className="mt-2 text-[12.5px] text-[var(--text-muted)]">
                {t(UI.selectToContinue)}
              </p>

              <fieldset className="mt-5 space-y-2">
                <legend className="sr-only">{t(question.text)}</legend>
                {LEVEL_VALUES.map((level) => {
                  const selected = state.answers[question.id] === level;
                  return (
                    <label
                      key={level}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={level}
                        checked={selected}
                        onChange={() => choose(level)}
                        className="sr-only"
                      />
                      <span
                        className="tnum mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                        style={{
                          background: selected
                            ? `var(--level-${level})`
                            : "var(--surface-2)",
                          color: selected
                            ? `var(--level-${level}-ink)`
                            : "var(--text-muted)",
                        }}
                        aria-hidden="true"
                      >
                        {level}
                      </span>
                      <span className="text-[13.5px] leading-relaxed">
                        {t(question.anchors[level])}
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setOverride(
                      index === 0
                        ? { step: "context", index: 0 }
                        : { step: "questions", index: index - 1 },
                    )
                  }
                  className="rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-2)]"
                >
                  ← {t(UI.back)}
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-lg bg-[var(--surface-2)] px-4 py-2 text-[13px] font-semibold transition hover:bg-[var(--border)]"
                >
                  {index + 1 >= questions.length
                    ? t(UI.next)
                    : `${t(UI.next)} →`}
                </button>
              </div>
            </div>
          </>
        ) : null}

        {step === "ambition" ? (
          <AmbitionStep
            ambition={state.ambition}
            targets={state.targets}
            onAmbition={setAmbition}
            onTarget={setTarget}
            unanswered={questions.length - answeredCount}
            onBack={() =>
              setOverride({ step: "questions", index: questions.length - 1 })
            }
            onJumpToUnanswered={() => {
              const gap = questionIds.findIndex((id) => !state.answers[id]);
              if (gap !== -1) setOverride({ step: "questions", index: gap });
            }}
            onFinish={() => router.push("/results")}
            t={t}
            locale={locale}
          />
        ) : null}
      </main>
    </>
  );
}

/* ------------------------------------------------------------------ steps */

function ProgressBar({
  answered,
  total,
  index,
  labels,
}: {
  answered: number;
  total: number;
  index: number;
  labels: { question: string; of: string; answered: string };
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-[11.5px] text-[var(--text-muted)]">
        <span className="tnum font-medium">
          {labels.question} {index + 1} {labels.of} {total}
        </span>
        <span className="tnum">
          {answered}/{total} {labels.answered}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]"
        role="progressbar"
        aria-valuenow={answered}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${(answered / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

interface ContextLabels {
  title: string;
  lead: string;
  name: string;
  namePlaceholder: string;
  industry: string;
  size: string;
  assessor: string;
  assessorPlaceholder: string;
  next: string;
  skip: string;
}

function ContextStep({
  values,
  onChange,
  onContinue,
  labels,
  industries,
  sizes,
}: {
  values: CompanyContext;
  onChange: (patch: Partial<CompanyContext>) => void;
  onContinue: () => void;
  labels: ContextLabels;
  industries: string[];
  sizes: string[];
}) {
  const field =
    "mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2.5 text-[13.5px] outline-none transition focus:border-[var(--accent)]";

  return (
    <form
      className="rise"
      onSubmit={(event) => {
        event.preventDefault();
        onContinue();
      }}
    >
      <h1 className="text-[22px] font-semibold tracking-tight">
        {labels.title}
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
        {labels.lead}
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">
            {labels.name}
          </span>
          <input
            className={field}
            value={values.name}
            placeholder={labels.namePlaceholder}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">
              {labels.industry}
            </span>
            <select
              className={field}
              value={values.industry}
              onChange={(event) => onChange({ industry: event.target.value })}
            >
              <option value="">—</option>
              {industries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">
              {labels.size}
            </span>
            <select
              className={field}
              value={values.size}
              onChange={(event) => onChange({ size: event.target.value })}
            >
              <option value="">—</option>
              {sizes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">
            {labels.assessor}
          </span>
          <input
            className={field}
            value={values.assessor}
            placeholder={labels.assessorPlaceholder}
            onChange={(event) => onChange({ assessor: event.target.value })}
          />
        </label>
      </div>

      <div className="mt-7 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)]"
        >
          {labels.next} →
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg px-3 py-2.5 text-[13px] font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          {labels.skip}
        </button>
      </div>
    </form>
  );
}

interface AmbitionStepProps {
  ambition: AmbitionId;
  targets: Targets;
  onAmbition: (id: AmbitionId) => void;
  onTarget: (dimension: DimensionId, level: Level) => void;
  unanswered: number;
  onBack: () => void;
  onJumpToUnanswered: () => void;
  onFinish: () => void;
  t: (value: L) => string;
  locale: Locale;
}

function AmbitionStep({
  ambition,
  targets,
  onAmbition,
  onTarget,
  unanswered,
  onBack,
  onJumpToUnanswered,
  onFinish,
  t,
  locale,
}: AmbitionStepProps) {
  const [custom, setCustom] = useState(false);

  return (
    <div className="rise">
      <h1 className="text-[22px] font-semibold tracking-tight">
        {t(UI.ambitionTitle)}
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
        {t(UI.ambitionLead)}
      </p>

      <div className="mt-5 space-y-2">
        {AMBITIONS.map((item) => {
          const selected = ambition === item.id;
          return (
            <label
              key={item.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-strong)]"
              }`}
            >
              <input
                type="radio"
                name="ambition"
                checked={selected}
                onChange={() => onAmbition(item.id)}
                className="sr-only"
              />
              <span
                className="tnum mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                style={{
                  background: `var(--level-${item.targetLevel})`,
                  color: `var(--level-${item.targetLevel}-ink)`,
                }}
                aria-hidden="true"
              >
                {item.targetLevel}
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold">
                  {t(item.name)}
                </span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-[var(--text-secondary)]">
                  {t(item.description)}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setCustom((value) => !value)}
        className="mt-4 text-[12.5px] font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        aria-expanded={custom}
      >
        {t(UI.customTargets)} {custom ? "▴" : "▾"}
      </button>

      {custom ? (
        <ul className="mt-3 space-y-2">
          {DIMENSIONS.map((dimension) => (
            <li
              key={dimension.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2"
            >
              <span className="text-[12.5px] font-medium">
                {t(dimension.name)}
              </span>
              <span className="flex gap-1">
                {LEVEL_VALUES.map((level) => {
                  const active = targets[dimension.id] === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onTarget(dimension.id, level)}
                      aria-label={`${t(dimension.name)} — ${t(UI.target)} ${level}`}
                      aria-pressed={active}
                      className="tnum h-6 w-6 rounded text-[11px] font-bold transition"
                      style={{
                        background: active
                          ? `var(--level-${level})`
                          : "var(--surface-2)",
                        color: active
                          ? `var(--level-${level}-ink)`
                          : "var(--text-muted)",
                      }}
                    >
                      {level}
                    </button>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {unanswered > 0 ? (
        <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3.5">
          <p className="text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
            {t(UI.unansweredWarning)}
          </p>
          <button
            type="button"
            onClick={onJumpToUnanswered}
            className="mt-2 text-[12.5px] font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            {t(UI.jumpToUnanswered)} ({unanswered})
          </button>
        </div>
      ) : null}

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-2)]"
        >
          ← {t(UI.back)}
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)]"
        >
          {t(UI.finish)} →
        </button>
      </div>

      <p className="mt-4 text-[11px] text-[var(--text-muted)]">
        {locale === "es"
          ? "Puedes cambiar el objetivo después sin repetir el cuestionario."
          : "You can change the target later without redoing the questionnaire."}
      </p>
    </div>
  );
}
