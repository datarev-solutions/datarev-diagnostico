import type { L, Locale } from "./framework";
import { t } from "./i18n";
import { TIERS_COPY } from "./i18nTiers";
import { can, TIERS, tierFor, type Capability, type TierId } from "./tiers";

/**
 * The pure half of the paywall UI. Everything here is a function of its
 * arguments so the rules that decide whether a number is shown can be tested
 * without a DOM — the components in `Gate.tsx` only do layout.
 */

/**
 * Should this value be shown as a placeholder?
 *
 * Two independent reasons, and BOTH must be respected:
 *
 *   1. The tier does not grant the capability.
 *   2. The value arrived as `null` — which is what `redactFor` produces on the
 *      server. Even for an entitled user a null means the figure was never
 *      serialised, so rendering it would print "null" or "NaN" next to a
 *      currency symbol. Treat it as gated and show the placeholder instead.
 */
export function isGated(
  tier: TierId,
  capability: Capability,
  value: number | null,
): boolean {
  return value === null || !can(tier, capability);
}

/**
 * The tier the visitor has to reach to see this, or `null` when there is
 * nothing to sell them — either they already have it, or no tier grants it
 * (a capability that exists in the type but not in any tier's list).
 */
export function upgradeTarget(
  tier: TierId,
  capability: Capability,
): TierId | null {
  if (can(tier, capability)) return null;
  return tierFor(capability);
}

/** Character width of the placeholder block, clamped so layout cannot break. */
const MIN_TEASER_CH = 2;
const MAX_TEASER_CH = 24;
const DEFAULT_TEASER_CH = 5;

/**
 * How wide the placeholder should be, in characters.
 *
 * Approximate on purpose. The caller passes roughly the size of the figure it
 * would have shown so the layout does not jump when the user pays — but never
 * the exact digit count of the real number, because a placeholder that is
 * exactly as wide as the answer leaks its order of magnitude.
 */
export function teaserWidthCh(width?: number): number {
  if (width === undefined || !Number.isFinite(width)) return DEFAULT_TEASER_CH;
  return Math.min(MAX_TEASER_CH, Math.max(MIN_TEASER_CH, Math.round(width)));
}

/**
 * What a screen reader hears where the figure would be. It must never read out
 * the placeholder glyphs as if they were a number: "bullet bullet bullet USD"
 * is worse than silence. It says the value is locked and what unlocks it.
 */
export function lockedAnnouncement(
  capability: Capability,
  locale: Locale,
  unit?: L,
): string {
  const head = unit
    ? `${t(TIERS_COPY.lockedValue, locale)} (${t(unit, locale)})`
    : t(TIERS_COPY.lockedValue, locale);
  const target = tierFor(capability);
  if (!target) return `${head}.`;
  return `${head}. ${t(TIERS_COPY.unlockWith, locale)} ${t(TIERS[target].name, locale)}.`;
}

/**
 * Default number formatting, matching the rest of the app: the locale toggle
 * is es/en but the number formats used across the calculator are es-MX/en-US.
 */
export function formatTeaserNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US").format(
    value,
  );
}
