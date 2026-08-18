"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { DATAREV } from "@/lib/datarev";
import { UI } from "@/lib/i18n";
import {
  buildAssessmentPayload,
  readAttribution,
  type AssessmentPayload,
} from "@/lib/leadPayload";
import type { Result } from "@/lib/scoring";
import type { AssessmentState } from "@/lib/state";
import { useApp } from "./AppProvider";
import { useSession } from "./SessionProvider";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
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
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
        {required ? <span className="text-[var(--cyan)]"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-3 py-2 text-[13.5px] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
      />
    </label>
  );
}

interface LeadGateProps {
  state: AssessmentState;
  result: Result;
}

/**
 * The conversion point. The assessment itself is free; the full report is the
 * thing worth an email address, so this sits between the two.
 *
 * Both paths write the same lead row — Google gives a verified identity, the
 * form gives reach. Neither blocks the visitor from re-taking the assessment.
 */
export function LeadGate({ state, result }: LeadGateProps) {
  const { t, locale } = useApp();
  const { rememberLead, signInWithGoogle, googleEnabled } = useSession();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");

    const assessment: AssessmentPayload = buildAssessmentPayload(state, result);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: name || undefined,
          company: company || state.company.name || undefined,
          jobTitle: jobTitle || undefined,
          phone: phone || undefined,
          industry: state.company.industry || undefined,
          companySize: state.company.size || undefined,
          locale,
          consentMarketing: consent,
          utm: readAttribution(),
          assessment,
        }),
      });

      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error ?? "failed");

      // Only after the row exists. Firing on submit would count the failures
      // as conversions, which is the one number this event exists to get right.
      //
      // Nothing the visitor typed travels with it — not the email, not the
      // name, not the company. What is here is the shape of the conversion:
      // which path, in which language, with the maturity level it bought.
      track("lead_captured", {
        method: "form",
        locale,
        level: result.level,
        consent_marketing: consent,
        // Whether the optional fields earn their place in the form.
        has_phone: phone.length > 0,
        has_job_title: jobTitle.length > 0,
      });

      rememberLead({
        leadId: body.data.leadId,
        assessmentId: body.data.assessmentId,
        email,
        name: name || undefined,
      });
    } catch {
      setStatus("error");
    }
  }

  const perks = [UI.gatePerk1, UI.gatePerk2, UI.gatePerk3, UI.gatePerk4];

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-12">
      <div className="card card-lit glow-accent overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
          {/* Form */}
          <div className="p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cyan)]">
              {t(UI.results)}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {t(UI.gateTitle)}
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
              {t(UI.gateLead)}
            </p>

            {/* Only rendered once the provider is actually switched on in
                Supabase — a Google button that dead-ends costs more leads than
                no Google button at all. */}
            {googleEnabled ? (
              <>
                <button
                  type="button"
                  onClick={() => void signInWithGoogle("/results")}
                  className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2.5 text-[13.5px] font-semibold transition hover:bg-[var(--surface-3)]"
                >
                  <GoogleMark />
                  {t(UI.gateGoogle)}
                </button>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-[var(--border)]" />
                  <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                    {t(UI.gateOr)}
                  </span>
                  <span className="h-px flex-1 bg-[var(--border)]" />
                </div>
              </>
            ) : (
              <div className="mt-6" />
            )}

            <form onSubmit={submit} className="space-y-3">
              <Field
                label={t(UI.gateEmailLabel)}
                placeholder={t(UI.gateEmailPlaceholder)}
                value={email}
                onChange={setEmail}
                type="email"
                autoComplete="email"
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={t(UI.gateNameLabel)}
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                />
                <Field
                  label={t(UI.gateCompanyLabel)}
                  value={company || state.company.name}
                  onChange={setCompany}
                  autoComplete="organization"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={t(UI.gateRoleLabel)}
                  value={jobTitle}
                  onChange={setJobTitle}
                  autoComplete="organization-title"
                />
                <Field
                  label={t(UI.gatePhoneLabel)}
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                  autoComplete="tel"
                />
              </div>

              <label className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                />
                <span className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                  {t(UI.gateConsent)}
                </span>
              </label>

              {status === "error" ? (
                <p
                  role="alert"
                  className="rounded-lg border border-[var(--critical)] bg-[var(--critical)]/10 px-3 py-2 text-[12.5px] text-[var(--text-primary)]"
                >
                  {t(UI.gateError)}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
              >
                {status === "sending" ? t(UI.gateSending) : t(UI.gateSubmit)}
              </button>

              <p className="pt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
                {t(UI.gatePrivacy)}
              </p>
            </form>
          </div>

          {/* What they unlock */}
          <aside className="border-t border-[var(--border)] bg-[var(--surface-2)]/60 p-6 sm:p-8 md:border-l md:border-t-0">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t(UI.gateWhatYouGet)}
            </h2>
            <ul className="mt-4 space-y-3">
              {perks.map((perk) => (
                <li key={perk.en} className="flex gap-2.5">
                  <svg
                    viewBox="0 0 16 16"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      d="m3 8.5 3.2 3L13 4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    {t(perk)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 border-t border-[var(--border)] pt-5">
              <p className="text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                {t(UI.gatePrivacy)}
              </p>
              <a
                href={`mailto:${DATAREV.email}`}
                className="mt-3 inline-block text-[12.5px] font-semibold text-[var(--cyan)] underline-offset-4 hover:underline"
              >
                {DATAREV.email}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
