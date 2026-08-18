import type { L } from "./framework";

/**
 * FROM MARKET SALARY TO A DEFENSIBLE DAY RATE
 * ===========================================
 * The day rates in cloudPricing.ts are DataRev's own assumption — a single
 * number per role with nothing behind it. This file derives them instead, from
 * published salary data, through the two conversions that naive calculators
 * skip and that make every one of them wrong:
 *
 *   1. EMPLOYER BURDEN. A salary is not what a person costs. In Mexico, IMSS,
 *      INFONAVIT, aguinaldo, vacaciones and PTU add roughly a third on top of
 *      base pay before anyone has bought a laptop.
 *
 *   2. UTILISATION. A consultant costs twelve months and bills about eight.
 *      Dividing an annual salary by 260 working days produces a rate that
 *      cannot cover the person who earns it — this is the single most common
 *      error in consultancy pricing, and it is why firms that "win on price"
 *      quietly lose money on delivery.
 *
 * What is measured and what is DataRev's commercial choice is marked per field.
 * The margin multiplier is deliberately NOT sourced: it is a business decision,
 * not a fact, and pretending otherwise would be dishonest.
 */

export const SALARY_CHECKED = "2026-08-17";

export type Seniority = "junior" | "mid" | "senior" | "principal" | "architect";

export const SENIORITY_ORDER: Seniority[] = ["junior", "mid", "senior", "principal", "architect"];

export const SENIORITY_LABEL: Record<Seniority, L> = {
  junior: { es: "Junior", en: "Junior" },
  mid: { es: "Semi senior", en: "Mid-level" },
  senior: { es: "Senior", en: "Senior" },
  principal: { es: "Principal / Staff", en: "Principal / Staff" },
  architect: { es: "Arquitecto", en: "Architect" },
};

export const SENIORITY_YEARS: Record<Seniority, L> = {
  junior: { es: "0-2 años", en: "0-2 years" },
  mid: { es: "2-5 años", en: "2-5 years" },
  senior: { es: "5-9 años", en: "5-9 years" },
  principal: { es: "9-15 años", en: "9-15 years" },
  architect: { es: "12+ años", en: "12+ years" },
};

export type Market = "mexico" | "usBenchmark";

export const MARKET_LABEL: Record<Market, L> = {
  mexico: { es: "México", en: "Mexico" },
  usBenchmark: { es: "Referencia EE.UU. / global", en: "US / global benchmark" },
};

/** Annual base salary band in USD, before employer burden. */
export interface SalaryBand {
  low: number;
  mid: number;
  high: number;
}

/**
 * MEASURED, global medians. Stack Overflow Developer Survey 2025: 49,000
 * respondents, 23,928 of whom reported compensation. Published medians used as
 * the anchor for the `senior` band, with the other bands scaled around it —
 * the survey publishes medians by role, not full bands by seniority, so the
 * spread below is DataRev's, the centre is theirs.
 *
 * Anchors taken verbatim: Data Engineer $81,210 · Data Scientist $82,910 ·
 * Cloud Infrastructure Engineer $103,112 · Back-end Developer $79,742 ·
 * Engineering Manager $130,000. Architects reported at $92k-$104k.
 */
export const US_BENCHMARK: Record<Seniority, SalaryBand> = {
  junior: { low: 45_000, mid: 55_000, high: 68_000 },
  mid: { low: 65_000, mid: 78_000, high: 95_000 },
  // Centred on the survey's data-engineering median.
  senior: { low: 81_000, mid: 100_000, high: 125_000 },
  principal: { low: 120_000, mid: 145_000, high: 180_000 },
  // Centred on the survey's reported architect range.
  architect: { low: 92_000, mid: 104_000, high: 150_000 },
};

/**
 * SECONDARY. Mexican market bands, converted from monthly MXN figures reported
 * by salary aggregators (Glassdoor, Talent.com, TripleTen) in 2026: juniors
 * $25-35k MXN/month, mid $45-70k, senior and architect profiles $90-120k+.
 * These are aggregator figures, not a single audited survey — weaker evidence
 * than the Stack Overflow anchor above, and labelled as such in the UI.
 *
 * Stored in MXN so a stale exchange rate cannot silently corrupt them.
 */
export const MEXICO_MONTHLY_MXN: Record<Seniority, SalaryBand> = {
  junior: { low: 25_000, mid: 30_000, high: 35_000 },
  mid: { low: 45_000, mid: 57_000, high: 70_000 },
  senior: { low: 70_000, mid: 85_000, high: 100_000 },
  principal: { low: 90_000, mid: 110_000, high: 140_000 },
  architect: { low: 100_000, mid: 120_000, high: 160_000 },
};

/**
 * DataRev's assumption, and the number most worth replacing with today's rate.
 * Not fetched live on purpose: a client-facing quote should be reproducible,
 * and a figure that moves between two viewings of the same page is worse than
 * one that is explicitly dated.
 */
export const DEFAULT_MXN_PER_USD = 18.5;

export interface RateAssumptions {
  market: Market;
  /** MXN per USD, used only when market is "mexico". */
  fx: number;
  /**
   * Employer burden. Salary × this = what the person actually costs.
   * Mexico's statutory load (IMSS, INFONAVIT, aguinaldo, vacaciones, PTU)
   * commonly lands around 1.30-1.45 before equipment and software.
   */
  loadFactor: number;
  /**
   * Billable share of the year. Industry practice for professional services
   * sits near 0.70-0.80; above 0.85 nobody is training, selling or on holiday.
   */
  utilisation: number;
  /** DataRev's markup. A commercial decision, not a measurement. */
  marginMultiplier: number;
  /** Working days in a year before utilisation is applied. */
  workingDaysPerYear: number;
}

export const DEFAULT_ASSUMPTIONS: RateAssumptions = {
  market: "mexico",
  fx: DEFAULT_MXN_PER_USD,
  loadFactor: 1.35,
  utilisation: 0.75,
  marginMultiplier: 2.2,
  workingDaysPerYear: 240,
};

export interface DerivedRate {
  seniority: Seniority;
  /** Annual base salary in USD, at the chosen band point. */
  salaryUsd: number;
  /** Salary plus employer burden. */
  loadedUsd: number;
  /** Days this person can actually bill in a year. */
  billableDays: number;
  /** What a day costs DataRev before margin. */
  costPerDay: number;
  /** What DataRev charges for a day. */
  ratePerDay: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Annual base salary in USD for a seniority, at low / mid / high of the band. */
export function salaryUsd(
  seniority: Seniority,
  a: RateAssumptions,
  point: keyof SalaryBand = "mid",
): number {
  if (a.market === "usBenchmark") return US_BENCHMARK[seniority][point];
  const monthly = MEXICO_MONTHLY_MXN[seniority][point];
  return (monthly * 12) / Math.max(1, a.fx);
}

/**
 * The whole chain, per seniority. Returned with every intermediate step so a
 * client can argue with the assumption rather than with the final number.
 */
export function deriveRate(
  seniority: Seniority,
  a: RateAssumptions = DEFAULT_ASSUMPTIONS,
  point: keyof SalaryBand = "mid",
): DerivedRate {
  const salary = salaryUsd(seniority, a, point);
  const loaded = salary * a.loadFactor;
  const billableDays = Math.max(1, a.workingDaysPerYear * Math.min(1, Math.max(0.1, a.utilisation)));
  const costPerDay = loaded / billableDays;

  return {
    seniority,
    salaryUsd: round(salary),
    loadedUsd: round(loaded),
    billableDays: Math.round(billableDays),
    costPerDay: round(costPerDay),
    ratePerDay: round(costPerDay * a.marginMultiplier),
  };
}

export function deriveAll(
  a: RateAssumptions = DEFAULT_ASSUMPTIONS,
  point: keyof SalaryBand = "mid",
): DerivedRate[] {
  return SENIORITY_ORDER.map((s) => deriveRate(s, a, point));
}

/**
 * The break-even day rate: below this, the engagement loses money on that
 * person however the proposal is dressed up. Worth showing next to the quoted
 * rate so a discount conversation happens with a floor in view.
 */
export function breakEvenDay(seniority: Seniority, a: RateAssumptions = DEFAULT_ASSUMPTIONS): number {
  return deriveRate(seniority, a).costPerDay;
}

export const RATE_SOURCES: { label: L; url: string; kind: "measured" | "secondary" | "assumption" }[] = [
  {
    label: {
      es: "Stack Overflow Developer Survey 2025 — 49,000 respondentes, 23,928 con datos de compensación",
      en: "Stack Overflow Developer Survey 2025 — 49,000 respondents, 23,928 reporting compensation",
    },
    url: "https://survey.stackoverflow.co/2025/work",
    kind: "measured",
  },
  {
    label: {
      es: "Bandas del mercado mexicano: agregadores salariales (Glassdoor, Talent.com, TripleTen), 2026",
      en: "Mexican market bands: salary aggregators (Glassdoor, Talent.com, TripleTen), 2026",
    },
    url: "https://mx.indeed.com/career/data-engineer/salaries",
    kind: "secondary",
  },
  {
    label: {
      es: "Carga patronal, utilización y margen: supuestos de DataRev, editables arriba",
      en: "Employer burden, utilisation and margin: DataRev assumptions, editable above",
    },
    url: "",
    kind: "assumption",
  },
];
