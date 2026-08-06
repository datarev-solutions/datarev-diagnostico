import {
  AMBITION_MAP,
  DIMENSIONS,
  type AmbitionId,
  type Level,
  type Locale,
} from "./framework";
import { questionsFor } from "./questions";
import { defaultTargets, type Answers, type Mode, type Targets } from "./scoring";

export interface CompanyContext {
  name: string;
  industry: string;
  size: string;
  assessor: string;
}

export interface AssessmentState {
  mode: Mode;
  locale: Locale;
  company: CompanyContext;
  answers: Answers;
  ambition: AmbitionId;
  targets: Targets;
}

export const STORAGE_KEY = "datarev:assessment:v1";

export const emptyCompany: CompanyContext = {
  name: "",
  industry: "",
  size: "",
  assessor: "",
};

export function createState(
  mode: Mode,
  locale: Locale = "es",
): AssessmentState {
  const ambition: AmbitionId = "leader";
  return {
    mode,
    locale,
    company: { ...emptyCompany },
    answers: {},
    ambition,
    targets: defaultTargets(AMBITION_MAP[ambition].targetLevel),
  };
}

/* ------------------------------------------------------------------ codec */

/**
 * Compact, URL-safe encoding.
 *
 * Answers become one digit per question in canonical order ("0" = unanswered),
 * targets one digit per dimension. A JSON blob would work but produces a link
 * three times longer, and these get pasted into email.
 *
 * Format: v1~<mode>~<answers>~<targets>~<locale>~<base64url company>
 */
export function encodeState(state: AssessmentState): string {
  const questions = questionsFor(state.mode);
  const answers = questions
    .map((question) => state.answers[question.id] ?? 0)
    .join("");
  const targets = DIMENSIONS.map(
    (dimension) => state.targets[dimension.id] ?? 3,
  ).join("");

  const hasCompany = Object.values(state.company).some((value) => value !== "");
  const company = hasCompany ? toBase64Url(JSON.stringify(state.company)) : "";

  return [
    "v1",
    state.mode === "express" ? "e" : "f",
    answers,
    targets,
    state.locale,
    company,
  ].join("~");
}

export function decodeState(encoded: string): AssessmentState | null {
  try {
    const parts = encoded.split("~");
    if (parts.length < 5 || parts[0] !== "v1") return null;

    const [, modeFlag, answerDigits, targetDigits, locale, company = ""] = parts;
    const mode: Mode = modeFlag === "e" ? "express" : "full";
    const questions = questionsFor(mode);
    if (answerDigits.length !== questions.length) return null;
    if (targetDigits.length !== DIMENSIONS.length) return null;

    const answers: Answers = {};
    questions.forEach((question, index) => {
      const value = Number(answerDigits[index]);
      if (value >= 1 && value <= 5) answers[question.id] = value as Level;
    });

    const targets = {} as Targets;
    DIMENSIONS.forEach((dimension, index) => {
      const value = Number(targetDigits[index]);
      targets[dimension.id] = (value >= 1 && value <= 5 ? value : 3) as Level;
    });

    return {
      mode,
      locale: locale === "en" ? "en" : "es",
      company: company
        ? { ...emptyCompany, ...JSON.parse(fromBase64Url(company)) }
        : { ...emptyCompany },
      answers,
      ambition: inferAmbition(targets),
      targets,
    };
  } catch {
    return null;
  }
}

function inferAmbition(targets: Targets): AmbitionId {
  const values = DIMENSIONS.map((dimension) => targets[dimension.id]);
  const uniform = values.every((value) => value === values[0]);
  if (!uniform) return "leader";
  if (values[0] === 3) return "follower";
  if (values[0] === 5) return "frontier";
  return "leader";
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ---------------------------------------------------------------- storage */

export function loadState(): AssessmentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AssessmentState;
    if (!parsed.mode || !parsed.answers || !parsed.targets) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: AssessmentState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or a full quota: the app still works in-memory.
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
