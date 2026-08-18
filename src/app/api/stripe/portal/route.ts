import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

/**
 * Open the Stripe Billing Portal for the signed-in user.
 *
 * The customer id is looked up with the visitor's own session-bound client, not
 * the service role: the portal shows receipts and payment methods, so handing
 * back a portal session for someone else's customer id would be a data leak.
 * Going through RLS means the database — not this handler's `.eq()` clause — is
 * the thing enforcing "your row only".
 */
export async function POST() {
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

  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

  if (!stripe || !siteUrl) {
    console.error("[api/stripe/portal] not configured", {
      hasSecretKey: Boolean(stripe),
      hasSiteUrl: Boolean(siteUrl),
    });
    return NextResponse.json(
      { success: false, error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const { data: subscription, error: readError } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle<{ stripe_customer_id: string | null }>();

  if (readError) {
    console.error("[api/stripe/portal] subscription read failed", readError.message);
    return NextResponse.json(
      { success: false, error: "subscription_read_failed" },
      { status: 500 },
    );
  }

  // 404 rather than 500: someone who has never bought anything has no billing
  // history to show, and the UI should offer checkout instead of the portal.
  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { success: false, error: "no_stripe_customer" },
      { status: 404 },
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/results`,
      locale: "es",
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (error: unknown) {
    // Message only — the Stripe error body echoes customer details.
    console.error(
      "[api/stripe/portal] portal session create failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { success: false, error: "portal_session_failed" },
      { status: 502 },
    );
  }
}
