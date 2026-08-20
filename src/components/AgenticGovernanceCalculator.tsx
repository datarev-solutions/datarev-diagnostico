'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { GOV } from '@/lib/i18nGovernance';
import type { L } from '@/lib/framework';
import {
  evaluateAgenticFeasibility,
  AgenticFeasibilityInputs,
  ProcessDeterminism,
  ApiMaturity,
  StructuredDataLevel,
  ErrorTolerance,
} from '@/lib/agenticGovernance';
import {
  assessCompliance,
  DATA_CATEGORY_LABEL,
  DOMAIN_LABEL,
  JURISDICTION_LABEL,
  SEVERITY_LABEL,
  type ComplianceInputs,
  type DataCategory,
  type DeploymentDomain,
  type Jurisdiction,
  type RegimeAssessment,
  type Severity,
} from '@/lib/compliance';

/**
 * Severity colours reuse the palette already established for the use-case
 * badges, so a reader who has seen one screen recognises the ranking on the
 * other. Prohibited is the only one that gets a filled background — everything
 * else is a tint, because four loud badges in a column read as noise.
 */
const SEVERITY_STYLE: Record<Severity, string> = {
  not_applicable: 'bg-[#A3978F]/10 text-[#A3978F] border-[#A3978F]/20',
  baseline: 'bg-[#8FBF9A]/10 text-[#8FBF9A] border-[#8FBF9A]/25',
  elevated: 'bg-[#00c2ff]/10 text-[#00c2ff] border-[#00c2ff]/25',
  high: 'bg-[#C9A35A]/10 text-[#C9A35A] border-[#C9A35A]/30',
  prohibited: 'bg-[#E14B52] text-white border-[#E14B52]',
};

const JURISDICTIONS: Jurisdiction[] = ['mexico', 'eu', 'us', 'brazil'];
const DATA_CATEGORIES: DataCategory[] = [
  'none',
  'personal',
  'sensitive',
  'health',
  'biometric',
  'financial',
];
const DOMAINS: DeploymentDomain[] = [
  'internal_analytics',
  'customer_support',
  'recruitment_hr',
  'financial_credit_scoring',
  'biometric_identification',
  'critical_infrastructure',
];

interface SegmentedProps<T extends string> {
  label: L;
  options: { id: T; label: L }[];
  value: T;
  onChange: (next: T) => void;
  columns?: number;
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 3,
}: SegmentedProps<T>) {
  const { t } = useApp();
  return (
    <div>
      <label className="font-semibold text-[#A3978F]">{t(label)}</label>
      <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={`rounded-lg py-1.5 text-[11px] font-medium transition ${
              value === option.id
                ? 'bg-[#1763ff] font-bold text-white'
                : 'bg-[#04081f] text-[#A3978F] hover:bg-[#08123a]'
            }`}
          >
            {t(option.label)}
          </button>
        ))}
      </div>
    </div>
  );
}

function RegimeCard({ regime }: { regime: RegimeAssessment }) {
  const { t } = useApp();
  return (
    <article className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#04081f] p-4">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.06)] pb-2.5">
        <div className="flex items-baseline gap-2">
          <h4 className="text-sm font-bold text-white">{regime.shortName}</h4>
          <span className="text-[10px] uppercase tracking-wide text-[#A3978F]">
            {t(JURISDICTION_LABEL[regime.jurisdiction])}
          </span>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SEVERITY_STYLE[regime.severity]}`}
        >
          {t(SEVERITY_LABEL[regime.severity])}
        </span>
      </header>

      <p className="mt-2 text-[11px] leading-relaxed text-[#A3978F]">{t(regime.fullName)}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#EFE9E4]">{t(regime.summary)}</p>

      <div className="mt-3">
        <span className="text-[10px] font-bold uppercase tracking-wide text-white">
          {t(GOV.obligationsLabel)}
        </span>
        <ul className="mt-1.5 space-y-1 text-xs text-[#A3978F]">
          {regime.obligations.map((obligation, index) => (
            <li key={index} className="flex items-start gap-1.5">
              <span className="mt-px text-[#00c2ff]">✓</span>
              <span>{t(obligation)}</span>
            </li>
          ))}
        </ul>
      </div>

      {regime.timing ? (
        <p className="mt-3 border-t border-[rgba(255,255,255,0.06)] pt-2.5 text-[11px] text-[#C9A35A]">
          <span className="font-bold uppercase tracking-wide">{t(GOV.timingLabel)}: </span>
          {t(regime.timing)}
        </p>
      ) : null}

      {regime.authority ? (
        <p className="mt-1.5 text-[11px] text-[#A3978F]">
          <span className="font-bold uppercase tracking-wide">{t(GOV.authorityLabel)}: </span>
          {t(regime.authority)}
        </p>
      ) : null}
    </article>
  );
}

export function AgenticGovernanceCalculator() {
  const { t } = useApp();

  const [agenticInputs, setAgenticInputs] = useState<AgenticFeasibilityInputs>({
    determinism: 'semi_structured',
    apiMaturity: 'partial_rest',
    structuredData: 'semi_json',
    errorTolerance: 'moderate',
    humanInTheLoop: 'mandatory_approval',
  });

  const [complianceInputs, setComplianceInputs] = useState<ComplianceInputs>({
    jurisdictions: ['mexico'],
    dataCategory: 'personal',
    domain: 'internal_analytics',
    autonomousDecisioning: false,
    userExposure: 'internal_employee',
  });

  const agenticResult = evaluateAgenticFeasibility(agenticInputs);
  const compliance = assessCompliance(complianceInputs);

  const toggleJurisdiction = (jurisdiction: Jurisdiction) => {
    setComplianceInputs((prev) => {
      const active = prev.jurisdictions.includes(jurisdiction);
      return {
        ...prev,
        jurisdictions: active
          ? prev.jurisdictions.filter((item) => item !== jurisdiction)
          : [...prev.jurisdictions, jurisdiction],
      };
    });
  };

  return (
    <div className="space-y-8 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#04081f] p-6 text-[#EFE9E4]">
      <div className="border-b border-[rgba(255,255,255,0.08)] pb-5">
        <span className="rounded-full bg-[#00c2ff]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c2ff]">
          {t(GOV.badge)}
        </span>
        <h2 className="mt-2 text-2xl font-bold text-white">{t(GOV.title)}</h2>
        <p className="mt-1 text-xs text-[#A3978F]">{t(GOV.lead)}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: agentic feasibility */}
        <div className="space-y-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#08123a]/40 p-5">
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
            <span className="text-xl" aria-hidden>🤖</span>
            <h3 className="font-bold text-white">{t(GOV.feasibilityTitle)}</h3>
          </div>

          <div className="space-y-4 text-xs">
            <Segmented
              label={GOV.determinism}
              value={agenticInputs.determinism}
              onChange={(determinism: ProcessDeterminism) =>
                setAgenticInputs((prev) => ({ ...prev, determinism }))
              }
              options={[
                { id: 'rule_based', label: GOV.detRule },
                { id: 'semi_structured', label: GOV.detSemi },
                { id: 'unstructured_creative', label: GOV.detUnstructured },
              ]}
            />
            <Segmented
              label={GOV.apiMaturity}
              value={agenticInputs.apiMaturity}
              onChange={(apiMaturity: ApiMaturity) =>
                setAgenticInputs((prev) => ({ ...prev, apiMaturity }))
              }
              options={[
                { id: 'none', label: GOV.apiNone },
                { id: 'partial_rest', label: GOV.apiPartial },
                { id: 'full_openapi', label: GOV.apiFull },
              ]}
            />
            <Segmented
              label={GOV.dataFoundation}
              value={agenticInputs.structuredData}
              onChange={(structuredData: StructuredDataLevel) =>
                setAgenticInputs((prev) => ({ ...prev, structuredData }))
              }
              options={[
                { id: 'clean_sql', label: GOV.dataSql },
                { id: 'semi_json', label: GOV.dataJson },
                { id: 'raw_unstructured', label: GOV.dataRaw },
              ]}
            />
            <Segmented
              label={GOV.errorTolerance}
              value={agenticInputs.errorTolerance}
              onChange={(errorTolerance: ErrorTolerance) =>
                setAgenticInputs((prev) => ({ ...prev, errorTolerance }))
              }
              options={[
                { id: 'zero_tolerance', label: GOV.errZero },
                { id: 'moderate', label: GOV.errModerate },
                { id: 'high_creative', label: GOV.errHigh },
              ]}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-[rgba(0,194,255,0.2)] bg-[#04081f] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#00c2ff]">
                {t(GOV.readinessModel)}
              </span>
              <span className="text-lg font-extrabold text-[#00c2ff]">{agenticResult.score}/100</span>
            </div>
            <h4 className="text-sm font-bold text-white">{agenticResult.modelTitle}</h4>
            <p className="text-xs leading-relaxed text-[#A3978F]">{agenticResult.description}</p>

            {agenticResult.technicalPrerequisites.length > 0 ? (
              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#00c2ff]">
                  {t(GOV.prerequisites)}
                </span>
                {agenticResult.technicalPrerequisites.map((item, index) => (
                  <p key={index} className="text-[11px] text-[#A3978F]">• {item}</p>
                ))}
              </div>
            ) : null}

            {agenticResult.riskWarnings.length > 0 ? (
              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400">
                  {t(GOV.riskWarnings)}
                </span>
                {agenticResult.riskWarnings.map((warning, index) => (
                  <p key={index} className="text-[11px] text-amber-200">⚠️ {warning}</p>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: multi-jurisdiction compliance */}
        <div className="space-y-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#08123a]/40 p-5">
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
            <span className="text-xl" aria-hidden>⚖️</span>
            <h3 className="font-bold text-white">{t(GOV.complianceTitle)}</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Jurisdictions — multi-select, because most clients are in more than one */}
            <div>
              <label className="font-semibold text-[#A3978F]">{t(GOV.jurisdictions)}</label>
              <p className="mt-0.5 text-[10px] text-[#A3978F]/70">{t(GOV.jurisdictionsHint)}</p>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {JURISDICTIONS.map((jurisdiction) => {
                  const active = complianceInputs.jurisdictions.includes(jurisdiction);
                  return (
                    <button
                      key={jurisdiction}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleJurisdiction(jurisdiction)}
                      className={`rounded-lg py-1.5 text-[11px] font-medium transition ${
                        active
                          ? 'bg-[#1763ff] font-bold text-white'
                          : 'bg-[#04081f] text-[#A3978F] hover:bg-[#08123a]'
                      }`}
                    >
                      {t(JURISDICTION_LABEL[jurisdiction])}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data category — the axis the old EU-only classifier had no way to express */}
            <div>
              <label className="font-semibold text-[#A3978F]">{t(GOV.dataCategory)}</label>
              <p className="mt-0.5 text-[10px] text-[#A3978F]/70">{t(GOV.dataCategoryHint)}</p>
              <select
                value={complianceInputs.dataCategory}
                onChange={(event) =>
                  setComplianceInputs((prev) => ({
                    ...prev,
                    dataCategory: event.target.value as DataCategory,
                  }))
                }
                className="mt-1.5 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#04081f] p-2 text-xs text-white"
              >
                {DATA_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(DATA_CATEGORY_LABEL[category])}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#A3978F]">{t(GOV.domain)}</label>
              <select
                value={complianceInputs.domain}
                onChange={(event) =>
                  setComplianceInputs((prev) => ({
                    ...prev,
                    domain: event.target.value as DeploymentDomain,
                  }))
                }
                className="mt-1.5 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#04081f] p-2 text-xs text-white"
              >
                {DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>
                    {t(DOMAIN_LABEL[domain])}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#04081f] p-3">
              <div>
                <span className="font-semibold text-white">{t(GOV.autonomous)}</span>
                <p className="text-[10px] text-[#A3978F]">{t(GOV.autonomousHint)}</p>
              </div>
              <input
                type="checkbox"
                checked={complianceInputs.autonomousDecisioning}
                onChange={(event) =>
                  setComplianceInputs((prev) => ({
                    ...prev,
                    autonomousDecisioning: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded accent-[#1763ff]"
              />
            </div>

            <Segmented
              label={GOV.exposure}
              columns={2}
              value={complianceInputs.userExposure}
              onChange={(userExposure: ComplianceInputs['userExposure']) =>
                setComplianceInputs((prev) => ({ ...prev, userExposure }))
              }
              options={[
                { id: 'internal_employee', label: GOV.exposureInternal },
                { id: 'public_consumer', label: GOV.exposurePublic },
              ]}
            />
          </div>

          {/* Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#A3978F]">
                {t(GOV.regimesApplying)}
              </span>
              <span className="text-lg font-extrabold text-[#00c2ff]">
                {compliance.regimes.length}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#EFE9E4]">{t(compliance.headline)}</p>

            {compliance.crossAxisWarning ? (
              <p className="rounded-lg border border-[#C9A35A]/30 bg-[#C9A35A]/10 p-3 text-[11px] leading-relaxed text-[#C9A35A]">
                ⚠️ {t(compliance.crossAxisWarning)}
              </p>
            ) : null}

            {compliance.regimes.length === 0 ? (
              <p className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#04081f] p-4 text-xs text-[#A3978F]">
                {t(GOV.noJurisdiction)}
              </p>
            ) : (
              <div className="space-y-3">
                {compliance.regimes.map((regime) => (
                  <RegimeCard key={regime.id} regime={regime} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="border-t border-[rgba(255,255,255,0.08)] pt-4 text-[11px] leading-relaxed text-[#A3978F]">
        {t(GOV.notLegalAdvice)}
      </p>
    </div>
  );
}
