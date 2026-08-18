"use client";

import { useId, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { BOOKING, DATAREV } from "@/lib/datarev";
import { UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { BookingEmbed, type BookingKind } from "./BookingEmbed";
import { useSession } from "./SessionProvider";

type Kind = BookingKind;

/**
 * Records the request before opening the calendar. Booking is the happy path,
 * but the ones who open the calendar and never book are exactly the leads
 * worth chasing — so the row is written either way.
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
  const [booking, setBooking] = useState(false);
  const regionId = `booking-${useId()}`;

  const bookingUrl = kind === "guided_full" ? BOOKING.guided : BOOKING.review;
  // The guided path is sold as an hour; Calendly may still only publish the
  // 30-minute event. It stays bookable either way — the mismatch is disclosed
  // above the calendar rather than hidden behind a callback promise.
  const fullHour = kind !== "guided_full" || BOOKING.guidedIsFullHour;

  function finish() {
    setSending(false);
    setBooking(true);
  }

  /** Already identified: record, then drop the calendar straight into the page. */
  async function bookDirect() {
    setSending(true);
    track("consult_cta_clicked", { kind, variant, identified: true });
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
  // "Book the 1-hour session" is only allowed to be the label when an hour is
  // what the calendar will actually offer.
  const cta =
    kind !== "guided_full"
      ? UI.nextStepCta
      : fullHour
        ? UI.guidedCta
        : UI.bookingSeeTimes;

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

      {booking ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setBooking(false)}
            aria-expanded={true}
            aria-controls={regionId}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            {t(UI.bookingClose)}
          </button>
          <BookingEmbed
            id={regionId}
            url={bookingUrl}
            kind={kind}
            prefillName={name || lead?.name}
            prefillEmail={email || knownEmail}
            note={fullHour ? null : UI.bookingHalfHourNote}
          />
        </div>
      ) : knownEmail ? (
        <button
          type="button"
          onClick={() => void bookDirect()}
          disabled={sending}
          aria-expanded={false}
          aria-controls={regionId}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
        >
          <CalendarIcon className="h-4 w-4" />
          {sending ? t(UI.gateSending) : t(cta)}
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
            aria-expanded={false}
            aria-controls={regionId}
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
            onClick={() => {
              // The intent is expressed here, not at submit: this is the click
              // the drop-off between "wants to talk" and "left an email" is
              // measured against.
              track("consult_cta_clicked", { kind, variant, identified: false });
              setExpanded(true);
            }}
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
