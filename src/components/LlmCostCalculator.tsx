"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/components/AppProvider";
import { CALC } from "@/lib/i18nCalc";
import {
  FRONTIER_MODELS,
  POPULAR_PROMPTS,
  LAB_SAMPLES,
  REFERENCES,
  tokEst,
  sig2,
  type LlmModel,
} from "@/lib/llmModels";

type RankMode = "cost" | "adj" | "ctx" | "speed";

export function LlmCostCalculator() {
  const { t, locale } = useApp();
  const [subTab, setSubTab] = useState<"calc" | "lab">("calc");
  const [models, setModels] = useState<LlmModel[]>(FRONTIER_MODELS);

  // Fetch live models from API if available
  useEffect(() => {
    fetch("/api/llm-models")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.models && Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
        }
      })
      .catch(() => {
        // Fallback to static FRONTIER_MODELS
      });
  }, []);

  // --- Calculator Tab State ---
  const [inTok, setInTok] = useState<number>(2000);
  const [outTok, setOutTok] = useState<number>(500);
  const [reqsLog, setReqsLog] = useState<number>(80); // 10,000 requests
  const [cachePct, setCachePct] = useState<number>(20);
  const [activePreset, setActivePreset] = useState<string>("wp-0");

  const [promptText, setPromptText] = useState<string>("");
  const [responseText, setResponseText] = useState<string>("");
  const [activePromptPreset, setActivePromptPreset] = useState<string | null>(null);

  const [mode, setMode] = useState<RankMode>("cost");

  // Number formatters
  const nf = useMemo(() => new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US"), [locale]);

  const reqVal = useMemo(() => sig2(Math.pow(10, reqsLog / 20)), [reqsLog]);

  const fmtUSD = (n: number) => {
    if (n === 0) return "$0";
    if (n < 0.001) return "$" + n.toFixed(5);
    if (n < 0.01) return "$" + n.toFixed(4);
    if (n < 1) return "$" + n.toFixed(3);
    if (n < 100) return "$" + n.toFixed(2);
    return "$" + nf.format(Math.round(n));
  };

  const fmtPrice = (n: number | null) => {
    if (n == null) return "—";
    const rounded = n.toFixed(2);
    return "$" + (Math.abs(n - parseFloat(rounded)) > 1e-9 ? String(n) : rounded);
  };

  // Preset setter
  const setP = (i: number, o: number, r: number, c: number, id: string) => {
    setInTok(i);
    setOutTok(o);
    setReqsLog(Math.round(20 * Math.log10(r)));
    setCachePct(c);
    setActivePreset(id);
    setActivePromptPreset(null);
  };

  // Prompt loader
  const loadPrompt = (idx: number) => {
    const p = POPULAR_PROMPTS[idx];
    setPromptText(p.q);
    setResponseText(p.a);
    setActivePromptPreset("pp-" + idx);
    setActivePreset("");

    const eQ = tokEst(p.q);
    const inVal = Math.min(100000, Math.max(100, Math.round(eQ.tokens / 100) * 100));
    setInTok(inVal);

    const eA = tokEst(p.a);
    const outVal = Math.min(20000, Math.max(50, Math.round(eA.tokens / 50) * 50));
    setOutTok(outVal);
  };

  // Sync prompt typing
  const handlePromptChange = (val: string) => {
    setPromptText(val);
    setActivePreset("");
    setActivePromptPreset(null);
    if (val.trim()) {
      const e = tokEst(val);
      const inVal = Math.min(100000, Math.max(100, Math.round(e.tokens / 100) * 100));
      setInTok(inVal);
    }
  };

  const handleResponseChange = (val: string) => {
    setResponseText(val);
    setActivePreset("");
    setActivePromptPreset(null);
    if (val.trim()) {
      const e = tokEst(val);
      const outVal = Math.min(20000, Math.max(50, Math.round(e.tokens / 50) * 50));
      setOutTok(outVal);
    }
  };

  // Computations
  const computed = useMemo(() => {
    const h = cachePct / 100;
    return models.map((m) => {
      const effIn = m.pc == null ? m.pin : (1 - h) * m.pin + h * m.pc;
      const perReq = (inTok * effIn + outTok * m.pout) / 1e6;
      const adjPerReq = (inTok * effIn + outTok * m.eff * m.pout) / 1e6;
      return {
        ...m,
        perReq,
        month: perReq * reqVal,
        adjMonth: adjPerReq * reqVal,
      };
    });
  }, [models, inTok, outTok, reqVal, cachePct]);

  const byMonth = useMemo(() => [...computed].sort((a, b) => a.month - b.month), [computed]);
  const byAdj = useMemo(() => [...computed].sort((a, b) => a.adjMonth - b.adjMonth), [computed]);
  const byCtx = useMemo(() => [...computed].sort((a, b) => b.ctxT - a.ctxT), [computed]);
  const bySpd = useMemo(() => [...computed].sort((a, b) => b.spd - a.spd), [computed]);

  const sortedRows = useMemo(() => {
    const list = [...computed];
    if (mode === "cost") list.sort((a, b) => a.month - b.month);
    else if (mode === "adj") list.sort((a, b) => a.adjMonth - b.adjMonth);
    else if (mode === "ctx") list.sort((a, b) => b.ctxT - a.ctxT);
    else if (mode === "speed") list.sort((a, b) => b.spd - a.spd);
    return list;
  }, [computed, mode]);

  const barMax = useMemo(() => {
    if (mode === "cost") return Math.max(...computed.map((c) => c.month)) || 1;
    if (mode === "adj") return Math.max(...computed.map((c) => c.adjMonth)) || 1;
    if (mode === "ctx") return Math.max(...computed.map((c) => c.ctxT)) || 1;
    return Math.max(...computed.map((c) => c.spd)) || 1;
  }, [computed, mode]);

  // --- Lab Tab State ---
  const [labInText, setLabInText] = useState<string>(LAB_SAMPLES[0].q);
  const [labOutText, setLabOutText] = useState<string>(LAB_SAMPLES[0].a);
  const [labCalls, setLabCalls] = useState<number>(10000);
  const [activeLabSample, setActiveLabSample] = useState<string>("ls-0");
  const [activeLabCallPreset, setActiveLabCallPreset] = useState<string>("lc-1");
  const [copied, setCopied] = useState<boolean>(false);

  const loadLabSample = (idx: number) => {
    setLabInText(LAB_SAMPLES[idx].q);
    setLabOutText(LAB_SAMPLES[idx].a);
    setActiveLabSample("ls-" + idx);
  };

  const setCalls = (n: number, id: string) => {
    setLabCalls(n);
    setActiveLabCallPreset(id);
  };

  const labInEst = useMemo(() => tokEst(labInText), [labInText]);
  const labOutEst = useMemo(() => tokEst(labOutText), [labOutText]);

  const labRows = useMemo(() => {
    const n = Math.max(1, Math.round(labCalls || 1));
    return models
      .map((m) => {
        const per = (labInEst.tokens * m.pin + labOutEst.tokens * m.pout) / 1e6;
        return { name: m.name, co: m.co, per, total: per * n };
      })
      .sort((x, y) => x.total - y.total);
  }, [models, labInEst, labOutEst, labCalls]);

  const labMaxTotal = useMemo(() => labRows[labRows.length - 1]?.total || 1, [labRows]);

  const copyLabResults = () => {
    const n = Math.max(1, Math.round(labCalls || 1));
    const lines = [
      `Assignment 1.1 — Cost evaluation (${new Date().toLocaleDateString("en-US")})`,
      `Input: ~${labInEst.tokens} tokens (${labInEst.words} words). Output: ~${labOutEst.tokens} tokens (${labOutEst.words} words).`,
      `API calls per month: ${nf.format(n)}`,
      "",
      "Model | $/interaction | $/month",
    ];
    labRows.forEach((r) => lines.push(`${r.name} | ${fmtUSD(r.per)} | ${fmtUSD(r.total)}`));
    lines.push("");
    if (labRows.length > 0) {
      const lo = labRows[0].total;
      const hi = labRows[labRows.length - 1].total;
      lines.push(
        `Range: ${fmtUSD(lo)} to ${fmtUSD(hi)} — ${(hi / (lo || 1)).toFixed(1)}x difference.`
      );
    }
    const text = lines.join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Illustrative token visualizer for Lab
  const labVizOutput = useMemo(() => {
    const colors = ["#efe7f9", "#e2f0e7", "#fdeede", "#e4edf8"];
    const slice = labInText.slice(0, 300);
    if (!slice.trim()) return null;

    let ci = 0;
    const parts = slice.split(/(\s+)/);
    return (
      <>
        {parts.map((w, i) => {
          if (!w.trim()) return <React.Fragment key={i}>{w}</React.Fragment>;
          const chunks = [];
          for (let j = 0; j < w.length; j += 4) {
            const chunk = w.slice(j, j + 4);
            const color = colors[ci % colors.length];
            ci++;
            chunks.push(
              <span
                key={j}
                style={{ background: color }}
                className="mx-[1px] rounded px-[3px] py-[1px] text-[13px] text-gray-900"
              >
                {chunk}
              </span>
            );
          }
          return <React.Fragment key={i}>{chunks}</React.Fragment>;
        })}
        {labInText.length > 300 ? (
          <span className="text-[11px] text-[var(--text-muted)]"> … (first 300 characters shown)</span>
        ) : null}
      </>
    );
  }, [labInText]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Sub-Tab Header */}
      <div className="card card-lit p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {t(CALC.llmTitle)}
            </h1>
            <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
              {t(CALC.llmSubtitle)}
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-1">
            <button
              type="button"
              onClick={() => setSubTab("calc")}
              className={`rounded-md px-4 py-2 text-[13px] font-semibold transition ${
                subTab === "calc"
                  ? "bg-[#A31F34] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t(CALC.tabCalc)}
            </button>
            <button
              type="button"
              onClick={() => setSubTab("lab")}
              className={`rounded-md px-4 py-2 text-[13px] font-semibold transition ${
                subTab === "lab"
                  ? "bg-[#A31F34] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t(CALC.tabLab)}
            </button>
          </div>
        </div>
      </div>

      {subTab === "calc" ? (
        <div className="space-y-6">
          {/* Workload Presets & Controls */}
          <section className="card card-lit p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-[var(--text-secondary)]">
                {t(CALC.workloadPresets)}
              </span>
              {[
                { id: "wp-0", label: t(CALC.presetChatbot), i: 2000, o: 500, r: 10000, c: 20 },
                { id: "wp-1", label: t(CALC.presetRag), i: 40000, o: 1500, r: 5000, c: 60 },
                { id: "wp-2", label: t(CALC.presetCoding), i: 60000, o: 8000, r: 20000, c: 80 },
                { id: "wp-3", label: t(CALC.presetBatch), i: 10000, o: 2000, r: 100000, c: 0 },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setP(p.i, p.o, p.r, p.c, p.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                    activePreset === p.id
                      ? "border-[#A31F34] bg-[#A31F34] text-white"
                      : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:border-[#A31F34] hover:text-[#A31F34]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-baseline justify-between text-[12.5px] font-medium">
                  <span className="text-[var(--text-secondary)]">{t(CALC.inputTokensLabel)}</span>
                  <span className="tnum font-bold text-[var(--text-primary)]">{nf.format(inTok)}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={100000}
                  step={100}
                  value={inTok}
                  onChange={(e) => {
                    setInTok(Number(e.target.value));
                    setActivePreset("");
                    setActivePromptPreset(null);
                  }}
                  className="mt-2.5 w-full accent-[#A31F34]"
                />
              </div>

              <div>
                <div className="flex items-baseline justify-between text-[12.5px] font-medium">
                  <span className="text-[var(--text-secondary)]">{t(CALC.outputTokensLabel)}</span>
                  <span className="tnum font-bold text-[var(--text-primary)]">{nf.format(outTok)}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={20000}
                  step={50}
                  value={outTok}
                  onChange={(e) => {
                    setOutTok(Number(e.target.value));
                    setActivePreset("");
                    setActivePromptPreset(null);
                  }}
                  className="mt-2.5 w-full accent-[#A31F34]"
                />
              </div>

              <div>
                <div className="flex items-baseline justify-between text-[12.5px] font-medium">
                  <span className="text-[var(--text-secondary)]">{t(CALC.requestsPerMonthLabel)}</span>
                  <span className="tnum font-bold text-[var(--text-primary)]">{nf.format(reqVal)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={1}
                  value={reqsLog}
                  onChange={(e) => {
                    setReqsLog(Number(e.target.value));
                    setActivePreset("");
                    setActivePromptPreset(null);
                  }}
                  className="mt-2.5 w-full accent-[#A31F34]"
                />
              </div>

              <div>
                <div className="flex items-baseline justify-between text-[12.5px] font-medium">
                  <span className="text-[var(--text-secondary)]">{t(CALC.cacheHitRateLabel)}</span>
                  <span className="tnum font-bold text-[var(--text-primary)]">{cachePct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={cachePct}
                  onChange={(e) => {
                    setCachePct(Number(e.target.value));
                    setActivePreset("");
                    setActivePromptPreset(null);
                  }}
                  className="mt-2.5 w-full accent-[#A31F34]"
                />
              </div>
            </div>

            {/* Size it from a real interaction */}
            <div className="border-t border-[var(--border)] pt-5">
              <p className="text-[13px] text-[var(--text-muted)]">{t(CALC.sizeFromInteraction)}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                  {t(CALC.popularPrompts)}
                </span>
                {[
                  { label: locale === "es" ? "Apología cliente" : "Client apology email", i: 0 },
                  { label: locale === "es" ? "Descripción puesto" : "Job description", i: 1 },
                  { label: locale === "es" ? "Explicar IA ejecutivos" : "Explain AI to executives", i: 2 },
                  { label: locale === "es" ? "Posts LinkedIn" : "LinkedIn posts", i: 3 },
                  { label: locale === "es" ? "Consulta SQL" : "SQL query", i: 4 },
                ].map((p) => (
                  <button
                    key={p.i}
                    type="button"
                    onClick={() => loadPrompt(p.i)}
                    className={`rounded-full border px-3 py-1 text-[12px] transition ${
                      activePromptPreset === "pp-" + p.i
                        ? "border-[#A31F34] bg-[#A31F34] text-white"
                        : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                    {t(CALC.promptInputLabel)}
                  </label>
                  <textarea
                    rows={4}
                    value={promptText}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    placeholder={t(CALC.promptInputPlaceholder)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] p-3 text-[13px] text-[var(--text-primary)] focus:border-[#A31F34] focus:outline-none"
                  />
                  <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                    {promptText.trim() ? (
                      <>
                        ≈ <strong>{nf.format(tokEst(promptText).tokens)} tokens</strong> (
                        {nf.format(tokEst(promptText).words)} {locale === "es" ? "palabras" : "words"})
                      </>
                    ) : (
                      locale === "es" ? "Pega un prompt o elige una muestra de arriba." : "Paste a prompt or pick a sample above."
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                    {t(CALC.responseOutputLabel)}
                  </label>
                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={(e) => handleResponseChange(e.target.value)}
                    placeholder={t(CALC.responseOutputPlaceholder)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] p-3 text-[13px] text-[var(--text-primary)] focus:border-[#A31F34] focus:outline-none"
                  />
                  <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                    {responseText.trim() ? (
                      <>
                        ≈ <strong>{nf.format(tokEst(responseText).tokens)} tokens</strong> (
                        {nf.format(tokEst(responseText).words)} {locale === "es" ? "palabras" : "words"})
                      </>
                    ) : (
                      locale === "es" ? "Pega una respuesta o elige una muestra." : "Paste an answer or pick a sample above."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stat Summary Cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="card card-lit p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(CALC.statCheapest)}
              </p>
              <p className="tnum mt-1 text-[22px] font-bold text-[var(--text-primary)]">
                {byMonth[0] ? fmtUSD(byMonth[0].month) : "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] truncate">
                {byMonth[0] ? `${byMonth[0].name} · ${byMonth[0].co}` : "—"}
              </p>
            </div>

            <div className="card card-lit p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(CALC.statMostExpensive)}
              </p>
              <p className="tnum mt-1 text-[22px] font-bold text-[var(--text-primary)]">
                {byMonth[byMonth.length - 1] ? fmtUSD(byMonth[byMonth.length - 1].month) : "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] truncate">
                {byMonth[byMonth.length - 1]
                  ? `${byMonth[byMonth.length - 1].name} · ${byMonth[byMonth.length - 1].co}`
                  : "—"}
              </p>
            </div>

            <div className="card card-lit p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(CALC.statPriceSpread)}
              </p>
              <p className="tnum mt-1 text-[22px] font-bold text-[var(--text-primary)]">
                {byMonth.length > 0 && byMonth[0].month > 0
                  ? `${(byMonth[byMonth.length - 1].month / byMonth[0].month).toFixed(1)}×`
                  : "—"}
              </p>
              <p className="mt-0.5 text-[10.5px] text-[var(--text-secondary)]">
                {t(CALC.statSpreadSub)}
              </p>
            </div>

            <div className="card card-lit p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(CALC.statBestValue)}
              </p>
              <p className="tnum mt-1 text-[22px] font-bold text-[var(--text-primary)]">
                {byAdj[0] ? fmtUSD(byAdj[0].adjMonth) : "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] truncate">
                {byAdj[0] ? `${byAdj[0].name} · thinking overhead applied` : "—"}
              </p>
            </div>

            <div className="card card-lit p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(CALC.statLargestContext)}
              </p>
              <p className="tnum mt-1 text-[22px] font-bold text-[var(--text-primary)]">
                {byCtx[0] ? byCtx[0].ctx + " tokens" : "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] truncate">
                {byCtx[0] ? `${byCtx[0].name} · ${byCtx[0].co}` : "—"}
              </p>
            </div>

            <div className="card card-lit p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t(CALC.statFastest)}
              </p>
              <p className="tnum mt-1 text-[22px] font-bold text-[var(--text-primary)]">
                {bySpd[0] ? bySpd[0].speed + " t/s" : "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] truncate">
                {bySpd[0] ? `${bySpd[0].name} · ${bySpd[0].co}` : "—"}
              </p>
            </div>
          </section>

          {/* Model Comparison Table */}
          <section className="card card-lit p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                {t(CALC.modelComparisonTitle)}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                  {t(CALC.rankByLabel)}
                </span>
                {[
                  { id: "cost" as const, label: t(CALC.rankMonthlyCost) },
                  { id: "adj" as const, label: t(CALC.rankEfficiencyAdj) },
                  { id: "ctx" as const, label: t(CALC.rankContextWindow) },
                  { id: "speed" as const, label: t(CALC.rankSpeed) },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
                      mode === m.id
                        ? "border-[#A31F34] bg-[#A31F34] text-white"
                        : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full min-w-[950px] border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-1)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-3 px-4">{t(CALC.colModel)}</th>
                    <th className="py-3 px-3 text-right">{t(CALC.colContext)}</th>
                    <th className="py-3 px-3 text-right">{t(CALC.colInputPrice)}</th>
                    <th className="py-3 px-3 text-right">{t(CALC.colCachedPrice)}</th>
                    <th className="py-3 px-3 text-right">{t(CALC.colOutputPrice)}</th>
                    <th className="py-3 px-3 text-right">{t(CALC.colSpeed)}</th>
                    <th className="py-3 px-3 text-right">{t(CALC.colOverhead)}</th>
                    <th className="py-3 px-4">{t(CALC.colCostMonth)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {sortedRows.map((m, idx) => {
                    let badgeText = "";
                    let badgeClass = "";
                    if (idx === 0) {
                      if (mode === "cost") {
                        badgeText = t(CALC.badgeCheapest);
                        badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
                      } else if (mode === "adj") {
                        badgeText = t(CALC.badgeBestValue);
                        badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
                      } else if (mode === "ctx") {
                        badgeText = t(CALC.badgeLargestContext);
                        badgeClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
                      } else if (mode === "speed") {
                        badgeText = t(CALC.badgeFastest);
                        badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
                      }
                    }

                    let valForBar = m.month;
                    if (mode === "adj") valForBar = m.adjMonth;
                    else if (mode === "ctx") valForBar = m.ctxT;
                    else if (mode === "speed") valForBar = m.spd;

                    const pct = Math.max(3, Math.round((valForBar / barMax) * 100));

                    return (
                      <tr key={m.id} className="hover:bg-[var(--surface-1)] transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--text-primary)]">{m.name}</span>
                            {badgeText ? (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                              >
                                {badgeText}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11.5px] text-[var(--text-muted)]">
                            {m.co}{" "}
                            <span className="text-[10px]">
                              {m.refs.map((r) => `[${r}]`).join(" ")}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">{m.params}</div>
                        </td>
                        <td className="py-3 px-3 text-right tnum">{m.ctx}</td>
                        <td className="py-3 px-3 text-right tnum">{fmtPrice(m.pin)}</td>
                        <td className="py-3 px-3 text-right tnum">{fmtPrice(m.pc)}</td>
                        <td className="py-3 px-3 text-right tnum">{fmtPrice(m.pout)}</td>
                        <td className="py-3 px-3 text-right tnum">{m.speed}</td>
                        <td className="py-3 px-3 text-right tnum">
                          {m.eff.toFixed(1)}×{" "}
                          <span className="text-[10px] text-[var(--text-muted)]">{m.effSrc}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--text-primary)] tnum">
                            {fmtUSD(m.month)}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] tnum">
                            adj. {fmtUSD(m.adjMonth)} · {fmtUSD(m.perReq)}/req
                          </div>
                          <div className="mt-1.5 h-1.5 w-full max-w-[140px] rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-[#A31F34]"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* References & Academic Footnotes */}
          <section className="card card-lit p-6 space-y-3 text-[12.5px] text-[var(--text-secondary)]">
            <h3 className="font-semibold text-[var(--text-primary)] text-[14px]">
              {locale === "es" ? "Referencias y Fuentes Metodológicas" : "References & Methodological Sources"}
            </h3>
            <ol className="grid gap-1.5 sm:grid-cols-2 text-[11.5px] list-decimal list-inside pl-1 text-[var(--text-muted)]">
              {REFERENCES.map((ref) => (
                <li key={ref.id} id={`ref-${ref.id}`}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-[#A31F34]"
                  >
                    {ref.title}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : (
        /* Assignment 1.1 Lab Sub-tab */
        <div className="space-y-6">
          <section className="card card-lit p-6 space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {t(CALC.labTitle)}
            </h2>
            <p className="text-[13.5px] leading-relaxed text-[var(--text-secondary)] max-w-4xl">
              {t(CALC.labLead)}
            </p>
          </section>

          {/* Step 1 */}
          <section className="card card-lit p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A31F34] text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {t(CALC.labStep1Title)}
              </h3>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">{t(CALC.labStep1Desc)}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: locale === "es" ? "Renta de autos (ejemplo)" : "Car rental (sample)", i: 0 },
                { label: locale === "es" ? "Bot de Onboarding HR" : "HR onboarding bot", i: 1 },
                { label: locale === "es" ? "Bot de Helpdesk IT" : "IT helpdesk bot", i: 2 },
                { label: locale === "es" ? "Asistente de ventas" : "Sales assistant", i: 3 },
              ].map((s) => (
                <button
                  key={s.i}
                  type="button"
                  onClick={() => loadLabSample(s.i)}
                  className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                    activeLabSample === "ls-" + s.i
                      ? "border-[#A31F34] bg-[#A31F34] text-white"
                      : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Step 2 */}
          <section className="card card-lit p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A31F34] text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {t(CALC.labStep2Title)}
              </h3>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">{t(CALC.labStep2Desc)}</p>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">
                {t(CALC.promptInputLabel)}
              </label>
              <textarea
                rows={3}
                value={labInText}
                onChange={(e) => setLabInText(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] p-3 text-[13px] text-[var(--text-primary)] focus:border-[#A31F34] focus:outline-none"
              />
              <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">
                ≈ <strong>{nf.format(labInEst.tokens)} tokens</strong> · {nf.format(labInEst.words)}{" "}
                {locale === "es" ? "palabras" : "words"} · {nf.format(labInEst.chars)}{" "}
                {locale === "es" ? "caracteres" : "characters"}
              </p>

              {labVizOutput ? (
                <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] p-3 text-[13px] leading-relaxed break-words">
                  {labVizOutput}
                </div>
              ) : null}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">
                {t(CALC.responseOutputLabel)}
              </label>
              <textarea
                rows={4}
                value={labOutText}
                onChange={(e) => setLabOutText(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] p-3 text-[13px] text-[var(--text-primary)] focus:border-[#A31F34] focus:outline-none"
              />
              <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">
                ≈ <strong>{nf.format(labOutEst.tokens)} tokens</strong> · {nf.format(labOutEst.words)}{" "}
                {locale === "es" ? "palabras" : "words"} · {nf.format(labOutEst.chars)}{" "}
                {locale === "es" ? "caracteres" : "characters"}
              </p>
            </div>
          </section>

          {/* Step 3 */}
          <section className="card card-lit p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A31F34] text-xs font-bold text-white">
                3
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {t(CALC.labStep3Title)}
              </h3>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">{t(CALC.labStep3Desc)}</p>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "1,000", n: 1000, id: "lc-0" },
                { label: "10,000", n: 10000, id: "lc-1" },
                { label: "100,000", n: 100000, id: "lc-2" },
                { label: "1,000,000", n: 1000000, id: "lc-3" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCalls(c.n, c.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                    activeLabCallPreset === c.id
                      ? "border-[#A31F34] bg-[#A31F34] text-white"
                      : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
              <input
                type="number"
                min={1}
                step={1000}
                value={labCalls}
                onChange={(e) => {
                  setLabCalls(Number(e.target.value) || 1);
                  setActiveLabCallPreset("");
                }}
                className="w-32 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-3 py-1.5 text-[13px] text-[var(--text-primary)] focus:border-[#A31F34] focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-[var(--border)] mt-4">
              <table className="w-full min-w-[550px] border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-1)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-2.5 px-4">{t(CALC.colModel)}</th>
                    <th className="py-2.5 px-3 text-right">$ / interaction</th>
                    <th className="py-2.5 px-3 text-right">$ / month at scale</th>
                    <th className="py-2.5 px-4">Relative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {labRows.map((r, idx) => {
                    const pct = Math.max(3, Math.round((r.total / labMaxTotal) * 100));
                    return (
                      <tr key={r.name} className="hover:bg-[var(--surface-1)]">
                        <td className="py-2.5 px-4">
                          <span className="font-semibold text-[var(--text-primary)]">{r.name}</span>{" "}
                          <span className="text-[11px] text-[var(--text-muted)]">· {r.co}</span>
                          {idx === 0 ? (
                            <span className="ml-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[9.5px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                              {t(CALC.badgeCheapest)}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2.5 px-3 text-right tnum">{fmtUSD(r.per)}</td>
                        <td className="py-2.5 px-3 text-right tnum font-semibold">{fmtUSD(r.total)}</td>
                        <td className="py-2.5 px-4">
                          <div className="h-1.5 w-full max-w-[120px] rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-[#A31F34]"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Step 4 */}
          <section className="card card-lit p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A31F34] text-xs font-bold text-white">
                4
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {t(CALC.labStep4Title)}
              </h3>
            </div>
            <button
              type="button"
              onClick={copyLabResults}
              className="rounded-full border border-[#A31F34] px-5 py-2 text-[13px] font-semibold text-[#A31F34] transition hover:bg-[#A31F34] hover:text-white"
            >
              {copied ? t(CALC.labCopied) : t(CALC.labCopyResults)}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
