"use client";

import { createClient } from "./supabase/client";

/**
 * PRODUCT ANALYTICS
 * =================
 * Writes to the `events` table. The table has existed since the paywall
 * migration and nothing has ever written to it, which meant the funnel was
 * unmeasurable: there was no way to answer "how many people started the
 * assessment and how many finished", let alone whether the paywall filters
 * tyre-kickers or scares off buyers.
 *
 * Three rules, all of which come from the RLS policy on the table:
 *
 *   1. FIRE AND FORGET. A failed event must never break, block or slow the
 *      thing the visitor was actually doing. Every call swallows its errors.
 *   2. NO PII IN PROPS. The table has no select policy, but props travel
 *      through the browser and end up in logs. Ids and counts, never emails,
 *      names or company names.
 *   3. ANONYMOUS VISITORS COUNT. Most of the funnel happens before sign-in.
 *      `user_id` stays null for them and a client-generated `session_id`
 *      stitches the visit together, then ties it to the account it converts
 *      into.
 */

const SESSION_KEY = "datarev:session:v1";

/**
 * A visit id that survives a reload but not a new browser session, so a funnel
 * can be reconstructed without anything that identifies a person.
 */
function sessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // Private browsing: events still land, they just cannot be stitched.
    return "";
  }
}

/** Every event the app emits. A closed list so the funnel stays analysable. */
export type EventName =
  // assessment
  | "assessment_started"
  | "assessment_completed"
  | "lead_captured"
  | "report_viewed"
  // planner and calculator
  | "usecases_viewed"
  | "usecase_selected"
  | "calculator_viewed"
  | "calculator_input_changed"
  // paywall
  | "paywall_hit"
  | "pricing_viewed"
  | "checkout_started"
  // human
  | "consult_cta_clicked"
  | "booking_opened";

/**
 * Record one event. Never throws, never awaits anything the caller depends on.
 *
 * Deliberately not batched: the volume here is a handful of events per visit,
 * and a batching buffer would lose the last events of a session — which are
 * exactly the ones that say where someone dropped off.
 */
export function track(name: EventName, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  void (async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("events").insert({
        // Null for anonymous visitors, which the RLS policy explicitly allows.
        user_id: user?.id ?? null,
        session_id: sessionId(),
        name,
        props,
      });
    } catch {
      // Analytics must never be the reason a page breaks.
    }
  })();
}
