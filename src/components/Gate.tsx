"use client";

import type { ReactNode } from "react";
import type { L, Locale } from "@/lib/framework";
import {
  formatTeaserNumber,
  isGated,
  lockedAnnouncement,
  teaserWidthCh,
  upgradeTarget,
} from "@/lib/gateHelpers";
import { CAPABILITY_COPY, TIERS_COPY } from "@/lib/i18nTiers";
import { can, TIERS, type Capability, type TierId } from "@/lib/tiers";
import { cn } from "@/lib/utils";
import { useApp } from "./AppProvider";

/**
 * PAYWALL PRIMITIVES — PLACEHOLDERS, NEVER MASKS
 * ==============================================
 * Read this before "improving" anything below into a blur.
 *
 * A CSS blur, a grey overlay, an opacity of 0.1, a `filter: blur(6px)` — none
 * of those are protection. The value is still in the DOM: right-click,
 * Inspect, read it. Ten seconds. And the audience this paywall exists to stop
 * is a competing consultancy pricing the same deal, i.e. people who know what
 * developer tools are. A masked number is a number we gave away with extra
 * steps.
 *
 * So the rule these components enforce:
 *
 *   THEY NEVER RECEIVE A REAL VALUE AND HIDE IT.
 *
 * The gated figure arrives already `null` from the server (`redactFor` in
 * `lib/tiers.ts` — the server strips it on the way out). What is rendered here
 * is a PLACEHOLDER built from things that were never secret in the first
 * place: the layout, the row count, the category labels, the unit. The visitor
 * sees the shape of the answer, which is what makes the offer legible, and the
 * answer stays on the server, which is what makes it worth paying for.
 *
 * Consequences, all deliberate:
 *   - `TeaserValue` takes `number | null` and treats `null` as gated. It has
 *     no branch that receives a real value it is supposed to conceal.
 *   - Nothing here calls `redactFor`. Redaction is a server job; doing it in
 *     the browser would mean the value was already in the browser.
 *   - `can()` is used to choose what to RENDER, never as the enforcement
 *     boundary. A client that lies about its tier gets a nicer-looking page
 *     with the same nulls in it.
 *
 * If you are here because the placeholder "looks unfinished" next to the real
 * numbers: that is the product. Make it prettier, do not make it transparent.
 */

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ Gated */

export interface GatedProps {
  /** What the children require. */
  capability: Capability;
  /** The visitor's tier, as resolved by the server. */
  tier: TierId;
  /** Shown instead of the children. Defaults to an `<UpgradePrompt>`. */
  fallback?: ReactNode;
  /**
   * Forwarded to the default fallback. Ignored when `fallback` is given —
   * wire the callback into your own fallback in that case.
   */
  onUpgrade?: (target: TierId) => void;
  children: ReactNode;
}

/**
 * Renders `children` when the tier grants the capability, the fallback
 * otherwise.
 *
 * This is a rendering decision, not a security boundary: use it for whole
 * blocks whose content is not secret (a chart's controls, an export button).
 * For an individual figure use `TeaserValue`, which cannot be handed a real
 * value in the first place.
 */
export function Gated({
  capability,
  tier,
  fallback,
  onUpgrade,
  children,
}: GatedProps) {
  if (can(tier, capability)) return <>{children}</>;
  return (
    <>
      {fallback ?? (
        <UpgradePrompt
          capability={capability}
          tier={tier}
          onUpgrade={onUpgrade}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------- TeaserValue */

export interface TeaserValueProps {
  /**
   * The figure, or `null` when the server redacted it. `null` always renders
   * the placeholder, even for an entitled tier — a null means the number was
   * never sent, and printing "NaN USD" is worse than printing nothing.
   */
  value: number | null;
  /** The visitor's tier, as resolved by the server. */
  tier: TierId;
  /** What seeing this figure requires. */
  capability: Capability;
  /** Unit shown next to the figure, locked or not — e.g. `USD / mes`. */
  unit?: L;
  /**
   * Approximate width of the hidden figure, in characters. Keeps the layout
   * from jumping when the visitor pays. Deliberately approximate: see
   * `teaserWidthCh`.
   */
  width?: number;
  /** Override the default locale-aware number formatting. */
  format?: (value: number, locale: Locale) => string;
  className?: string;
}

/**
 * A figure, or the space where a figure would be.
 *
 * Locked, it renders a neutral block roughly the width of the answer with the
 * unit still legible next to it — "••• USD / mes" tells a buyer this is a
 * monthly cost in dollars, which is the part that sells, without telling them
 * which monthly cost.
 */
export function TeaserValue({
  value,
  tier,
  capability,
  unit,
  width,
  format = formatTeaserNumber,
  className,
}: TeaserValueProps) {
  const { t, locale } = useApp();

  // The `value !== null` half is redundant with isGated — it is there so the
  // compiler narrows without a cast, and so a future edit to isGated cannot
  // make this branch print "null".
  if (!isGated(tier, capability, value) && value !== null) {
    return (
      <span className={cn("inline-flex items-baseline gap-1.5", className)}>
        <span className="tabular-nums">{format(value, locale)}</span>
        {unit ? (
          <span className="text-[0.8em] text-[var(--text-muted)]">
            {t(unit)}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      {/* aria-hidden: a screen reader must not read the glyphs as digits. The
          real message is the sr-only span below. The animation is a 2s opacity
          breath, not a sweep — a flashing block next to real numbers reads as
          a loading state, and this is not loading, it is not for sale here.
          The global prefers-reduced-motion block in globals.css already stops
          it; motion-reduce is belt and braces. */}
      <span
        aria-hidden="true"
        style={{ minWidth: `${teaserWidthCh(width)}ch` }}
        className="inline-flex h-[1.15em] translate-y-[0.08em] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1.5 text-[0.7em] tracking-[0.2em] text-[var(--text-muted)] animate-pulse motion-reduce:animate-none"
      >
        •••
      </span>
      {unit ? (
        <span aria-hidden="true" className="text-[0.8em] text-[var(--text-muted)]">
          {t(unit)}
        </span>
      ) : null}
      <span className="sr-only">
        {lockedAnnouncement(capability, locale, unit)}
      </span>
    </span>
  );
}

/* ----------------------------------------------------------- UpgradePrompt */

export interface UpgradePromptProps {
  /** What is locked. */
  capability: Capability;
  /** The visitor's tier, as resolved by the server. */
  tier: TierId;
  /**
   * Called with the tier that unlocks the capability. No route is hard-coded
   * here: checkout, pricing page or a modal are the caller's decision.
   * Without it no primary button is rendered — a dead button is worse copy
   * than no button.
   */
  onUpgrade?: (target: TierId) => void;
  /** Secondary action, e.g. open the pricing page. Optional, same reasoning. */
  onSeePlans?: (target: TierId) => void;
  className?: string;
}

/**
 * A small inline card: what is locked, which tier unlocks it, and why that
 * tier exists. Renders nothing when the visitor already has the capability, so
 * it is safe to leave mounted while the tier resolves.
 */
export function UpgradePrompt({
  capability,
  tier,
  onUpgrade,
  onSeePlans,
  className,
}: UpgradePromptProps) {
  const { t } = useApp();
  const target = upgradeTarget(tier, capability);

  // Already entitled, or nothing sells this. Either way there is no offer to
  // make and an upgrade card would just be noise.
  if (!target) return null;
  const plan = TIERS[target];

  return (
    <div
      className={cn(
        "no-print rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
        <LockIcon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {t(TIERS_COPY.locked)}
        </span>
      </div>

      <p className="mt-2 text-[13px] font-semibold text-[var(--text-primary)]">
        {t(CAPABILITY_COPY[capability])}
      </p>

      <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
        {t(TIERS_COPY.unlockWith)}{" "}
        <span className="font-semibold text-[var(--cyan)]">{t(plan.name)}</span>
      </p>

      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {t(TIERS_COPY.whatYouGet)}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
        {t(plan.pitch)}
      </p>

      {/* The honest line. It stays even when it costs a conversion: a buyer who
          learns after paying that the number was in the page all along is a
          refund and a review. */}
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        {t(TIERS_COPY.hiddenUntilPurchase)}
      </p>

      {onUpgrade || onSeePlans ? (
        <div className="mt-3.5 flex flex-wrap items-center gap-3">
          {onUpgrade ? (
            <button
              type="button"
              onClick={() => onUpgrade(target)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              <LockIcon className="h-3.5 w-3.5" />
              {t(TIERS_COPY.upgrade)} · {t(plan.name)}
            </button>
          ) : null}
          {onSeePlans ? (
            <button
              type="button"
              onClick={() => onSeePlans(target)}
              className="text-[12.5px] font-medium text-[var(--text-secondary)] underline-offset-4 transition hover:text-[var(--cyan)] hover:underline"
            >
              {t(TIERS_COPY.seeWhatYouGet)}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
