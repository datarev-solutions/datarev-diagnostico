import Stripe from "stripe";
import { TIERS, type TierId } from "./tiers";

/**
 * STRIPE CLIENT AND PRICE RESOLUTION
 * ==================================
 * The one place that reads Stripe credentials. Three rules shape this file:
 *
 *   1. NOTHING THROWS AT MODULE LOAD. A missing key must break the payment
 *      routes at call time and nothing else. Constructing the client eagerly
 *      would make `next build` — which imports every route module — fail on a
 *      preview deploy that has no Stripe keys, taking the whole site down over
 *      a feature nobody has turned on yet.
 *
 *   2. PRICES LIVE IN STRIPE. `tiers.ts` names an env var per paid tier; this
 *      file resolves it. No amount is ever hard-coded here, so a price change
 *      is a dashboard edit, and a stale number can never sit next to a live
 *      checkout button.
 *
 *   3. CAPABILITY DETECTION, NOT DEAD BUTTONS. `stripeConfigured()` mirrors
 *      what `googleEnabled` does for OAuth in SessionProvider: the UI asks
 *      whether payments exist before drawing a button, because a buy button
 *      that dead-ends costs more than no buy button at all.
 */

/**
 * Pinned deliberately rather than left to the SDK default: an `npm update` that
 * bumps stripe-node would otherwise silently move us to a new API version and
 * change response shapes under a running paywall.
 */
const API_VERSION = "2026-07-29.dahlia";

/**
 * Memoised per key. Keeping the key alongside the instance means a changed
 * secret (tests stubbing env, a rotated key in dev) rebuilds the client instead
 * of handing back one authenticated with the old credential.
 */
let cached: { key: string; client: Stripe } | null = null;

/** Are Stripe credentials present at all? Safe to expose as a boolean. */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * The Stripe client, or null when unconfigured.
 *
 * Returning null rather than throwing is what makes the 503 path impossible to
 * forget: TypeScript refuses to let a route touch the client without first
 * handling the null, and that null check is exactly the "payments are off"
 * branch.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  if (cached?.key === key) return cached.client;

  const client = new Stripe(key, {
    apiVersion: API_VERSION,
    // Retries make a transient network blip look like success instead of a
    // customer staring at a failed checkout. Safe because stripe-node attaches
    // idempotency keys to the retried request.
    maxNetworkRetries: 2,
    typescript: true,
  });

  cached = { key, client };
  return client;
}

/**
 * The Stripe price id configured for a tier, or null when there is nothing to
 * sell — either the tier is free, or its env var is unset in this environment.
 *
 * The dynamic `process.env[...]` lookup is fine precisely because these are
 * server-only vars: Next inlines `NEXT_PUBLIC_*` at build time (which would
 * break dynamic access), but everything else is read from the real environment
 * at runtime in the Node runtime.
 */
export function priceIdFor(tier: TierId): string | null {
  const envVar = TIERS[tier].priceEnvVar;
  if (!envVar) return null;

  // Trimmed because a price id pasted into a dashboard env field regularly
  // arrives with a trailing newline, and Stripe would reject it as unknown.
  const priceId = process.env[envVar]?.trim();
  return priceId ? priceId : null;
}

/** Tiers that can actually be bought — everything with a price env var. */
export function isPaidTier(tier: string): tier is Exclude<TierId, "free"> {
  return tier in TIERS && Boolean(TIERS[tier as TierId].priceEnvVar);
}
