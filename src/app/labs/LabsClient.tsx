"use client";

import { useApp } from "@/components/AppProvider";
import { LABS } from "@/lib/i18nLabs";
import type { L } from "@/lib/framework";

interface Lab {
  href: string;
  title: L;
  description: L;
  /** Small monogram shown on the card — kept to two letters, no external icon set. */
  mark: string;
}

const labs: Lab[] = [
  { href: "/labs/rag-simulator/", title: LABS.ragTitle, description: LABS.ragDesc, mark: "RG" },
  { href: "/labs/agent-governance/", title: LABS.governanceTitle, description: LABS.governanceDesc, mark: "AG" },
  { href: "/labs/agentic-stack/", title: LABS.stackTitle, description: LABS.stackDesc, mark: "AS" },
];

function LabCard({ lab }: { lab: Lab }) {
  const { t } = useApp();
  return (
    <a
      href={lab.href}
      target="_blank"
      rel="noreferrer"
      className="card group flex flex-col gap-4 p-6 transition hover:ring-1 hover:ring-[var(--accent)]"
    >
      <div className="flex items-center justify-between">
        <span
          className="tnum flex h-10 w-10 items-center justify-center rounded-lg bg-clip-text text-sm font-bold text-transparent"
          style={{ backgroundImage: "var(--brand-gradient)" }}
          aria-hidden="true"
        >
          {lab.mark}
        </span>
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4 text-[var(--text-muted)] transition group-hover:text-[var(--cyan)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 3h7v7M13 3 3 13" />
        </svg>
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{t(lab.title)}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          {t(lab.description)}
        </p>
      </div>
      <span className="mt-auto flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--cyan)]">
        {t(LABS.openLab)}
        <span className="text-[var(--text-muted)]">— {t(LABS.newTab)}</span>
      </span>
    </a>
  );
}

export function LabsClient() {
  const { t } = useApp();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16">
      <section className="mt-12">
        <span className="rounded-full bg-[var(--cyan)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--cyan)]">
          {t(LABS.navLabel)}
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {t(LABS.title)}
        </h1>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
          {t(LABS.lead)}
        </p>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => (
          <LabCard key={lab.href} lab={lab} />
        ))}
      </section>

      <p className="mt-10 text-[12px] text-[var(--text-muted)]">{t(LABS.footnote)}</p>
    </main>
  );
}
