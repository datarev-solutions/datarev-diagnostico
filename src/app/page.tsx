"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../components/AppProvider";
import { Footer, Header } from "../components/Chrome";
import { ConsultCTA } from "../components/ConsultCTA";
import { HeroFuturistic } from "../components/ui/hero-futuristic";
import { BRAND_COPY, MARKET_STATS } from "../lib/datarev";
import { DIMENSIONS, LEVELS } from "../lib/framework";
import { SOURCE_LIST, UI } from "../lib/i18n";
import type { Mode } from "../lib/scoring";

function DimensionIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

interface ModeCardProps {
  mode: Mode;
  name: string;
  meta: string;
  description: string;
  featured: boolean;
  cta: string;
  onStart: (mode: Mode) => void;
}

function ModeCard({
  mode,
  name,
  meta,
  description,
  featured,
  cta,
  onStart,
}: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onStart(mode)}
      className={`card card-lit group flex h-full flex-col p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
        featured ? "ring-1 ring-[var(--accent)] glow-accent" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
        <span className="tnum shrink-0 text-[11px] font-medium text-[var(--text-muted)]">
          {meta}
        </span>
      </div>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
      <span
        className={`mt-5 inline-flex items-center gap-1.5 self-start rounded-lg px-4 py-2 text-[13px] font-semibold transition ${
          featured
            ? "bg-[var(--accent)] text-white group-hover:bg-[var(--accent-strong)]"
            : "bg-[var(--surface-2)] text-[var(--text-primary)] group-hover:bg-[var(--surface-3)]"
        }`}
      >
        {cta}
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { t, setMode, reset, hasProgress, hydrated } = useApp();

  function start(mode: Mode) {
    reset(mode);
    setMode(mode);
    router.push("/assessment");
  }

  return (
    <>
      <Header />

      <HeroFuturistic
        title={t(UI.heroTitle)}
        subtitle={t(UI.heroLead)}
        scrollLabel={t(UI.scrollToExplore)}
        scrollTargetId="modes"
        eyebrow={
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
            <span className="text-[11px] font-medium text-white/70">
              {t(UI.heroBadge)}
            </span>
          </span>
        }
      >
        {/* Sends the visitor to the Express/Complete picker rather than
            starting a mode for them — and starting one here would also wipe
            any assessment already in progress without asking.
            An anchor, so it still works with JS disabled and degrades to a
            jump wherever smooth scrolling is unavailable. */}
        <a
          href="#modes"
          className="glow-accent rounded-lg bg-[var(--accent)] px-6 py-3 text-[13.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)]"
        >
          {t(UI.startNow)} →
        </a>
        <a
          href="#dimensions"
          className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-[13.5px] font-semibold text-white/85 backdrop-blur transition hover:bg-white/10 hover:text-white"
        >
          {t(UI.seeFramework)}
        </a>
      </HeroFuturistic>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-b border-[var(--border)] py-6 text-[12.5px] text-[var(--text-muted)]">
          <li>{t(UI.eightDimensions)}</li>
          <li aria-hidden="true">·</li>
          <li>{t(UI.fiveLevels)}</li>
          <li aria-hidden="true">·</li>
          <li>{t(UI.freeNoCost)}</li>
        </ul>

        {/* Why this matters — DataRev's three numbers, same as every deck. */}
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {MARKET_STATS.map((stat) => (
            <div key={stat.value} className="card p-5">
              {/* backgroundImage via style, not a Tailwind bg-[] arbitrary
                  value: that compiles to background-color, where a gradient is
                  invalid — the number renders transparent over nothing. */}
              <p
                className="tnum bg-clip-text text-3xl font-bold tracking-tight text-transparent"
                style={{ backgroundImage: "var(--brand-gradient)" }}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                {t(stat.claim)}
              </p>
              <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                {stat.source}
              </p>
            </div>
          ))}
        </section>
        <p className="mt-4 text-center text-[13.5px] font-medium text-[var(--text-secondary)]">
          {t(BRAND_COPY.positioning)}
        </p>

        <section id="modes" className="mt-14 scroll-mt-24">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t(UI.chooseMode)}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ModeCard
              mode="express"
              name={t(UI.expressName)}
              meta={t(UI.expressMeta)}
              description={t(UI.expressDesc)}
              featured={false}
              cta={t(UI.start)}
              onStart={start}
            />
            <ModeCard
              mode="full"
              name={t(UI.fullName)}
              meta={t(UI.fullMeta)}
              description={t(UI.fullDesc)}
              featured
              cta={t(UI.start)}
              onStart={start}
            />
          </div>

          {hydrated && hasProgress ? (
            <p className="mt-4 text-[13px]">
              <Link
                href="/assessment"
                className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
              >
                {t(UI.resumeAssessment)}
              </Link>
            </p>
          ) : null}

          {/* The alternative to answering 40 questions alone. */}
          <div className="mt-4">
            <ConsultCTA kind="guided_full" variant="panel" />
          </div>
        </section>

        <section id="dimensions" className="mt-16 scroll-mt-24">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t(UI.dimensions)}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DIMENSIONS.map((dimension) => (
              <div
                key={dimension.id}
                className="card card-lit p-4 transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[var(--cyan)]">
                    <DimensionIcon path={dimension.iconPath} />
                  </span>
                  <span className="tnum text-[11px] font-semibold text-[var(--text-muted)]">
                    {Math.round(dimension.weight * 100)}%
                  </span>
                </div>
                <h3 className="mt-2.5 text-[13px] font-semibold leading-snug">
                  {t(dimension.name)}
                </h3>
                <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--text-muted)]">
                  {t(dimension.description)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t(UI.fiveLevels)}
            </h2>
            <ol className="space-y-2">
              {LEVELS.map((level) => (
                <li key={level.level} className="card flex gap-3.5 p-3.5">
                  <span
                    className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-bold"
                    style={{
                      background: `var(--level-${level.level})`,
                      color: `var(--level-${level.level}-ink)`,
                    }}
                  >
                    {level.level}
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold">
                      {t(level.name)}
                    </h3>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
                      {t(level.summary)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t(UI.sources)}
            </h2>
            <ul className="card divide-y divide-[var(--border)] p-1">
              {SOURCE_LIST.map((source) => (
                <li
                  key={source}
                  className="px-3.5 py-2.5 text-[12px] leading-snug text-[var(--text-secondary)]"
                >
                  {source}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
              {t(BRAND_COPY.promise)}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
