import { after, NextResponse } from "next/server";
import { z } from "zod";
import { sendConsultationRequestReceived } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  // Trimmed before validation — same reason as /api/lead.
  email: z.string().trim().email().max(320),
  fullName: z.string().max(160).optional(),
  company: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  assessmentId: z.string().uuid().optional(),
  kind: z.enum(["guided_full", "results_review"]).default("guided_full"),
  preferredTime: z.string().max(200).optional(),
  message: z.string().max(1200).optional(),
  locale: z.enum(["es", "en"]).default("es"),
});

/**
 * "Do the long assessment with a consultant instead."
 *
 * Recorded even when the visitor also opens Calendly, because the ones who open
 * the calendar and never book are exactly the leads worth chasing. The RPC
 * upserts the lead too, so this never drops a contact for lack of a prior form.
 */
export async function POST(request: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch (error: unknown) {
    const detail =
      error instanceof z.ZodError ? error.issues : "Malformed request body";
    return NextResponse.json(
      { success: false, error: "invalid_payload", detail },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("request_consultation", {
    p_email: parsed.email,
    p_full_name: parsed.fullName ?? null,
    p_company: parsed.company ?? null,
    p_phone: parsed.phone ?? null,
    p_kind: parsed.kind,
    p_assessment_id: parsed.assessmentId ?? null,
    p_preferred_time: parsed.preferredTime ?? null,
    p_message: parsed.message ?? null,
    p_locale: parsed.locale,
  });

  if (error) {
    console.error("[api/consultation] request_consultation failed", error);
    const invalidEmail = error.message?.includes("invalid_email");
    return NextResponse.json(
      {
        success: false,
        error: invalidEmail ? "invalid_email" : "consultation_write_failed",
      },
      { status: invalidEmail ? 400 : 500 },
    );
  }

  // Same shape as the lead route: scheduled with `after` so the acknowledgement
  // cannot slow the submit or turn a recorded request into a visible error.
  // Someone asking for a consultation is the highest-intent visitor the app
  // has; leaving them with no confirmation at all is the one place silence
  // costs the most.
  after(async () => {
    await sendConsultationRequestReceived({
      to: parsed.email,
      locale: parsed.locale,
      name: parsed.fullName,
      kind: parsed.kind,
      consultationId: data?.consultationId ?? null,
    });
  });

  return NextResponse.json({
    success: true,
    data: {
      consultationId: data?.consultationId ?? null,
      leadId: data?.leadId ?? null,
    },
  });
}
