"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { DATAREV } from "@/lib/datarev";
import type { L } from "@/lib/framework";
import { UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";

/**
 * Calendly's own inline widget. `react-calendly` wraps this one function call
 * in a dependency; the function is three lines away, so it is called directly.
 */
const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

/**
 * An ad blocker that swallows the request answers neither `load` nor `error`,
 * which would leave a visitor staring at "loading" forever. After this we stop
 * pretending and show the ways out.
 */
const LOAD_TIMEOUT_MS = 8000;

interface CalendlyWidget {
  initInlineWidget(options: {
    url: string;
    parentElement: HTMLElement;
    prefill?: { name?: string; email?: string };
  }): void;
}

declare global {
  interface Window {
    Calendly?: CalendlyWidget;
  }
}

export type BookingKind = "guided_full" | "results_review";

interface BookingEmbedProps {
  /** Calendly event URL, or null when none is configured — see BOOKING. */
  url: string | null;
  /** Which CTA opened this. Analytics only; never carries an email. */
  kind: BookingKind;
  /** Id of the region, so the trigger can point `aria-controls` at it. */
  id: string;
  /** Primitives, not an object: a fresh object each render would re-init. */
  prefillName?: string;
  prefillEmail?: string;
  /** Anything the visitor has to know before picking a slot. */
  note?: L | null;
}

/**
 * The scheduler, inline. Mounted only once a visitor asks to book, which is
 * also when the third-party script is fetched: on the landing page, where
 * almost nobody books, Calendly costs nothing at all.
 */
export function BookingEmbed({
  url,
  kind,
  id,
  prefillName,
  prefillEmail,
  note = null,
}: BookingEmbedProps) {
  const { t } = useApp();
  const region = useRef<HTMLElement | null>(null);
  const host = useRef<HTMLDivElement | null>(null);
  /** What the widget was last initialised with, so it is built exactly once. */
  const built = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (url) track("booking_opened", { kind });
  }, [url, kind]);

  // The calendar is revealed on demand, so keyboard and screen-reader users
  // have to be taken to it; otherwise it appears below where the focus still is.
  useEffect(() => {
    region.current?.focus();
  }, []);

  useEffect(() => {
    const parent = host.current;
    if (!url || !parent) return;

    // `window.Calendly`, not the load event, is what says the widget can be
    // initialised: next/script skips `onLoad` for a src it has already loaded,
    // so on a second open (close, reopen, another page with a CTA) nothing
    // would ever fire. `onReady` covers the same case from the other side.
    if (!window.Calendly) {
      const timer = window.setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
      return () => window.clearTimeout(timer);
    }

    const signature = `${url}|${prefillName ?? ""}|${prefillEmail ?? ""}`;
    if (built.current === signature) return;
    built.current = signature;

    // React never owns the children of this node, so clearing it by hand is
    // safe — and necessary, or a re-init stacks a second iframe on the first.
    parent.replaceChildren();
    window.Calendly.initInlineWidget({
      url,
      parentElement: parent,
      prefill: { name: prefillName, email: prefillEmail },
    });
  }, [url, prefillName, prefillEmail, scriptReady]);

  const escapeHatches = (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--text-secondary)] underline-offset-4 transition hover:text-[var(--cyan)] hover:underline"
        >
          {t(UI.bookingNewTab)}
        </a>
      ) : null}
      <a
        href={`mailto:${DATAREV.email}`}
        className="font-medium text-[var(--text-secondary)] underline-offset-4 transition hover:text-[var(--cyan)] hover:underline"
      >
        {DATAREV.email}
      </a>
    </div>
  );

  return (
    <section
      id={id}
      ref={region}
      tabIndex={-1}
      aria-label={t(UI.bookingRegion)}
      className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 outline-none"
    >
      {/* No configured calendar and a failed one look the same to a visitor:
          both mean "book by writing to us". A broken embed would not. The note
          belongs to the calendar, so it goes away with it. */}
      {url === null || failed ? (
        <>
          <p className="text-[13px] leading-relaxed text-[var(--text-primary)]">
            {t(UI.bookingUnavailable)}
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">
            {t(UI.guidedRequestNote)}
          </p>
          {escapeHatches}
        </>
      ) : (
        <>
          {note ? (
            <p className="mb-3 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
              {t(note)}
            </p>
          ) : null}
          <p
            aria-live="polite"
            hidden={scriptReady}
            className="text-[13px] text-[var(--text-secondary)]"
          >
            {t(UI.bookingLoading)}
          </p>
          <div ref={host} className="h-[700px] w-full min-w-[320px]" />
          {escapeHatches}
          {/* Rendered here and nowhere else: the fetch happens when a visitor
              opens the calendar, not on every page they pass through.
              `onReady` rather than `onLoad` because it also fires on remount. */}
          <Script
            id="calendly-widget"
            src={WIDGET_SRC}
            strategy="afterInteractive"
            onReady={() => setScriptReady(true)}
            onError={() => setFailed(true)}
          />
        </>
      )}
    </section>
  );
}
