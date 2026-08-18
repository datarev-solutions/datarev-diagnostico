import { getTier } from "@/lib/entitlement";
import { getTierPrices } from "@/lib/stripePrices";
import { PricingTable } from "./PricingTable";

/**
 * Server component on purpose.
 *
 * Two things must not happen in the browser: reading the visitor's entitlement
 * (which decides what is for sale to them) and holding the Stripe secret key
 * used to look up what each tier actually costs. Both happen here, and only the
 * finished, safe values cross into the client component below.
 *
 * `force-dynamic` because the page is per-visitor: a cached render would show
 * one person's current plan to the next visitor.
 */
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  // Locale for currency formatting only. The visible copy is switched
  // client-side by AppProvider, which already owns the language toggle.
  const [tier, prices] = await Promise.all([getTier(), getTierPrices("es")]);

  return <PricingTable currentTier={tier} prices={prices} />;
}
