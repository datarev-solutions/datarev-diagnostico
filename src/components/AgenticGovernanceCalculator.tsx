'use client';

import React, { useState } from 'react';
import {
  evaluateAgenticFeasibility,
  classifyEuAiActRisk,
  AgenticFeasibilityInputs,
  EuAiActInputs,
  ProcessDeterminism,
  ApiMaturity,
  StructuredDataLevel,
  ErrorTolerance,
  HumanInTheLoopLevel,
  DeploymentDomain,
} from '@/lib/agenticGovernance';

export function AgenticGovernanceCalculator() {
  const [agenticInputs, setAgenticInputs] = useState<AgenticFeasibilityInputs>({
    determinism: 'semi_structured',
    apiMaturity: 'partial_rest',
    structuredData: 'semi_json',
    errorTolerance: 'moderate',
    humanInTheLoop: 'mandatory_approval',
  });

  const [euInputs, setEuInputs] = useState<EuAiActInputs>({
    domain: 'recruitment_hr',
    autonomousDecisioning: false,
    userExposure: 'internal_employee',
  });

  const agenticResult = evaluateAgenticFeasibility(agenticInputs);
  const euResult = classifyEuAiActRisk(euInputs);

  return (
    <div className="space-y-8 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#04081f] p-6 text-[#EFE9E4]">
      {/* Tool Header */}
      <div className="border-b border-[rgba(255,255,255,0.08)] pb-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-[#00c2ff]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c2ff]">
              Interactive Diagnostic Tool
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Agentic Feasibility & EU AI Act Risk Calculator
            </h2>
            <p className="mt-1 text-xs text-[#A3978F]">
              Test any custom workflow for multi-agent readiness, tool-calling maturity, and EU AI Act regulatory risk tiering.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Agentic Feasibility Evaluator */}
        <div className="space-y-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#08123a]/40 p-5">
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
            <span className="text-xl">🤖</span>
            <h3 className="font-bold text-white">1. Agentic Workflow Feasibility Evaluator</h3>
          </div>

          {/* Controls */}
          <div className="space-y-4 text-xs">
            {/* Determinism */}
            <div>
              <label className="font-semibold text-[#A3978F]">Process Determinism</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { id: 'rule_based', label: 'Deterministic' },
                  { id: 'semi_structured', label: 'Semi-Structured' },
                  { id: 'unstructured_creative', label: 'Unstructured' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setAgenticInputs((prev) => ({ ...prev, determinism: opt.id as ProcessDeterminism }))
                    }
                    className={`rounded-lg py-1.5 text-[11px] font-medium transition ${
                      agenticInputs.determinism === opt.id
                        ? 'bg-[#1763ff] text-white font-bold'
                        : 'bg-[#04081f] text-[#A3978F] hover:bg-[#08123a]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* API Maturity */}
            <div>
              <label className="font-semibold text-[#A3978F]">API & Tool Connectivity</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'No APIs' },
                  { id: 'partial_rest', label: 'Partial REST' },
                  { id: 'full_openapi', label: 'OpenAPI / Swagger' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAgenticInputs((prev) => ({ ...prev, apiMaturity: opt.id as ApiMaturity }))}
                    className={`rounded-lg py-1.5 text-[11px] font-medium transition ${
                      agenticInputs.apiMaturity === opt.id
                        ? 'bg-[#1763ff] text-white font-bold'
                        : 'bg-[#04081f] text-[#A3978F] hover:bg-[#08123a]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Data */}
            <div>
              <label className="font-semibold text-[#A3978F]">Data Foundation</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { id: 'clean_sql', label: 'Clean SQL' },
                  { id: 'semi_json', label: 'Semi-JSON' },
                  { id: 'raw_unstructured', label: 'Raw Unstructured' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setAgenticInputs((prev) => ({ ...prev, structuredData: opt.id as StructuredDataLevel }))
                    }
                    className={`rounded-lg py-1.5 text-[11px] font-medium transition ${
                      agenticInputs.structuredData === opt.id
                        ? 'bg-[#1763ff] text-white font-bold'
                        : 'bg-[#04081f] text-[#A3978F] hover:bg-[#08123a]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Tolerance */}
            <div>
              <label className="font-semibold text-[#A3978F]">Error Tolerance</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { id: 'zero_tolerance', label: 'Zero Tolerance' },
                  { id: 'moderate', label: 'Moderate' },
                  { id: 'high_creative', label: 'High Creative' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAgenticInputs((prev) => ({ ...prev, errorTolerance: opt.id as ErrorTolerance }))}
                    className={`rounded-lg py-1.5 text-[11px] font-medium transition ${
                      agenticInputs.errorTolerance === opt.id
                        ? 'bg-[#1763ff] text-white font-bold'
                        : 'bg-[#04081f] text-[#A3978F] hover:bg-[#08123a]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Output Card */}
          <div className="rounded-xl border border-[rgba(0,194,255,0.2)] bg-[#04081f] p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase text-[#00c2ff]">Readiness Model</span>
              <span className="text-lg font-extrabold text-[#00c2ff]">{agenticResult.score}/100</span>
            </div>
            <h4 className="font-bold text-white text-sm">{agenticResult.modelTitle}</h4>
            <p className="text-xs text-[#A3978F] leading-relaxed">{agenticResult.description}</p>

            {agenticResult.riskWarnings.length > 0 ? (
              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Operational Risk Warnings</span>
                {agenticResult.riskWarnings.map((w, idx) => (
                  <p key={idx} className="text-[11px] text-amber-200">
                    ⚠️ {w}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: EU AI Act Risk Classifier */}
        <div className="space-y-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#08123a]/40 p-5">
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
            <span className="text-xl">⚖️</span>
            <h3 className="font-bold text-white">2. EU AI Act Regulatory Risk Classifier</h3>
          </div>

          {/* Controls */}
          <div className="space-y-4 text-xs">
            {/* Domain */}
            <div>
              <label className="font-semibold text-[#A3978F]">Operational Deployment Domain</label>
              <select
                value={euInputs.domain}
                onChange={(e) => setEuInputs((prev) => ({ ...prev, domain: e.target.value as DeploymentDomain }))}
                className="mt-1.5 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#04081f] p-2 text-xs text-white"
              >
                <option value="recruitment_hr">Employment & HR Recruitment (Annex III)</option>
                <option value="financial_credit_scoring">Financial Credit & Loan Scoring (Annex III)</option>
                <option value="biometric_identification">Biometric Identification & Categorization (Art. 5 / Annex III)</option>
                <option value="customer_support">Customer Service & Chatbots (Art. 50)</option>
                <option value="internal_analytics">Internal Operational Analytics (Minimal Risk)</option>
                <option value="critical_infrastructure">Critical Infrastructure & Utilities (Annex III)</option>
              </select>
            </div>

            {/* Autonomous Decisioning */}
            <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#04081f] p-3">
              <div>
                <span className="font-semibold text-white">Autonomous Decisioning</span>
                <p className="text-[10px] text-[#A3978F]">System acts without human override review</p>
              </div>
              <input
                type="checkbox"
                checked={euInputs.autonomousDecisioning}
                onChange={(e) => setEuInputs((prev) => ({ ...prev, autonomousDecisioning: e.target.checked }))}
                className="h-4 w-4 rounded accent-[#1763ff]"
              />
            </div>

            {/* User Exposure */}
            <div>
              <label className="font-semibold text-[#A3978F]">Target User Exposure</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {[
                  { id: 'internal_employee', label: 'Internal Staff Only' },
                  { id: 'public_consumer', label: 'Public Consumer' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setEuInputs((prev) => ({ ...prev, userExposure: opt.id as 'internal_employee' | 'public_consumer' }))
                    }
                    className={`rounded-lg py-1.5 text-[11px] font-medium transition ${
                      euInputs.userExposure === opt.id
                        ? 'bg-[#1763ff] text-white font-bold'
                        : 'bg-[#04081f] text-[#A3978F] hover:bg-[#08123a]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* EU Result Card */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#04081f] p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase text-[#A3978F]">EU Regulatory Status</span>
              <span className="rounded-full bg-[#1763ff]/20 px-2.5 py-0.5 text-xs font-bold text-[#00c2ff]">
                {euResult.tierTitle}
              </span>
            </div>
            <p className="text-xs text-[#EFE9E4] leading-relaxed">{euResult.summary}</p>

            <div className="mt-3 border-t border-[rgba(255,255,255,0.06)] pt-3">
              <span className="text-[11px] font-bold text-white uppercase">Mandatory Compliance Audit Checklist</span>
              <ul className="mt-2 space-y-1 text-xs text-[#A3978F]">
                {euResult.mandatoryComplianceChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#00c2ff]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
