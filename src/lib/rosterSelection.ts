"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Manual overrides on top of an automatically derived set.
 *
 * The roster and the stack are derived from the use cases someone picked —
 * that is the whole point, and it is why a dashboard project does not get an
 * ML engineer. But derivation must not become a cage: a client who knows their
 * own organisation needs to be able to add the seat we did not infer, or drop
 * the one they already employ.
 *
 * So the store holds only the deltas. Nothing is written until the user
 * actually overrides something, and re-deriving from a changed use-case
 * selection keeps working underneath.
 */

export interface Overrides {
  added: string[];
  removed: string[];
}

const EMPTY: Overrides = { added: [], removed: [] };

function parse(raw: string | null): Overrides {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const o = parsed as Partial<Overrides>;
    const strings = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    return { added: strings(o.added), removed: strings(o.removed) };
  } catch {
    return EMPTY;
  }
}

function makeStore(key: string) {
  return {
    listeners: new Set<() => void>(),
    raw: null as string | null,
    snapshot: EMPTY as Overrides,
    primed: false,

    subscribe(listener: () => void) {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    },

    getSnapshot(): Overrides {
      let raw: string | null = null;
      try {
        raw = window.localStorage.getItem(key);
      } catch {
        raw = null;
      }
      if (!this.primed || raw !== this.raw) {
        this.raw = raw;
        this.snapshot = parse(raw);
        this.primed = true;
      }
      return this.snapshot;
    },

    getServerSnapshot(): Overrides {
      return EMPTY;
    },

    write(next: Overrides) {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Private browsing: overrides simply do not survive a refresh.
      }
      this.primed = false;
      for (const listener of this.listeners) listener();
    },
  };
}

const stores: Record<string, ReturnType<typeof makeStore>> = {
  roles: makeStore("datarev:roles:v1"),
  stack: makeStore("datarev:stack:v1"),
};

/**
 * Apply the user's deltas to an automatically derived set.
 * `auto` stays the source of truth: an item the user re-added is dropped from
 * `removed` the moment the derivation stops producing it, so stale overrides
 * cannot accumulate into a roster nobody chose.
 */
export function useRoster<T extends string>(
  which: "roles" | "stack",
  auto: T[],
  universe: T[],
) {
  const store = stores[which];
  const overrides = useSyncExternalStore(
    (l) => store.subscribe(l),
    () => store.getSnapshot(),
    () => store.getServerSnapshot(),
  );

  const autoSet = new Set(auto);
  const removed = new Set(overrides.removed);
  const added = overrides.added.filter((x): x is T => (universe as string[]).includes(x));

  const effective = universe.filter(
    (item) => (autoSet.has(item) || added.includes(item)) && !removed.has(item),
  );

  // Deliberately not memoised: `autoSet` is rebuilt on every render from a
  // derived array, so a memoised toggle would either close over a stale auto
  // set or need a dependency that changes identity every render anyway. The
  // handler is cheap and reads the live snapshot when it fires.
  const toggle = (item: T) => {
    const current = store.getSnapshot();
    const isAuto = autoSet.has(item);
    const isOn =
      (isAuto || current.added.includes(item)) && !current.removed.includes(item);

    if (isOn) {
      store.write({
        added: current.added.filter((x) => x !== item),
        removed: isAuto ? [...new Set([...current.removed, item])] : current.removed,
      });
    } else {
      store.write({
        added: isAuto ? current.added : [...new Set([...current.added, item])],
        removed: current.removed.filter((x) => x !== item),
      });
    }
  };

  const reset = useCallback(() => store.write(EMPTY), [store]);

  return {
    effective,
    isAuto: (item: T) => autoSet.has(item),
    isOn: (item: T) => effective.includes(item),
    /** True when the user has overridden the derivation at all. */
    dirty: overrides.added.length > 0 || overrides.removed.length > 0,
    toggle,
    reset,
  };
}
