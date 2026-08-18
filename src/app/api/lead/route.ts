import { after, NextResponse } from "next/server";
import { z } from "zod";
import { sendLeadConfirmation } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

const assessmentSchema = z.object({
  mode: z.enum(["express", "full"]),
  locale: z.enum(["es", "en"]),
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
  targets: z.record(z.string(), z.number().int().min(1).max(5)),
  ambition: z.string().max(40).optional(),
  overallScore: z.number().min(0).max(5).optional(),
  creditedLevel: z.number().int().min(1).max(5).optional(),
  stageId: z.string().max(40).optional(),
  dimensionScores: z.record(z.string(), z.number()).optional(),
  topGaps: z.array(z.string().max(60)).max(8).optional(),
  shareCode: z.string().max(400).optional(),
  companySnapshot: z
    .object({
      name: z.string().max(160).optional(),
      industry: z.string().max(120).optional(),
      size: z.string().max(80).optional(),
      assessor: z.string().max(160).optional(),
    })
    .optional(),
});

const bodySchema = z.object({
  // .trim() BEFORE .email(): people paste addresses with a trailing space all
  // the time, and validating first would reject the lead outright.
  // Casing is left alone — capture_lead lowercases it on the way into Postgres.
  email: z.string().trim().email().max(320),
  fullName: z.string().max(160).optional(),
  company: z.string().max(160).optional(),
  jobTitle: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  industry: z.string().max(120).optional(),
  companySize: z.string().max(80).optional(),
  locale: z.enum(["es", "en"]).default("es"),
  consentMarketing: z.boolean().default(false),
  utm: z.record(z.string(), z.string().max(200)).default({}),
  assessment: assessmentSchema.optional(),
});

/**
 * Lead capture.
 *
 * Writes go through the `capture_lead` SECURITY DEFINER function rather than a
 * table insert, so the visitor's key chooses values but never columns, and the
 * tables keep zero write policies. The function also owns email normalisation
 * and the "a blank never overwrites good data" rule — putting that in Postgres
 * means a direct RPC call gets the same treatment as one routed through here.
 *
 * The session-bound client is used on purpose: when the visitor signed in with
 * Google, `auth.uid()` inside the function stamps the lead with their user id.
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("capture_lead", {
    p_email: parsed.email,
    p_full_name:
      parsed.fullName ??
      (user?.user_metadata?.full_name as string | undefined) ??
      null,
    p_company: parsed.company ?? null,
    p_job_title: parsed.jobTitle ?? null,
    p_phone: parsed.phone ?? null,
    p_industry: parsed.industry ?? null,
    p_company_size: parsed.companySize ?? null,
    p_locale: parsed.locale,
    p_source: user ? "diagnostico_google" : "diagnostico_email",
    p_utm: parsed.utm,
    p_consent: parsed.consentMarketing,
    p_assessment: parsed.assessment ?? null,
  });

  if (error) {
    console.error("[api/lead] capture_lead failed", error);
    const invalidEmail = error.message?.includes("invalid_email");
    return NextResponse.json(
      { success: false, error: invalidEmail ? "invalid_email" : "lead_write_failed" },
      { status: invalidEmail ? 400 : 500 },
    );
  }

  // Confirmation mail is scheduled with `after`, so it runs once the response
  // is already on the wire. Two things follow, both deliberate: a slow provider
  // cannot add latency to a form submit, and a failed send cannot turn a
  // captured lead into an error the visitor sees. `sendLeadConfirmation` also
  // swallows its own failures — belt and braces, because the lead row is the
  // thing that matters and the email is a courtesy on top of it.
  after(async () => {
    await sendLeadConfirmation({
      to: parsed.email,
      locale: parsed.locale,
      name: parsed.fullName,
      // Their own answers, encoded — the same link the in-app share button
      // produces. The report itself stays behind the paywall on /results.
      shareCode: parsed.assessment?.shareCode,
      leadId: data?.leadId ?? null,
    });
  });

  return NextResponse.json({
    success: true,
    data: {
      leadId: data?.leadId ?? null,
      assessmentId: data?.assessmentId ?? null,
    },
  });
}
