"use client";

import { useState, type ReactNode } from "react";

export interface TooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

/** Shared hover-tooltip plumbing: charts report a point, this renders the card. */
export function useChartTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  return { tooltip, setTooltip, clear: () => setTooltip(null) };
}

export function ChartTooltip({ tooltip }: { tooltip: TooltipState | null }) {
  if (!tooltip) return null;
  return (
    <div
      className="pointer-events-none absolute z-20 max-w-[15rem] -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-2 text-xs leading-snug shadow-lg"
      style={{ left: `${tooltip.x}%`, top: `${tooltip.y}%` }}
      role="tooltip"
    >
      {tooltip.content}
    </div>
  );
}

export function levelColor(level: number): string {
  const clamped = Math.min(5, Math.max(1, Math.round(level)));
  return `var(--level-${clamped})`;
}

export function levelInk(level: number): string {
  const clamped = Math.min(5, Math.max(1, Math.round(level)));
  return `var(--level-${clamped}-ink)`;
}

export function ChartFrame({
  title,
  lead,
  children,
  className = "",
  legend,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  legend?: ReactNode;
}) {
  return (
    <section className={`card card-lit avoid-break p-5 sm:p-6 ${className}`}>
      <header className="mb-4">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        {lead ? (
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            {lead}
          </p>
        ) : null}
      </header>
      {legend ? <div className="mb-4">{legend}</div> : null}
      {children}
    </section>
  );
}

export function LegendSwatch({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      {dashed ? (
        <svg width="16" height="8" aria-hidden="true">
          <line
            x1="0"
            y1="4"
            x2="16"
            y2="4"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="3 2.5"
          />
        </svg>
      ) : (
        <span
          className="h-2.5 w-2.5 rounded-[3px]"
          style={{ background: color }}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}
