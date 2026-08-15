"use client";

import { useCallback, useSyncExternalStore } from "react";
import { USE_CASES, type UseCase } from "./useCases";

/**
 * The use-case selection, shared between the planner and the calculator.
 *
 * localStorage as an external store, mirroring how AppProvider reads the
 * persisted assessment and SessionProvider reads the captured lead. Reading
 * it in an effect instead would flash the calculator's generic fallback at
 * someone who has already picked their use cases.
 *
 * `snapshot` is cached because useSyncExternalStore compares by identity — a
 * fresh array per read would loop forever.
 */
const KEY = "datarev:usecases:v1";

const DEFAULT_IDS = ["fin-cockpit", "cust-funnel", "cust-churn"];

function parse(raw: string | null): string[] {
  if (!raw) return DEFAULT_IDS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_IDS;
    // Drop ids that no longer exist, so removing a use case from the
    // catalogue cannot resurrect a phantom selection from an old browser.
    const known = new Set(USE_CASES.map((u) => u.id));
    return parsed.filter((id): id is string => typeof id === "string" && known.has(id));
  } catch {
    return DEFAULT_IDS;
  }
}

const store = {
  listeners: new Set<() => void>(),
  raw: null as string | null,
  snapshot: DEFAULT_IDS as string[],
  primed: false,

  subscribe(listener: () => void) {
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  },

  getSnapshot(): string[] {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch {
      raw = null;
    }
    if (!store.primed || raw !== store.raw) {
      store.raw = raw;
      store.snapshot = parse(raw);
      store.primed = true;
    }
    return store.snapshot;
  },

  getServerSnapshot(): string[] {
    return DEFAULT_IDS;
  },

  write(ids: string[]) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // Private browsing: the selection simply does not survive a refresh.
    }
    store.primed = false;
    for (const listener of store.listeners) listener();
  },
};

export function useUseCaseSelection() {
  const ids = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const toggle = useCallback((id: string) => {
    const current = store.getSnapshot();
    store.write(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }, []);

  const setAll = useCallback((next: string[]) => store.write(next), []);

  const selected: UseCase[] = USE_CASES.filter((u) => ids.includes(u.id));

  return { ids, selected, toggle, setAll };
}
