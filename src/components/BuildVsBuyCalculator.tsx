'use client';

import React, { useState } from 'react';
import {
  evaluateBuildVsBuy,
  BuildVsBuyInputs,
  EngineeringCapacity,
  TimelineUrgency,
  IpDifferentiation,
  MaintenanceCapacity,
  DataPrivacySensitivity,
  BudgetFlexibility,
} from '@/lib/buildVsBuy';

export function BuildVsBuyCalculator() {
  const [inputs, setInputs] = useState<BuildVsBuyInputs>({
    engineeringCapacity: 'medium',
    timelineUrgency: 'medium',
    ipDifferentiation: 'differentiator',
    maintenanceCapacity: 'outsourced',
    dataPrivacy: 'restricted',
    budgetFlexibility: 'enterprise',
  });

  const result = evaluateBuildVsBuy(inputs);

  const updateInput = <K extends keyof BuildVsBuyInputs>(key: K, value: BuildVsBuyInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 text-[#EFE9E4]">
      {/* Header */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#08123a]/80 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-[#00c2ff]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c2ff]">
              DataRev Decision Engine
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Build vs. Buy vs. Hybrid Decision Matrix
            </h2>
            <p className="mt-1 text-sm text-[#A3978F]">
              Evaluate client engineering constraints, IP differentiation goals, data sovereignty rules, and timeline urgency to determine the optimal AI architecture.
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(0,194,255,0.2)] bg-[#04081f] p-4 text-center">
            <span className="text-xs uppercase text-[#A3978F]">Recommendation Fit</span>
            <div className="text-3xl font-extrabold text-[#00c2ff]">{result.confidenceScore}%</div>
            <span className="text-[11px] text-[#8FBF9A]">High Confidence Match</span>
          </div>
        </div>
      </div>

      {/* Input Variable Selectors */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 1. Engineering Capacity */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#04081f]/60 p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A3978F]">
            1. Internal Engineering Capacity
          </label>
          <p className="mb-3 text-xs text-slate-400">Available dev team & MLOps resources</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low', label: 'Low' },
              { id: 'medium', label: 'Medium' },
              { id: 'high', label: 'High' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateInput('engineeringCapacity', opt.id as EngineeringCapacity)}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  inputs.engineeringCapacity === opt.id
                    ? 'bg-[#1763ff] text-white shadow-lg shadow-[#1763ff]/30'
                    : 'border border-[rgba(255,255,255,0.08)] bg-[#08123a]/40 text-[#A3978F] hover:bg-[#08123a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Timeline Urgency */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#04081f]/60 p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A3978F]">
            2. Deployment Urgency
          </label>
          <p className="mb-3 text-xs text-slate-400">Required speed to production</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'immediate', label: '<30 Days' },
              { id: 'medium', label: '1-3 Mos' },
              { id: 'long_term', label: '6+ Mos' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateInput('timelineUrgency', opt.id as TimelineUrgency)}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  inputs.timelineUrgency === opt.id
                    ? 'bg-[#1763ff] text-white shadow-lg shadow-[#1763ff]/30'
                    : 'border border-[rgba(255,255,255,0.08)] bg-[#08123a]/40 text-[#A3978F] hover:bg-[#08123a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. IP Differentiation */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#04081f]/60 p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A3978F]">
            3. IP & Strategic Moat
          </label>
          <p className="mb-3 text-xs text-slate-400">Competitive uniqueness of workflow</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'utility', label: 'Utility' },
              { id: 'differentiator', label: 'Strategic' },
              { id: 'core_ip', label: 'Core IP' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateInput('ipDifferentiation', opt.id as IpDifferentiation)}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  inputs.ipDifferentiation === opt.id
                    ? 'bg-[#1763ff] text-white shadow-lg shadow-[#1763ff]/30'
                    : 'border border-[rgba(255,255,255,0.08)] bg-[#08123a]/40 text-[#A3978F] hover:bg-[#08123a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Maintenance Capacity */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#04081f]/60 p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A3978F]">
            4. Long-Term Maintenance
          </label>
          <p className="mb-3 text-xs text-slate-400">Model monitoring & maintenance team</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'none', label: 'None' },
              { id: 'outsourced', label: 'Partner' },
              { id: 'dedicated', label: 'In-House' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateInput('maintenanceCapacity', opt.id as MaintenanceCapacity)}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  inputs.maintenanceCapacity === opt.id
                    ? 'bg-[#1763ff] text-white shadow-lg shadow-[#1763ff]/30'
                    : 'border border-[rgba(255,255,255,0.08)] bg-[#08123a]/40 text-[#A3978F] hover:bg-[#08123a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Data Privacy */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#04081f]/60 p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A3978F]">
            5. Data Privacy & Sovereignty
          </label>
          <p className="mb-3 text-xs text-slate-400">Data sensitivity & hosting compliance</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'public', label: 'Standard' },
              { id: 'restricted', label: 'Restricted' },
              { id: 'isolated', label: 'Air-Gapped' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateInput('dataPrivacy', opt.id as DataPrivacySensitivity)}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  inputs.dataPrivacy === opt.id
                    ? 'bg-[#1763ff] text-white shadow-lg shadow-[#1763ff]/30'
                    : 'border border-[rgba(255,255,255,0.08)] bg-[#08123a]/40 text-[#A3978F] hover:bg-[#08123a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Budget Flexibility */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#04081f]/60 p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A3978F]">
            6. Capital & Budget Model
          </label>
          <p className="mb-3 text-xs text-slate-400">OpEx SaaS vs CapEx custom investment</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low_opex', label: 'Low OpEx' },
              { id: 'capex', label: 'CapEx' },
              { id: 'enterprise', label: 'Retainer' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateInput('budgetFlexibility', opt.id as BudgetFlexibility)}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  inputs.budgetFlexibility === opt.id
                    ? 'bg-[#1763ff] text-white shadow-lg shadow-[#1763ff]/30'
                    : 'border border-[rgba(255,255,255,0.08)] bg-[#08123a]/40 text-[#A3978F] hover:bg-[#08123a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Recommendation Banner */}
      <div className="rounded-2xl border border-[rgba(0,194,255,0.3)] bg-gradient-to-r from-[#08123a] via-[#04081f] to-[#08123a] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00c2ff]/10 text-xl text-[#00c2ff]">
            ⚡
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00c2ff]">
              Strategic Output
            </span>
            <h3 className="text-xl font-bold text-white">{result.recommendationTitle}</h3>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#EFE9E4]/90">{result.executiveSummary}</p>

        {/* Score Breakdown Bars */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-[#A3978F]">
              <span>Off-the-Shelf SaaS</span>
              <span>{result.scores.saas}%</span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#04081f]">
              <div
                className="h-full bg-slate-400 transition-all duration-500"
                style={{ width: `${result.scores.saas}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#A3978F]">
              <span>Hybrid API Orchestration</span>
              <span>{result.scores.hybrid}%</span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#04081f]">
              <div
                className="h-full bg-[#00c2ff] transition-all duration-500"
                style={{ width: `${result.scores.hybrid}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#A3978F]">
              <span>Custom Engineering</span>
              <span>{result.scores.custom}%</span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#04081f]">
              <div
                className="h-full bg-[#1763ff] transition-all duration-500"
                style={{ width: `${result.scores.custom}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trade-Off Matrix Table */}
      <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#04081f]">
        <div className="border-b border-[rgba(255,255,255,0.08)] bg-[#08123a]/50 p-4">
          <h4 className="font-bold text-white">Architectural Trade-Off Comparison</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#04081f] text-[#A3978F]">
              <tr>
                <th className="p-3">Dimension</th>
                <th className="p-3 text-center">SaaS</th>
                <th className="p-3 text-center">Hybrid API</th>
                <th className="p-3 text-center">Custom Build</th>
                <th className="p-3">Strategic Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.06)] text-[#EFE9E4]">
              {result.tradeOffs.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#08123a]/30">
                  <td className="p-3 font-semibold text-white">{row.dimension}</td>
                  <td className="p-3 text-center font-bold text-slate-300">{row.saasScore}/10</td>
                  <td className="p-3 text-center font-bold text-[#00c2ff]">{row.hybridScore}/10</td>
                  <td className="p-3 text-center font-bold text-[#1763ff]">{row.customScore}/10</td>
                  <td className="p-3 text-[#A3978F]">{row.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended 90-Day Implementation Plan */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#08123a]/40 p-6">
        <h4 className="mb-4 font-bold text-white">Recommended 90-Day Execution Roadmap</h4>
        <div className="grid gap-4 md:grid-cols-3">
          {result.recommendedRoadmap.map((step, idx) => (
            <div key={idx} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#04081f] p-4">
              <span className="text-xs font-semibold text-[#00c2ff]">{step.phase}</span>
              <p className="mt-2 text-xs leading-relaxed text-[#EFE9E4]">{step.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
