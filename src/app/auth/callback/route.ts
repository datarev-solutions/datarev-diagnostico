import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Google OAuth landing point. Supabase redirects here with a one-time code,
 * which we exchange for a session cookie before returning the visitor to
 * wherever they were (the results page, normally).
 *
 * The lead row is written here rather than on the results page so that someone
 * who signs in and then closes the tab is still a captured lead. The assessment
 * itself is attached afterwards, from /results.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/results";

  // Only same-origin paths — an open redirect here would be a phishing vector.
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/results";

  if (!code) {
    return NextResponse.redirect(`${origin}/results?auth=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  const user = data?.user;
  const email = user?.email;

  if (error || !user || !email) {
    return NextResponse.redirect(`${origin}/results?auth=error`);
  }

  // capture_lead normalises the address and reads auth.uid() off the session
  // cookie just set above, so the lead is stamped with the Google identity.
  const { error: writeError } = await supabase.rpc("capture_lead", {
    p_email: email,
    p_full_name:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    p_source: "diagnostico_google",
    p_consent: true,
  });

  if (writeError) {
    // A failed write must not strand the visitor on an error page — they are
    // signed in, and /results retries with the assessment attached.
    console.error("[auth/callback] capture_lead failed", writeError);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
