import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, priceIdFor } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { TIER_ORDER, TIERS, type TierId } from "@/lib/tiers";

/** Derived from the tier contract so adding a tier cannot forget this route. */
const PAID_TIERS = TIER_ORDER.filter((t) => TIERS[t].priceEnvVar) as [
  TierId,
  ...TierId[],
];

const bodySchema = z.object({
  tier: z.enum(PAID_TIERS),
});

/**
 * Start a Checkout Session.
 *
 * The client sends a tier name and nothing else. It does not send a price, an
 * amount or a currency — those come from the price id this server resolves out
 * of the environment, so a tampered request can at worst ask to buy a different
 * tier at that tier's real price.
 *
 * Deliberately the session-bound Supabase client, never the service role: this
 * route runs on input from the browser, and the only thing it needs from the
 * database is "who is signed in?".
 *
 * `payment` mode, not `subscription` — every tier here is a one-time purchase.
 */
export async function POST(request: Request) {
  // Auth first, so an anonymous caller cannot probe whether payments are
  // switched on by reading which error code comes back.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "unauthenticated" },
      { status: 401 },
    );
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch (error: unknown) {
    const detail =
      error instanceof z.ZodError ? error.issues : "Malformed request body";
    return NextResponse.json(
      { success: false, error: "invalid_tier", detail },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const priceId = priceIdFor(parsed.tier);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

  // 503, not 500: the code is fine, the environment is incomplete. The UI hides
  // payment buttons via `stripeConfigured()`, so reaching this means either a
  // half-configured deploy or a direct call — both "try again later", neither
  // worth leaking which specific variable is missing to the caller.
  if (!stripe || !priceId || !siteUrl) {
    console.error("[api/stripe/checkout] not configured", {
      hasSecretKey: Boolean(stripe),
      hasPriceId: Boolean(priceId),
      hasSiteUrl: Boolean(siteUrl),
      tier: parsed.tier,
    });
    return NextResponse.json(
      { success: false, error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // The price must be denominated in MXN (or be a multi-currency price that
      // includes it) — Stripe rejects the session if this disagrees with the
      // price, which is the failure we want: loudly, here, rather than charging
      // someone in the wrong currency.
      currency: "mxn",
      // Both are echoed back on the webhook event, and this is the only way the
      // fulfilment side learns who paid for what. `client_reference_id` is the
      // documented slot for our own user id; metadata carries the tier.
      client_reference_id: user.id,
      metadata: { tier: parsed.tier, supabase_user_id: user.id },
      // Payment mode does not create a Customer unless asked. Without one there
      // is no billing portal to open later and no receipt history.
      customer_creation: "always",
      customer_email: user.email,
      // {CHECKOUT_SESSION_ID} is substituted by Stripe. It is a lookup handle
      // for the "thanks, we are confirming your payment" state only — the
      // entitlement itself is written by the webhook, never by this redirect,
      // which anyone could forge by visiting the URL.
      success_url: `${siteUrl}/results?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/results?checkout=cancelled`,
      locale: "es",
    });

    if (!session.url) {
      // Only happens for embedded/custom ui_mode sessions; treat as a bug here.
      console.error("[api/stripe/checkout] session created without a url", {
        sessionId: session.id,
      });
      return NextResponse.json(
        { success: false, error: "checkout_session_failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { url: session.url, sessionId: session.id },
    });
  } catch (error: unknown) {
    // Logged without the payload: it carries the customer's email address.
    console.error(
      "[api/stripe/checkout] session create failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { success: false, error: "checkout_session_failed" },
      { status: 502 },
    );
  }
}
