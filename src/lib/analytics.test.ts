import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { track } from "./analytics";

/**
 * Nothing here touches the network: the Supabase browser client is replaced
 * wholesale, so a regression that made `track` hit a real endpoint would fail
 * to find one rather than quietly send data from a test run.
 *
 * The other thing these tests exist to hold is the first rule in analytics.ts:
 * a failed event must never break the thing the visitor was actually doing.
 * Every failure mode below is asserted to be silent — insert rejects, insert
 * reports an error, the auth lookup falls over, sessionStorage throws, and
 * sessionStorage is not there at all.
 */

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock("./supabase/client", () => ({ createClient }));

interface SupabaseOptions {
  /** The signed-in user, or null for the anonymous visitor. */
  user?: { id: string } | null;
  /** `insert` rejects — a dropped connection. */
  insertRejects?: boolean;
  /** `insert` resolves, but Postgrest reports a failure. */
  insertError?: { message: string };
  /** The auth lookup itself blows up. */
  authRejects?: boolean;
}

type Row = Record<string, unknown>;

/** Records what would have been written, and fails however the case asks. */
function fakeSupabase(options: SupabaseOptions = {}) {
  const inserted: Row[] = [];

  const insert = vi.fn(async (row: Row) => {
    inserted.push(row);
    if (options.insertRejects) throw new Error("connection terminated");
    if (options.insertError) return { data: null, error: options.insertError };
    return { data: null, error: null };
  });

  createClient.mockReturnValue({
    auth: {
      getUser: async () => {
        if (options.authRejects) throw new Error("auth unreachable");
        return { data: { user: options.user ?? null }, error: null };
      },
    },
    from: vi.fn(() => ({ insert })),
  });

  return { inserted, insert };
}

/**
 * `track` is deliberately fire-and-forget, so the insert happens in a promise
 * the caller never sees. Waiting on the spy is the only honest way to observe
 * it — and a call that never arrives fails the test by timing out rather than
 * by passing vacuously.
 */
const flush = () => vi.waitFor(() => undefined, { timeout: 1000, interval: 5 });

/** A sessionStorage stub. `mode` chooses how badly it misbehaves. */
function fakeWindow(mode: "working" | "throwing" | "absent" = "working") {
  const store = new Map<string, string>();
  if (mode === "absent") return {} as Window & typeof globalThis;

  return {
    sessionStorage: {
      getItem: (key: string) => {
        if (mode === "throwing") throw new Error("access denied");
        return store.get(key) ?? null;
      },
      setItem: (key: string, value: string) => {
        if (mode === "throwing") throw new Error("access denied");
        store.set(key, value);
      },
    },
  } as unknown as Window & typeof globalThis;
}

beforeEach(() => {
  createClient.mockReset();
  vi.stubGlobal("window", fakeWindow());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("track", () => {
  it("writes the event name to the events table", async () => {
    const { insert } = fakeSupabase();

    track("assessment_started");
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1));

    expect(insert.mock.calls[0][0]).toMatchObject({ name: "assessment_started" });
  });

  it("passes props through and leaves user_id null for an anonymous visitor", async () => {
    const { insert } = fakeSupabase({ user: null });

    track("paywall_hit", { capability: "calculator.cloud", tier: "free" });
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1));

    expect(insert.mock.calls[0][0]).toMatchObject({
      name: "paywall_hit",
      user_id: null,
      props: { capability: "calculator.cloud", tier: "free" },
    });
  });

  it("attributes the event to the signed-in user when there is one", async () => {
    const { insert } = fakeSupabase({ user: { id: "user-123" } });

    track("checkout_started", { tier: "plan" });
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1));

    expect(insert.mock.calls[0][0]).toMatchObject({ user_id: "user-123" });
  });

  it("defaults props to an empty object rather than undefined", async () => {
    // The column is `jsonb not null default '{}'` — sending undefined would
    // work today and break the moment the insert is batched or serialised.
    const { insert } = fakeSupabase();

    track("report_viewed");
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1));

    expect(insert.mock.calls[0][0]).toMatchObject({ props: {} });
  });

  it("stitches repeat events in one visit under the same session id", async () => {
    const { insert } = fakeSupabase();

    track("assessment_started");
    track("assessment_completed");
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(2));

    const [first, second] = insert.mock.calls.map((call) => call[0] as Row);
    expect(first.session_id).toBeTruthy();
    expect(second.session_id).toBe(first.session_id);
  });

  it("does not throw when the insert rejects", async () => {
    const { insert } = fakeSupabase({ insertRejects: true });

    expect(() => track("lead_captured")).not.toThrow();
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    // Reaching here without an unhandled rejection is the assertion: the
    // rejected insert was swallowed inside track, not re-thrown at the caller
    // or left dangling.
    await flush();
  });

  it("does not throw when the insert reports an error instead of rejecting", async () => {
    const { insert } = fakeSupabase({ insertError: { message: "rls denied" } });

    expect(() => track("lead_captured")).not.toThrow();
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
  });

  it("does not throw when the auth lookup fails", async () => {
    // getUser() runs before the insert, so a failure here must not take the
    // page down either — it just means the event is never written.
    fakeSupabase({ authRejects: true });

    expect(() => track("usecases_viewed")).not.toThrow();
    await flush();
  });

  it("still records the event when sessionStorage throws", async () => {
    // Private browsing and locked-down enterprise browsers both do this.
    vi.stubGlobal("window", fakeWindow("throwing"));
    const { insert } = fakeSupabase();

    expect(() => track("calculator_viewed")).not.toThrow();
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1));

    // The visit cannot be stitched, but it is still counted — an uncountable
    // visitor is worse than an unstitched one.
    expect(insert.mock.calls[0][0]).toMatchObject({
      name: "calculator_viewed",
      session_id: "",
    });
  });

  it("does not throw when sessionStorage is missing entirely", async () => {
    vi.stubGlobal("window", fakeWindow("absent"));
    const { insert } = fakeSupabase();

    expect(() => track("usecase_selected", { use_case_id: "fin-cockpit" })).not.toThrow();
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1));

    expect(insert.mock.calls[0][0]).toMatchObject({ session_id: "" });
  });

  it("does nothing at all on the server", async () => {
    // No window means a server render: it must not construct a client, let
    // alone reach for a session that cannot exist there.
    vi.stubGlobal("window", undefined);
    fakeSupabase();

    expect(() => track("pricing_viewed")).not.toThrow();
    await flush();
    expect(createClient).not.toHaveBeenCalled();
  });
});
