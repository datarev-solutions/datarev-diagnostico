import { getTier } from "@/lib/entitlement";
import { CalculatorClient } from "./CalculatorClient";

/**
 * Server shell. Its only job is to resolve who is asking before any figure is
 * rendered — the entitlement check cannot live in the client component,
 * because anything the browser decides the browser can also be told to skip.
 *
 * Dynamic because the answer is per-visitor: a cached render would show a
 * paying customer's calculator to the next person through the door.
 */
export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  const tier = await getTier();
  return <CalculatorClient tier={tier} />;
}
