import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isPaidTier } from "@/lib/stripe";
import { TIER_ORDER, type TierId } from "@/lib/tiers";

/**
 * Signature verification needs a real crypto implementation and a body that has
 * not been re-encoded. Pinning the Node runtime keeps both guarantees explicit
 * rather than inherited from a default that could change.
 */
export const runtime = "nodejs";

/**
 * STRIPE WEBHOOK — the only place entitlements are granted.
 * =========================================================
 * Everything in the request body is attacker-controlled until
 * `constructEventAsync` returns. Anyone can POST here. So:
 *
 *   - The raw body is read with `request.text()` and handed to Stripe
 *     untouched. `request.json()` would parse and re-serialise it, changing
 *     whitespace and key order, and the HMAC — computed over the exact bytes
 *     Stripe sent — would never match again. (No `bodyParser: false` config in
 *     the App Router; that was a Pages Router concern.)
 *   - Nothing is read out of the body before the signature verifies. Not the
 *     tier, not the user id, not for logging.
 *   - The tier is taken from the verified event's metadata — the value this
 *     server itself set when creating the session — never from a client.
 *   - Writes go through the service role key, because the caller is Stripe and
 *     has no Supabase session for RLS to key off. This is the ONLY route that
 *     uses it.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    console.error("[api/stripe/webhook] not configured", {
      hasSecretKey: Boolean(stripe),
      hasWebhookSecret: Boolean(webhookSecret),
    });
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // The raw, unmodified request body. Must be read before anything else looks
  // at the request, and must not be parsed first — see the note above.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    // Async variant: it works under both the Node crypto provider and the Web
    // Crypto one, so moving this route to the edge later would not silently
    // break verification.
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
    );
  } catch (error: unknown) {
    // Message only. The payload is unverified attacker input and would put a
    // forged customer email straight into the logs.
    console.warn(
      "[api/stripe/webhook] signature verification failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // ---- everything below this line is verified Stripe data ----

  // `completed` fires as soon as checkout finishes; for asynchronous methods
  // (OXXO and SPEI are ordinary choices in MXN) the money has not arrived yet,
  // and the paid confirmation comes hours later on `async_payment_succeeded`.
  // Both are handled; the `payment_status` check below is what keeps an
  // unpaid OXXO voucher from unlocking anything.
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    // Acknowledged, not processed. A non-2xx would make Stripe retry an event
    // we are never going to care about.
    return NextResponse.json({ received: true, handled: false });
  }

  const session = event.data.object;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, handled: false });
  }

  const userId = session.client_reference_id;
  const tier = session.metadata?.tier;

  if (!userId || !tier || !isPaidTier(tier)) {
    // Our own metadata is missing, which is a bug on the checkout side that a
    // retry cannot fix. Logged loudly, acknowledged anyway: a 500 here would
    // buy days of pointless retries instead of a fix.
    console.error("[api/stripe/webhook] event missing our own metadata", {
      eventId: event.id,
      hasUserId: Boolean(userId),
      tier,
    });
    return NextResponse.json({ received: true, handled: false });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // 500 on purpose: the payment is real and unrecorded, so we want Stripe to
    // keep retrying until someone sets the variable.
    console.error("[api/stripe/webhook] service role client not configured");
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    // No cookies, no session storage, no token refresh — this client exists for
    // the length of one request and must never pick up a visitor's session.
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Idempotency, part 1: Stripe redelivers events on any non-2xx and on manual
  // replay, so the same purchase can arrive many times. Reading the current
  // tier first makes a replay a no-op — and, more importantly, stops a later
  // event for a cheaper tier from demoting someone who has since bought up.
  const { data: existing, error: readError } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .maybeSingle<{ tier: TierId }>();

  if (readError) {
    console.error("[api/stripe/webhook] subscription read failed", {
      eventId: event.id,
      message: readError.message,
    });
    return NextResponse.json({ error: "subscription_read_failed" }, { status: 500 });
  }

  if (existing && TIER_ORDER.indexOf(existing.tier) >= TIER_ORDER.indexOf(tier)) {
    return NextResponse.json({ received: true, handled: false, reason: "already_entitled" });
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  // These tiers are one-time purchases, so there is no Stripe subscription and
  // no billing period to end. Both columns exist for a future recurring plan;
  // filling them with a payment intent id would make "subscription" mean two
  // different things depending on the row.
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  // Idempotency, part 2: upsert on user_id, so even a duplicate that slipped
  // past the read above rewrites the same row instead of inserting a second
  // entitlement for the same person.
  const { error: writeError } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      tier,
      status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      current_period_end: null,
    },
    { onConflict: "user_id" },
  );

  if (writeError) {
    // 500 so Stripe retries: the customer has paid and is not yet entitled.
    console.error("[api/stripe/webhook] subscription upsert failed", {
      eventId: event.id,
      message: writeError.message,
    });
    return NextResponse.json({ error: "subscription_write_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true, handled: true });
}
