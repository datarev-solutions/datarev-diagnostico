import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Session-bound server client. Reads the signed-in visitor from cookies.
 * `cookies()` is async in this version of Next, so this is too.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component, where the response is already
            // committed. Session refresh is handled in the route handlers.
          }
        },
      },
    },
  );
}
