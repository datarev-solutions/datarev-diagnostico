import { afterEach, describe, expect, it, vi } from "vitest";
import { getStripe, isPaidTier, priceIdFor, stripeConfigured } from "./stripe";
import { TIER_ORDER, TIERS, type TierId } from "./tiers";

// Every case stubs its own environment. Nothing here touches the network: a
// Stripe client is constructed, but constructing one issues no request.
afterEach(() => {
  vi.unstubAllEnvs();
});

const PAID_TIERS = TIER_ORDER.filter((t) => t !== "free") as TierId[];

describe("priceIdFor", () => {
  it("resolves each paid tier from the env var named in the tier contract", () => {
    vi.stubEnv("STRIPE_PRICE_DIAGNOSTIC", "price_diagnostic_123");
    vi.stubEnv("STRIPE_PRICE_PLAN", "price_plan_456");
    vi.stubEnv("STRIPE_PRICE_GUIDED", "price_guided_789");

    expect(priceIdFor("diagnostic")).toBe("price_diagnostic_123");
    expect(priceIdFor("plan")).toBe("price_plan_456");
    expect(priceIdFor("guided")).toBe("price_guided_789");
  });

  it("reads the variable tiers.ts actually names, not a name guessed here", () => {
    // Guards the contract: if someone renames priceEnvVar, this catches it
    // instead of a checkout silently 503ing in production.
    for (const tier of PAID_TIERS) {
      const envVar = TIERS[tier].priceEnvVar as string;
      vi.stubEnv(envVar, `price_from_${envVar}`);
      expect(priceIdFor(tier), tier).toBe(`price_from_${envVar}`);
    }
  });

  it("returns null for the free tier, which has nothing to sell", () => {
    vi.stubEnv("STRIPE_PRICE_DIAGNOSTIC", "price_diagnostic_123");
    expect(priceIdFor("free")).toBeNull();
  });

  it("returns null when the variable is unset", () => {
    vi.stubEnv("STRIPE_PRICE_DIAGNOSTIC", undefined);
    vi.stubEnv("STRIPE_PRICE_PLAN", undefined);
    vi.stubEnv("STRIPE_PRICE_GUIDED", undefined);

    for (const tier of PAID_TIERS) expect(priceIdFor(tier), tier).toBeNull();
  });

  it("treats an empty or whitespace-only value as unset", () => {
    // A blank env var in a dashboard is a misconfiguration, not a price id —
    // passing "" to Stripe would produce a confusing 400 much later.
    vi.stubEnv("STRIPE_PRICE_PLAN", "");
    expect(priceIdFor("plan")).toBeNull();

    vi.stubEnv("STRIPE_PRICE_PLAN", "   ");
    expect(priceIdFor("plan")).toBeNull();
  });

  it("trims whitespace pasted around a real price id", () => {
    vi.stubEnv("STRIPE_PRICE_GUIDED", "  price_guided_789\n");
    expect(priceIdFor("guided")).toBe("price_guided_789");
  });
});

describe("stripeConfigured", () => {
  it("is false with no secret key, so the UI can hide payment buttons", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", undefined);
    expect(stripeConfigured()).toBe(false);
  });

  it("is true once the secret key is present", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_placeholder");
    expect(stripeConfigured()).toBe(true);
  });

  it("is false for an empty key", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    expect(stripeConfigured()).toBe(false);
  });
});

describe("getStripe", () => {
  it("returns null instead of throwing when unconfigured", () => {
    // The point of the whole lazy design: importing this module during a build
    // with no Stripe keys must not blow up.
    vi.stubEnv("STRIPE_SECRET_KEY", undefined);
    expect(getStripe()).toBeNull();
  });

  it("builds a client when configured and reuses it for the same key", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_placeholder");
    const first = getStripe();
    expect(first).not.toBeNull();
    expect(getStripe()).toBe(first);
  });

  it("rebuilds when the key changes, so a rotated key takes effect", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_one");
    const first = getStripe();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_two");
    expect(getStripe()).not.toBe(first);
  });
});

describe("isPaidTier", () => {
  it("accepts every tier with a price and rejects free", () => {
    for (const tier of PAID_TIERS) expect(isPaidTier(tier), tier).toBe(true);
    expect(isPaidTier("free")).toBe(false);
  });

  it("rejects anything that is not a tier at all", () => {
    // This is the guard standing between webhook metadata and a database write.
    expect(isPaidTier("enterprise")).toBe(false);
    expect(isPaidTier("")).toBe(false);
    expect(isPaidTier("constructor")).toBe(false);
  });
});
