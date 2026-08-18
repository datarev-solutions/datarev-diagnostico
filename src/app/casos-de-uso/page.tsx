import { getTier } from "@/lib/entitlement";
import { UseCasesClient } from "./UseCasesClient";

/** Server shell — see the note in ../calculadora/page.tsx. */
export const dynamic = "force-dynamic";

export default async function UseCasesPage() {
  const tier = await getTier();
  return <UseCasesClient tier={tier} />;
}
