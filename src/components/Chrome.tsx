"use client";

import Image from "next/image";
import Link from "next/link";
import { DATAREV } from "@/lib/datarev";
import { UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { AccountChip } from "./AccountChip";

/**
 * DataRev wordmark. Two files rather than one recoloured asset: the supplied
 * colour logo fades to white on its left edge, which vanishes on paper, and the
 * white logo vanishes on the light print surface. Each is shown where it reads.
 *
 * Never render this below 48px tall. The lockup stacks a thin-stroke "DATA
 * REVOLUTION" under the monogram, and under ~48px that line antialiases into a
 * grey smear — verified in the browser at 32/40/48/56px.
 */
export function DataRevLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Image
        src="/brand/datarev-logo-white.png"
        alt={DATAREV.fullName}
        width={640}
        height={454}
        sizes="120px"
        priority
        className="brand-logo-dark h-full w-auto"
      />
      {/* `priority` on the light copy too, deliberately. It sits at
          display:none on the dark screen, and Next/Image's lazy path uses an
          IntersectionObserver that never fires for a hidden element — so
          without this the print logo is still unloaded when the PDF renders
          and the report goes out with a blank masthead. */}
      <Image
        src="/brand/datarev-logo.png"
        alt=""
        aria-hidden="true"
        width={640}
        height={454}
        sizes="120px"
        priority
        className="brand-logo-light h-full w-auto"
      />
    </span>
  );
}

export function LanguageToggle() {
  const { locale, setLocale, t } = useApp();

  return (
    <div
      className="no-print inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] p-0.5"
      role="group"
      aria-label={t(UI.language)}
    >
      {(["es", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              active
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

export function Header() {
  const { t } = useApp();

  return (
    <header className="no-print sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface-0)]/85 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-3">
          <DataRevLogo className="h-12" />
          <span className="hidden border-l border-[var(--border)] pl-3 text-[13px] font-medium text-[var(--text-secondary)] sm:inline">
            {t(UI.appName)}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <AccountChip />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useApp();
  return (
    <footer className="no-print mt-20 border-t border-[var(--border)] py-8">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <DataRevLogo className="h-14" />
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[var(--text-secondary)]">
            <li>
              <a
                href={DATAREV.site}
                className="transition hover:text-[var(--cyan)]"
              >
                datarev.solutions
              </a>
            </li>
            <li>
              <a
                href={`mailto:${DATAREV.email}`}
                className="transition hover:text-[var(--cyan)]"
              >
                {DATAREV.email}
              </a>
            </li>
            <li>
              <a
                href={DATAREV.phoneHref}
                className="transition hover:text-[var(--cyan)]"
              >
                {DATAREV.phone}
              </a>
            </li>
          </ul>
        </div>
        <div className="mt-6 space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
          <p className="max-w-3xl">{t(UI.frameworkNote)}</p>
          <p className="max-w-3xl">{t(UI.frameworkDisclaimer)}</p>
          <p>
            © {new Date().getFullYear()} {DATAREV.fullName}
          </p>
        </div>
      </div>
    </footer>
  );
}
