import { createClient } from "./supabase/server";
import { can, tierFor, TIER_ORDER, type Capability, type TierId } from "./tiers";

/**
 * ENTITLEMENT — the server side of the paywall.
 * ============================================
 * Everything in this file runs on the server, and that is the whole point.
 *
 * The audience this paywall exists to stop is technical: another consultancy
 * that wants the model, not a casual visitor. Against that audience a
 * client-side check is theatre. A `useTier()` hook returns a value the browser
 * already holds, so anyone can set it; a CSS blur over a real number is a
 * decoration painted on top of text that is sitting in the DOM, readable in
 * ten seconds with devtools and in one second with `curl`. Even the honest
 * version — server decides, client renders — leaks if the gated value was
 * serialised into the page "for later".
 *
 * So the rule is: the tier is resolved here, from the session cookie and the
 * database, and gated values are never put into the response at all. See
 * `redactFor` in ./tiers for the other half of that rule.
 *
 * Nothing here throws for infrastructure reasons. `getTier` degrades to "free"
 * on any failure, because the alternative — an unhandled rejection during
 * render — turns a Supabase hiccup into a 500 on pages that a free user is
 * entitled to see anyway. Failing closed on entitlement while staying open on
 * availability is the only combination that is both safe and usable.
 */

/** Thrown by `assertCapability`, so a route handler can answer 402 vs 500. */
export class CapabilityError extends Error {
  readonly capability: Capability;
  readonly tier: TierId;
  /** Cheapest tier that would unlock it — what the upgrade prompt should offer. */
  readonly requiredTier: TierId | null;

  constructor(capability: Capability, tier: TierId) {
    super(`Capability "${capability}" is not included in the "${tier}" tier`);
    this.name = "CapabilityError";
    this.capability = capability;
    this.tier = tier;
    this.requiredTier = tierFor(capability);
  }
}

/** Narrowing helper for `catch (error: unknown)` blocks in route handlers. */
export function isCapabilityError(error: unknown): error is CapabilityError {
  return error instanceof CapabilityError;
}

/**
 * The `tier` column is `text` with a check constraint, but a check constraint
 * lives in the database and this code has to survive being wrong about it —
 * an added tier, a migration that has not run yet. Anything unrecognised is
 * treated as no entitlement rather than trusted into the capability lookup,
 * where an unknown key would throw on `TIERS[tier]`.
 */
function toTierId(value: unknown): TierId {
  return typeof value === "string" && (TIER_ORDER as readonly string[]).includes(value)
    ? (value as TierId)
    : "free";
}

/**
 * The visitor's current tier. "free" covers three different situations —
 * logged out, signed in without a subscription, and database unreachable —
 * on purpose: none of them is evidence that anything was paid for.
 *
 * The status filter is applied in the query rather than in JavaScript so that
 * a canceled or past_due row can never reach the code that maps it to a tier.
 */
export async function getTier(): Promise<TierId> {
  try {
    const supabase = await createClient();

    // getUser() revalidates the token with Supabase Auth instead of trusting
    // the cookie's contents, which matters here: this is the identity the
    // entire paywall hangs from.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "free";

    const { data, error } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (error || !data) return "free";
    return toTierId((data as { tier?: unknown }).tier);
  } catch {
    // Network blip, expired refresh token, paused project. The visitor still
    // gets the free experience instead of an error page.
    return "free";
  }
}

/**
 * Decision plus context, for render paths that need to show *something* when
 * the answer is no — an upgrade card, a redacted table — rather than 402.
 */
export async function requireCapability(
  cap: Capability,
): Promise<{ tier: TierId; allowed: boolean }> {
  const tier = await getTier();
  return { tier, allowed: can(tier, cap) };
}

/**
 * Same decision, as a guard clause. For route handlers that produce gated data
 * and have nothing partial to return: let it throw, catch `CapabilityError` at
 * the boundary and answer 402 with `requiredTier`.
 */
export async function assertCapability(cap: Capability): Promise<TierId> {
  const { tier, allowed } = await requireCapability(cap);
  if (!allowed) throw new CapabilityError(cap, tier);
  return tier;
}
