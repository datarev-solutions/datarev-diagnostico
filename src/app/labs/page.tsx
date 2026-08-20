"use client";

import { Footer, Header } from "@/components/Chrome";
import { LabsClient } from "./LabsClient";

/**
 * Free, ungated showcase — no entitlement check needed. Unlike /calculadora
 * and /casos-de-uso, these are demonstrations of DataRev's engineering depth
 * meant to be shared and linked to, not something a paywall protects.
 */
export default function LabsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <LabsClient />
      <Footer />
    </div>
  );
}
