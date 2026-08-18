'use client';

import React from 'react';
import type { DimensionId } from '@/lib/framework';

export interface ExecutiveBlueprintPDFProps {
  score: number;
  level: number;
  stageName: string;
  dimensionScores: Record<DimensionId, number>;
  topGaps: string[];
  dateStr?: string;
  clientDomain?: string;
}

export function ExecutiveBlueprintPDF({
  score,
  level,
  stageName,
  dimensionScores,
  topGaps,
  dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
  clientDomain = 'Empresa Prospecto',
}: ExecutiveBlueprintPDFProps) {
  return (
    <div className="hidden print:block text-[#04081f] bg-white p-8 space-y-8 font-sans">
      {/* Document Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1763ff]">
            DataRev Advisory Deliverable
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#04081f]">
            Executive AI & Data Blueprint
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Preparado para: <strong className="text-slate-800">{clientDomain}</strong> | Fecha: {dateStr}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-black tracking-wider text-[#08123a]">DATA REV</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">datarev.solutions</div>
        </div>
      </div>

      {/* Maturity Executive Summary */}
      <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-center border-r border-slate-200 pr-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Puntaje Global</span>
          <div className="text-3xl font-extrabold text-[#1763ff] mt-1">{score.toFixed(2)} / 5.0</div>
        </div>
        <div className="text-center border-r border-slate-200 pr-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Nivel Acreditado</span>
          <div className="text-3xl font-extrabold text-[#08123a] mt-1">Nivel {level}</div>
        </div>
        <div className="text-center">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Etapa Operativa</span>
          <div className="text-lg font-bold text-[#00c2ff] mt-2">{stageName}</div>
        </div>
      </div>

      {/* Multi-Dimension Breakdown */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#04081f] mb-3">
          1. Diagnóstico por Dimensiones Clave
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(dimensionScores).map(([dim, dimScore]) => (
            <div key={dim} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex justify-between text-xs font-semibold text-slate-700 capitalize">
                <span>{dim}</span>
                <span className="text-[#1763ff] font-bold">{(dimScore || 0).toFixed(1)} / 5.0</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-[#1763ff]"
                  style={{ width: `${((dimScore || 0) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 90-Day Implementation Roadmap */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#04081f] mb-3">
          2. Plan de Ejecución Prioritario (Roadmap 90 Días)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs font-bold text-[#1763ff] uppercase">Fase 1: Fundamentos (Días 1–30)</span>
            <ul className="mt-2 text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Auditoría de linaje de datos y catálogo semántico.</li>
              <li>Definición de guardarraíles de seguridad y privacidad.</li>
              <li>Alineación de patrocinio ejecutivo CTO/CFO.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs font-bold text-[#00c2ff] uppercase">Fase 2: Piloto Agéntico (Días 30–60)</span>
            <ul className="mt-2 text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Construcción de sandbox MLOps y RAG empresarial.</li>
              <li>Despliegue de Copilot o Agente Semi-Autónomo.</li>
              <li>Evaluación de precisión, latencia y alucinaciones.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs font-bold text-[#08123a] uppercase">Fase 3: Escalabilidad (Días 60–90)</span>
            <ul className="mt-2 text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Integración con SSO y conectores OpenAPI de producción.</li>
              <li>Monitoreo continuo de MLOps y auditoría EU AI Act.</li>
              <li>Gestión del cambio y capacitación por rol.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Top Operational Gaps & Governance */}
      {topGaps && topGaps.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#04081f] mb-2">
            3. Brechas Críticas de Madurez a Resolver
          </h3>
          <ul className="grid grid-cols-2 gap-2 text-xs text-slate-700">
            {topGaps.slice(0, 4).map((gap, idx) => (
              <li key={idx} className="rounded-md border border-amber-200 bg-amber-50/50 p-2.5 flex items-start gap-2">
                <span className="text-amber-600 font-bold">⚠️</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* DataRev Advisory Call to Action */}
      <div className="rounded-xl border border-[#1763ff]/30 bg-[#08123a] text-white p-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-[#00c2ff] uppercase">Sesión Estratégica Incluida</div>
          <h4 className="text-base font-bold">Revisión en Vivo de Blueprint (1 Hora sin Costo)</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Analiza este plan con un consultor senior de DataRev y valida la arquitectura de tu empresa.
          </p>
        </div>
        <div className="text-right text-xs">
          <div className="font-bold text-[#00c2ff]">datarev.solutions</div>
          <div className="text-slate-300">+52 (55) 9199-6815</div>
        </div>
      </div>
    </div>
  );
}
