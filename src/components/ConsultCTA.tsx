"use client";

import { useState, type FormEvent } from "react";
import { BOOKING, DATAREV } from "@/lib/datarev";
import { UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { useSession } from "./SessionProvider";

type Kind = "guided_full" | "results_review";

/**
 * Records the request before handing the visitor to Calendly. Booking is the
 * happy path, but the ones who open the calendar and never book are exactly
 * the leads worth chasing — so the row is written either way.
 */
async function recordRequest(input: {
  email: string;
  fullName?: string;
  company?: string;
  leadId?: string;
  assessmentId?: string | null;
  kind: Kind;
  locale: string;
  message?: string;
}): Promise<void> {
  try {
    await fetch("/api/consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        assessmentId: input.assessmentId ?? undefined,
      }),
    });
  } catch {
    // Never block the booking on our own analytics.
  }
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

interface ConsultCTAProps {
  kind?: Kind;
  /** Compact card for the mode picker; full-width band for the report. */
  variant?: "panel" | "band";
  assessmentId?: string | null;
}

export function ConsultCTA({
  kind = "guided_full",
  variant = "panel",
  assessmentId = null,
}: ConsultCTAProps) {
  const { t, locale, state } = useApp();
  const { user, lead } = useSession();

  const knownEmail = lead?.email ?? user?.email ?? "";
  const [email, setEmail] = useState(knownEmail);
  const [name, setName] = useState(lead?.name ?? "");
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const [requested, setRequested] = useState(false);

  const bookingUrl = kind === "guided_full" ? BOOKING.guided : BOOKING.review;
  // The guided hour has no calendar until the 60-minute event type exists.
  // Until then we take the request and promise a callback rather than open a
  // 30-minute page under a one-hour promise.
  const bookable = kind === "guided_full" ? BOOKING.guidedIsBookable : true;

  function finish() {
    setSending(false);
    if (bookable && bookingUrl) {
      window.open(bookingUrl, "_blank", "noopener,noreferrer");
    } else {
      setRequested(true);
    }
  }

  /** Already identified: record, then either open the calendar or confirm. */
  async function bookDirect() {
    setSending(true);
    await recordRequest({
      email: knownEmail,
      fullName: lead?.name,
      company: state.company.name || undefined,
      leadId: lead?.leadId,
      assessmentId,
      kind,
      locale,
    });
    finish();
  }

  async function bookWithForm(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    await recordRequest({
      email,
      fullName: name || undefined,
      company: state.company.name || undefined,
      leadId: lead?.leadId,
      assessmentId,
      kind,
      locale,
    });
    finish();
  }

  const title = kind === "guided_full" ? UI.guidedTitle : UI.nextStepTitle;
  const lead_ = kind === "guided_full" ? UI.guidedLead : UI.nextStepLead;
  const cta =
    kind !== "guided_full"
      ? UI.nextStepCta
      : bookable
        ? UI.guidedCta
        : UI.guidedRequestCta;

  const shell =
    variant === "band"
      ? "card card-lit glow-accent p-6 sm:p-8"
      : "card card-lit p-6";

  return (
    <section className={`no-print ${shell}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          {kind === "guided_full" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cyan)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#04081f]">
              {t(UI.guidedBadge)}
            </span>
          ) : null}
          <h2 className="mt-2.5 text-[17px] font-semibold tracking-tight">
            {t(title)}
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
            {t(lead_)}
          </p>
          {kind === "guided_full" ? (
            <p className="mt-2.5 text-[12px] text-[var(--text-muted)]">
              {t(UI.guidedPerks)}
            </p>
          ) : null}
        </div>

        <CalendarIcon className="hidden h-9 w-9 shrink-0 text-[var(--cyan)] opacity-70 sm:block" />
      </div>

      {requested ? (
        <div className="mt-5 rounded-lg border border-[var(--cyan)]/40 bg-[var(--surface-2)] p-4">
          <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">
            {t(UI.guidedRequestDone)}
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            {t(UI.guidedRequestNote)}
          </p>
        </div>
      ) : knownEmail ? (
        <button
          type="button"
          onClick={() => void bookDirect()}
          disabled={sending}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
        >
          <CalendarIcon className="h-4 w-4" />
          {t(cta)}
        </button>
      ) : expanded ? (
        <form onSubmit={bookWithForm} className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(UI.gateEmailLabel)}
                <span className="text-[var(--cyan)]"> *</span>
              </span>
              <input
                type="email"
                required
                value={email}
                autoComplete="email"
                placeholder={t(UI.gateEmailPlaceholder)}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-3 py-2 text-[13.5px] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(UI.gateNameLabel)}
              </span>
              <input
                type="text"
                value={name}
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-3 py-2 text-[13.5px] outline-none transition focus:border-[var(--accent)]"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
          >
            <CalendarIcon className="h-4 w-4" />
            {sending ? t(UI.gateSending) : t(cta)}
          </button>
          <p className="text-[11px] text-[var(--text-muted)]">
            {t(UI.gatePrivacy)}
          </p>
        </form>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            <CalendarIcon className="h-4 w-4" />
            {t(cta)}
          </button>
          <a
            href={`mailto:${DATAREV.email}`}
            className="text-[13px] font-medium text-[var(--text-secondary)] underline-offset-4 transition hover:text-[var(--cyan)] hover:underline"
          >
            {t(UI.contactUs)}
          </a>
        </div>
      )}
    </section>
  );
}
