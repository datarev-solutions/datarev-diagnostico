"use client";

import Link from "next/link";
import { UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { useSession } from "./SessionProvider";

/**
 * Identity in the header: who you are when signed in, and a way in when not.
 *
 * It used to render nothing at all for anonymous visitors, which meant the
 * product had no visible front door — sign-in existed only inside the
 * assessment flow, where a visitor had to already be converting to find it.
 * Login is the first barrier and the first thing that captures an email, so it
 * belongs where people look for it.
 *
 * Google appears only once the provider is actually enabled in Supabase; the
 * app checks at runtime. Until then the button points at the assessment, whose
 * gate captures an email — a real way in rather than a dead control.
 */
export function AccountChip() {
  const { t } = useApp();
  const { user, ready, signOut, googleEnabled, signInWithGoogle } = useSession();

  // Nothing until the session resolves, so the header does not flash "sign in"
  // at somebody who is already signed in.
  if (!ready) return null;

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-1 text-[11.5px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
      >
        <svg viewBox="0 0 18 18" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
          />
        </svg>
        <span>Google Sign In</span>
      </button>
    );
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "";
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        // Google's CDN host is not in next.config's image allowlist, and adding
        // a remote host for a 24px avatar is not worth it.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          className="h-6 w-6 rounded-full border border-[var(--border)]"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <span
        className="hidden max-w-[14ch] truncate text-[12px] text-[var(--text-secondary)] md:inline"
        title={`${t(UI.signedInAs)} ${name}`}
      >
        {name}
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
      >
        {t(UI.signOut)}
      </button>
    </div>
  );
}
