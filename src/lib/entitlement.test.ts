import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertCapability,
  CapabilityError,
  getTier,
  isCapabilityError,
  requireCapability,
} from "./entitlement";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock("./supabase/server", () => ({ createClient }));

type Row = Record<string, unknown>;

interface SessionOptions {
  /** The signed-in user, or null for a logged-out visitor. */
  user?: { id: string } | null;
  /** Everything in `subscriptions`, including rows that must NOT match. */
  rows?: Row[];
  /** The session lookup itself blows up. */
  authFails?: boolean;
  /** The query rejects — a dropped connection rather than a query error. */
  queryFails?: boolean;
  /** The query resolves, but Postgrest reports a failure. */
  queryError?: { message: string };
}

/**
 * A Supabase double that actually applies the `.eq()` filters it is given,
 * instead of returning a canned row. That is deliberate: it is what makes the
 * "canceled subscription grants nothing" tests real. If the status filter were
 * ever dropped from getTier, a fake that ignores filters would keep passing.
 */
function fakeSupabase(options: SessionOptions) {
  const filters: Row = {};

  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      filters[column] = value;
      return builder;
    },
    maybeSingle: async () => {
      if (options.queryFails) throw new Error("connection terminated");
      if (options.queryError) return { data: null, error: options.queryError };
      const match =
        (options.rows ?? []).find((row) =>
          Object.entries(filters).every(([column, value]) => row[column] === value),
        ) ?? null;
      return { data: match, error: null };
    },
  };

  return {
    auth: {
      getUser: async () => {
        if (options.authFails) throw new Error("auth unreachable");
        return { data: { user: options.user ?? null }, error: null };
      },
    },
    from: () => builder,
  };
}

function givenSession(options: SessionOptions) {
  createClient.mockResolvedValue(fakeSupabase(options));
}

const SUBSCRIBER = { id: "user-1" };

beforeEach(() => {
  createClient.mockReset();
});

describe("getTier", () => {
  it("treats a visitor with no session as free", async () => {
    givenSession({ user: null, rows: [{ user_id: "user-1", tier: "guided", status: "active" }] });
    await expect(getTier()).resolves.toBe("free");
  });

  it("returns the tier of an active subscription", async () => {
    givenSession({
      user: SUBSCRIBER,
      rows: [{ user_id: "user-1", tier: "plan", status: "active" }],
    });
    await expect(getTier()).resolves.toBe("plan");
  });

  it("leaves a signed-in user with no subscription on free", async () => {
    givenSession({ user: SUBSCRIBER, rows: [] });
    await expect(getTier()).resolves.toBe("free");
  });

  it("does not grant the tier of a canceled subscription", async () => {
    givenSession({
      user: SUBSCRIBER,
      rows: [{ user_id: "user-1", tier: "guided", status: "canceled" }],
    });
    await expect(getTier()).resolves.toBe("free");
  });

  it("does not grant the tier of a past_due subscription", async () => {
    // The one that actually happens in production: a card expires, Stripe keeps
    // the row, and the tier has to stop granting before the next renewal.
    givenSession({
      user: SUBSCRIBER,
      rows: [{ user_id: "user-1", tier: "plan", status: "past_due" }],
    });
    await expect(getTier()).resolves.toBe("free");
  });

  it("does not read another user's subscription", async () => {
    givenSession({
      user: SUBSCRIBER,
      rows: [{ user_id: "user-2", tier: "guided", status: "active" }],
    });
    await expect(getTier()).resolves.toBe("free");
  });

  it("ignores a tier value it does not recognise", async () => {
    // A tier added to the database ahead of the deploy that understands it.
    givenSession({
      user: SUBSCRIBER,
      rows: [{ user_id: "user-1", tier: "enterprise", status: "active" }],
    });
    await expect(getTier()).resolves.toBe("free");
  });

  it("degrades to free when the database is unreachable", async () => {
    givenSession({ user: SUBSCRIBER, queryFails: true });
    await expect(getTier()).resolves.toBe("free");
  });

  it("degrades to free when the query returns an error", async () => {
    givenSession({ user: SUBSCRIBER, queryError: { message: "permission denied" } });
    await expect(getTier()).resolves.toBe("free");
  });

  it("degrades to free when the session lookup itself fails", async () => {
    givenSession({ authFails: true });
    await expect(getTier()).resolves.toBe("free");
  });

  it("degrades to free when the client cannot even be built", async () => {
    createClient.mockRejectedValue(new Error("missing environment variables"));
    await expect(getTier()).resolves.toBe("free");
  });
});

describe("requireCapability", () => {
  it("reports the tier alongside the decision", async () => {
    givenSession({
      user: SUBSCRIBER,
      rows: [{ user_id: "user-1", tier: "diagnostic", status: "active" }],
    });
    await expect(requireCapability("report.pdf")).resolves.toEqual({
      tier: "diagnostic",
      allowed: true,
    });
  });

  it("refuses a capability above the paid tier without pretending the user is free", async () => {
    givenSession({
      user: SUBSCRIBER,
      rows: [{ user_id: "user-1", tier: "diagnostic", status: "active" }],
    });
    await expect(requireCapability("calculator.llm")).resolves.toEqual({
      tier: "diagnostic",
      allowed: false,
    });
  });
});

describe("assertCapability", () => {
  it("throws for a gated capability on the free tier", async () => {
    givenSession({ user: null });
    await expect(assertCapability("calculator.cloud")).rejects.toBeInstanceOf(CapabilityError);
  });

  it("names the cheapest tier that would unlock it, for the upgrade prompt", async () => {
    givenSession({ user: null });
    const error: unknown = await assertCapability("benchmark.peers").catch((e: unknown) => e);
    expect(isCapabilityError(error)).toBe(true);
    if (!isCapabilityError(error)) return;
    expect(error.tier).toBe("free");
    expect(error.requiredTier).toBe("diagnostic");
    expect(error.capability).toBe("benchmark.peers");
  });

  it("resolves to the tier when the subscription covers the capability", async () => {
    givenSession({
      user: SUBSCRIBER,
      rows: [{ user_id: "user-1", tier: "guided", status: "active" }],
    });
    await expect(assertCapability("session.guided")).resolves.toBe("guided");
  });

  it("lets a logged-out visitor through for what the free tier includes", async () => {
    givenSession({ user: null });
    await expect(assertCapability("assessment.express")).resolves.toBe("free");
  });
});
