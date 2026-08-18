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
    return googleEnabled ? (
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-[11.5px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
      >
        {t(UI.signIn)}
      </button>
    ) : (
      <Link
        href="/assessment"
        className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-[11.5px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
      >
        {t(UI.signIn)}
      </Link>
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
