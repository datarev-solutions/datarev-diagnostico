"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BROCHURE, DATAREV } from "@/lib/datarev";
import { UI } from "@/lib/i18n";
import { CALC } from "@/lib/i18nCalc";
import { UC } from "@/lib/i18nUseCases";
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

/** Brochure download — points at the ES or EN deck to match the active locale. */
export function BrochureLink({ className = "" }: { className?: string }) {
  const { t, locale } = useApp();
  return (
    <a
      href={BROCHURE[locale]}
      download
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--text-secondary)] transition hover:text-[var(--cyan)] ${className}`}
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 2v8m0 0 3-3M8 10 5 7M3 13.5h10" />
      </svg>
      {t(UI.downloadBrochure)}
    </a>
  );
}

/** Top-level sections. Underlined when the route is active. */
function Nav() {
  const { t } = useApp();
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: t(UI.appName), match: (p: string) => p === "/" || p.startsWith("/assessment") || p.startsWith("/results") },
    { href: "/casos-de-uso", label: t(UC.navLabel), match: (p: string) => p.startsWith("/casos-de-uso") },
    { href: "/calculadora", label: t(CALC.navLabel), match: (p: string) => p.startsWith("/calculadora") },
  ];

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
              active
                ? "bg-[var(--surface-2)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface-0)]/85 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-3">
          <Link href="/">
            <DataRevLogo className="h-12" />
          </Link>
          <span className="hidden h-6 w-px bg-[var(--border)] sm:block" />
          <Nav />
        </div>
        <div className="flex items-center gap-3">
          <BrochureLink className="hidden lg:inline-flex" />
          <AccountChip />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t, locale } = useApp();
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
                {t(UI.visitSite)} · datarev.solutions
              </a>
            </li>
            <li>
              <a
                href={BROCHURE[locale]}
                download
                className="font-semibold transition hover:text-[var(--cyan)]"
              >
                {t(UI.downloadBrochure)}
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
