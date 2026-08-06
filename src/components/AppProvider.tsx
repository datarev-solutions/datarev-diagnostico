"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  AMBITION_MAP,
  type AmbitionId,
  type DimensionId,
  type L,
  type Level,
  type Locale,
} from "@/lib/framework";
import { t as translate } from "@/lib/i18n";
import { defaultTargets, type Mode } from "@/lib/scoring";
import {
  clearState,
  createState,
  decodeState,
  loadState,
  saveState,
  type AssessmentState,
  type CompanyContext,
} from "@/lib/state";

interface AppContextValue {
  state: AssessmentState;
  /** False during the server render and the hydration pass. */
  hydrated: boolean;
  locale: Locale;
  t: (value: L) => string;
  setLocale: (locale: Locale) => void;
  setMode: (mode: Mode) => void;
  setCompany: (company: Partial<CompanyContext>) => void;
  setAnswer: (questionId: string, level: Level) => void;
  setAmbition: (ambition: AmbitionId) => void;
  setTarget: (dimension: DimensionId, level: Level) => void;
  reset: (mode?: Mode) => void;
  hasProgress: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const SERVER_FALLBACK = createState("full", "es");

/**
 * `true` only once the client has taken over. Modelled as an external store
 * rather than an effect so the persisted state can be read during render
 * instead of being patched in afterwards.
 */
const noopSubscribe = () => () => {};
function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * A shared link wins over local storage: whoever opened that URL came for
 * that specific result.
 */
function readPersisted(): AssessmentState {
  if (typeof window === "undefined") return SERVER_FALLBACK;
  const shared = new URLSearchParams(window.location.search).get("r");
  return (shared && decodeState(shared)) || loadState() || createState("full", "es");
}

export function AppProvider({ children }: { children: ReactNode }) {
  const hydrated = useIsClient();

  // `null` means "nothing edited yet, so the persisted value still stands".
  const [edits, setEdits] = useState<AssessmentState | null>(null);

  const state = useMemo(
    () => edits ?? (hydrated ? readPersisted() : SERVER_FALLBACK),
    [edits, hydrated],
  );

  const update = useCallback(
    (transform: (current: AssessmentState) => AssessmentState) => {
      setEdits((current) => transform(current ?? readPersisted()));
    },
    [],
  );

  useEffect(() => {
    if (hydrated && edits) saveState(edits);
  }, [edits, hydrated]);

  useEffect(() => {
    document.documentElement.lang = state.locale;
  }, [state.locale]);

  const setLocale = useCallback(
    (locale: Locale) => update((current) => ({ ...current, locale })),
    [update],
  );

  const setMode = useCallback(
    (mode: Mode) => update((current) => ({ ...current, mode })),
    [update],
  );

  const setCompany = useCallback(
    (company: Partial<CompanyContext>) =>
      update((current) => ({
        ...current,
        company: { ...current.company, ...company },
      })),
    [update],
  );

  const setAnswer = useCallback(
    (questionId: string, level: Level) =>
      update((current) => ({
        ...current,
        answers: { ...current.answers, [questionId]: level },
      })),
    [update],
  );

  const setAmbition = useCallback(
    (ambition: AmbitionId) =>
      update((current) => ({
        ...current,
        ambition,
        targets: defaultTargets(AMBITION_MAP[ambition].targetLevel),
      })),
    [update],
  );

  const setTarget = useCallback(
    (dimension: DimensionId, level: Level) =>
      update((current) => ({
        ...current,
        targets: { ...current.targets, [dimension]: level },
      })),
    [update],
  );

  // Derived `state`, not `edits`: before the first edit `edits` is null, and
  // reading the locale off it would silently drop a persisted "en" back to
  // Spanish when an English visitor starts a new assessment.
  const reset = useCallback(
    (mode?: Mode) => {
      clearState();
      setEdits(createState(mode ?? state.mode, state.locale));
    },
    [state.mode, state.locale],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      hydrated,
      locale: state.locale,
      t: (item: L) => translate(item, state.locale),
      setLocale,
      setMode,
      setCompany,
      setAnswer,
      setAmbition,
      setTarget,
      reset,
      hasProgress: Object.keys(state.answers).length > 0,
    }),
    [
      state,
      hydrated,
      setLocale,
      setMode,
      setCompany,
      setAnswer,
      setAmbition,
      setTarget,
      reset,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
