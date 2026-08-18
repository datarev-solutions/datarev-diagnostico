"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Footer, Header } from "@/components/Chrome";
import { ConsultCTA } from "@/components/ConsultCTA";
import { CAPABILITY_COPY, TIERS_COPY } from "@/lib/i18nTiers";
import type { TierPrice } from "@/lib/stripePrices";
import { TIER_ORDER, TIERS, type Capability, type TierId } from "@/lib/tiers";

/**
 * The commercial surface.
 *
 * Prices arrive already resolved from Stripe and already formatted — this
 * component never computes one. If Stripe is not configured yet, `formatted`
 * is null and the tier renders with no price and no button rather than a dead
 * control, matching how the app already handles Google sign-in.
 */
export function PricingTable({
  currentTier,
  prices,
}: {
  currentTier: TierId;
  prices: TierPrice[];
}) {
  const { t } = useApp();
  const [busy, setBusy] = useState<TierId | null>(null);

  const priceOf = (tier: TierId) => prices.find((p) => p.tier === tier) ?? null;
  const anyPriceLive = prices.some((p) => p.formatted !== null);

  /** What this tier adds that the one before it did not — the reason to move up. */
  const newIn = (tier: TierId): Capability[] => {
    const i = TIER_ORDER.indexOf(tier);
    if (i <= 0) return TIERS[tier].capabilities;
    const previous = new Set(TIERS[TIER_ORDER[i - 1]].capabilities);
    return TIERS[tier].capabilities.filter((c) => !previous.has(c));
  };

  async function startCheckout(tier: TierId) {
    setBusy(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const json = (await res.json()) as { url?: string };
      if (json.url) {
        // assign() rather than setting location.href: the React compiler
        // treats the assignment as mutating a value defined outside the
        // component, and the method call expresses the same navigation.
        window.location.assign(json.url);
        return;
      }
    } catch {
      // Fall through: the button re-enables and the visitor can retry or
      // use the contact CTA below.
    }
    setBusy(null);
  }

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-10">
        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
            DataRev
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {t(TIERS_COPY.pricingTitle)}
          </h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
            {t(TIERS_COPY.pricingLead)}
          </p>
          <p className="mt-2 max-w-3xl border-l-2 border-[var(--border-strong)] pl-3 text-[12px] leading-relaxed text-[var(--text-muted)]">
            {t(TIERS_COPY.pricingCredit)}
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-4">
          {TIER_ORDER.map((id) => {
            const tier = TIERS[id];
            const price = priceOf(id);
            const isCurrent = id === currentTier;
            const sellable = price?.formatted !== null && price?.formatted !== undefined;

            return (
              <section
                key={id}
                className={`card card-lit avoid-break flex flex-col p-5 ${
                  isCurrent ? "ring-1 ring-[var(--cyan)]" : ""
                }`}
              >
                <div className="flex h-5 items-start justify-between gap-2">
                  <h2 className="text-[15px] font-semibold tracking-tight">{t(tier.name)}</h2>
                  {isCurrent ? (
                    <span className="shrink-0 rounded-full bg-[var(--cyan)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#04081f]">
                      {t(TIERS_COPY.pricingCurrent)}
                    </span>
                  ) : null}
                </div>

                <p className="tnum mt-3 text-[26px] font-bold leading-none tracking-tight">
                  {id === "free"
                    ? t(TIERS_COPY.pricingFree)
                    : (price?.formatted ?? "—")}
                </p>
                {id !== "free" && sellable ? (
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                    {t(TIERS_COPY.pricingOneTime)}
                  </p>
                ) : null}

                <p className="mt-3 min-h-[48px] text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
                  {t(tier.pitch)}
                </p>

                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {id === "free" ? t(TIERS_COPY.pricingIncludes) : "+"}
                </p>
                <ul className="mt-1.5 flex-1 space-y-1.5">
                  {newIn(id).map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--text-secondary)]"
                    >
                      <span className="mt-[3px] text-[var(--cyan)]" aria-hidden="true">
                        ·
                      </span>
                      {t(CAPABILITY_COPY[c])}
                    </li>
                  ))}
                </ul>

                {/* No button on the free tier, on the tier you already hold, or
                    when Stripe has no live price — a control that cannot do
                    anything is worse than no control. */}
                {id !== "free" && !isCurrent && sellable ? (
                  <button
                    type="button"
                    onClick={() => startCheckout(id)}
                    disabled={busy !== null}
                    className="mt-4 w-full rounded-lg bg-[var(--accent)] px-3 py-2 text-[12.5px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {busy === id ? "…" : t(TIERS_COPY.pricingChoose)}
                  </button>
                ) : null}
              </section>
            );
          })}
        </div>

        {!anyPriceLive ? (
          <p className="mt-6 rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-[12px] text-[var(--text-muted)]">
            {t(TIERS_COPY.pricingSoon)}
          </p>
        ) : null}

        <div className="mt-8">
          <ConsultCTA kind="results_review" variant="band" />
        </div>
      </main>

      <Footer />
    </>
  );
}
