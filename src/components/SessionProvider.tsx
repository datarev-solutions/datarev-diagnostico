"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/** What the lead form (or a Google sign-in) produced. */
export interface CapturedLead {
  leadId: string;
  assessmentId: string | null;
  email: string;
  name?: string;
}

interface SessionContextValue {
  /** Supabase user, or null for the email-only path. */
  user: User | null;
  /** False until the auth state has been read at least once. */
  ready: boolean;
  /**
   * Whether the Google provider is actually switched on in Supabase. Read at
   * runtime so the button appears the moment the provider is configured, and
   * — more importantly — never renders as a dead button before that.
   */
  googleEnabled: boolean;
  /** The lead behind the currently unlocked report, if any. */
  lead: CapturedLead | null;
  /** Whether the full report should be shown. */
  unlocked: boolean;
  rememberLead: (lead: CapturedLead) => void;
  signInWithGoogle: (next?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const LEAD_KEY = "datarev:lead:v1";

function parseLead(raw: string | null): CapturedLead | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CapturedLead;
    return parsed.leadId && parsed.email ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * localStorage as an external store, mirroring how AppProvider reads the
 * persisted assessment. Reading it in an effect instead would flash the lead
 * gate at a visitor who has already unlocked the report.
 *
 * `snapshot` is cached because useSyncExternalStore compares by identity — a
 * fresh object per read would loop forever.
 */
const leadStore = {
  listeners: new Set<() => void>(),
  raw: null as string | null,
  snapshot: null as CapturedLead | null,
  primed: false,

  subscribe(listener: () => void) {
    leadStore.listeners.add(listener);
    return () => {
      leadStore.listeners.delete(listener);
    };
  },

  getSnapshot(): CapturedLead | null {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(LEAD_KEY);
    } catch {
      raw = null;
    }
    if (!leadStore.primed || raw !== leadStore.raw) {
      leadStore.raw = raw;
      leadStore.snapshot = parseLead(raw);
      leadStore.primed = true;
    }
    return leadStore.snapshot;
  },

  getServerSnapshot(): CapturedLead | null {
    return null;
  },

  write(lead: CapturedLead | null) {
    try {
      if (lead) {
        window.localStorage.setItem(LEAD_KEY, JSON.stringify(lead));
      } else {
        window.localStorage.removeItem(LEAD_KEY);
      }
    } catch {
      // Private browsing: the unlock simply does not survive a refresh.
    }
    leadStore.primed = false;
    for (const listener of leadStore.listeners) listener();
  },
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(true);

  const lead = useSyncExternalStore(
    leadStore.subscribe,
    leadStore.getSnapshot,
    leadStore.getServerSnapshot,
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setReady(true);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const rememberLead = useCallback((next: CapturedLead) => {
    leadStore.write(next);
  }, []);

  const signInWithGoogle = useCallback(
    async (next = "/results") => {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    leadStore.write(null);
  }, [supabase]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      ready,
      googleEnabled,
      lead,
      // A Google session is itself proof of a captured lead: the callback
      // route writes the row before the visitor lands back on /results.
      unlocked: Boolean(lead) || Boolean(user),
      rememberLead,
      signInWithGoogle,
      signOut,
    }),
    [user, ready, googleEnabled, lead, rememberLead, signInWithGoogle, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return context;
}
