"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client. Only ever used for the Google OAuth handshake and for
 * reading back the current session — every write goes through a route handler
 * so the publishable key never needs write privileges.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
