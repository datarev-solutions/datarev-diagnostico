"use client";

import { UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { useSession } from "./SessionProvider";

/** Signed-in identity in the header. Renders nothing for anonymous visitors. */
export function AccountChip() {
  const { t } = useApp();
  const { user, ready, signOut } = useSession();

  if (!ready || !user) return null;

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
