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
 * So the page asks Stripe what it charges, and falls back to the advertised
 * list price in tiers.ts when Stripe cannot answer. The fallback is flagged
 * with `isListPrice` so the UI can show the number but withhold the buy
 * button — a price a visitor can read is useful; a button that cannot take
 * their money is not.
 */

export interface TierPrice {
  tier: TierId;
  /** Minor units, as Stripe stores them (MXN centavos). */
  amount: number | null;
  currency: string | null;
  /** Formatted for display in the visitor's locale. */
  formatted: string | null;
  /** True when this is the advertised price and Stripe cannot yet charge it. */
  isListPrice: boolean;
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
      const spec = TIERS[tier];
      const none: TierPrice = {
        tier,
        amount: null,
        currency: null,
        formatted: null,
        isListPrice: false,
      };
      if (!spec.priceEnvVar) return none; // the free tier has no price at all

      // The advertised price, used whenever Stripe cannot answer.
      const list: TierPrice =
        spec.listPrice != null
          ? {
              tier,
              amount: spec.listPrice,
              currency: spec.listCurrency ?? "mxn",
              formatted: format(spec.listPrice, spec.listCurrency ?? "mxn", locale),
              isListPrice: true,
            }
          : none;

      const priceId = priceIdFor(tier);
      if (!stripe || !priceId) return list;

      try {
        const price = await stripe.prices.retrieve(priceId);
        if (price.unit_amount == null) return list;
        // Stripe wins: it is what actually charges the card.
        return {
          tier,
          amount: price.unit_amount,
          currency: price.currency,
          formatted: format(price.unit_amount, price.currency, locale),
          isListPrice: false,
        };
      } catch {
        // Wrong id, deleted price, network blip — fall back to the advertised
        // figure rather than showing a dash where a number belongs.
        return list;
      }
    }),
  );
}
