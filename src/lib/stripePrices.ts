import "server-only";
import { getStripe, priceIdFor } from "./stripe";
import { TIER_ORDER, TIERS, type TierId } from "./tiers";

/**
 * DISPLAY PRICES COME FROM STRIPE, NOT FROM THIS CODEBASE
 * =======================================================
 * Deliberately no price constants anywhere in the repo. A number written here
 * would be the number on the pricing page, while the number actually charged
 * lives in Stripe — and the day someone edits one and not the other, the site
 * advertises a price it does not honour. That is a refund conversation at best
 * and a consumer-protection problem at worst.
 *
 * So the page asks Stripe what it charges. When Stripe is not configured yet,
 * this returns nulls and the UI shows the tier with no price and no button —
 * the same runtime-capability pattern the app already uses for Google sign-in,
 * where a dead control is worse than no control.
 */

export interface TierPrice {
  tier: TierId;
  /** Minor units, as Stripe stores them (MXN cents). Null when unconfigured. */
  amount: number | null;
  currency: string | null;
  /** Formatted for display in the visitor's locale. Null when unconfigured. */
  formatted: string | null;
}

function format(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

/**
 * Look up every tier's live price. Runs on the server only — the Stripe secret
 * key must never reach the browser.
 *
 * A failure to reach Stripe returns nulls rather than throwing: a pricing page
 * that renders without prices is recoverable, one that 500s loses the visitor.
 */
export async function getTierPrices(locale: string): Promise<TierPrice[]> {
  const stripe = getStripe();

  return Promise.all(
    TIER_ORDER.map(async (tier): Promise<TierPrice> => {
      const empty: TierPrice = { tier, amount: null, currency: null, formatted: null };
      if (!TIERS[tier].priceEnvVar) return empty; // the free tier
      const priceId = priceIdFor(tier);
      if (!stripe || !priceId) return empty;

      try {
        const price = await stripe.prices.retrieve(priceId);
        if (price.unit_amount == null) return empty;
        return {
          tier,
          amount: price.unit_amount,
          currency: price.currency,
          formatted: format(price.unit_amount, price.currency, locale),
        };
      } catch {
        // Wrong id, deleted price, network blip — all the same to the visitor.
        return empty;
      }
    }),
  );
}
