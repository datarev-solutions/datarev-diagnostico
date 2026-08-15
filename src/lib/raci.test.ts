import { describe, expect, it } from "vitest";
import {
  ACTOR_LABEL,
  ACTOR_ORDER,
  actorsIn,
  RACI_ACTIVITIES,
  raciFor,
  type Actor,
} from "./raci";
import { USE_CASES } from "./useCases";

const pick = (...ids: string[]) => USE_CASES.filter((u) => ids.includes(u.id));

describe("RACI integrity", () => {
  it("names exactly one Accountable per activity", () => {
    // The defining constraint of RACI. Two A's means nobody decides, and it
    // is the most common way these charts get filled in wrong.
    for (const activity of RACI_ACTIVITIES) {
      const accountable = Object.values(activity.assignments).filter((l) => l === "A");
      expect(accountable, activity.id).toHaveLength(1);
    }
  });

  it("names at least one Responsible, or makes the Accountable do it", () => {
    for (const activity of RACI_ACTIVITIES) {
      const letters = Object.values(activity.assignments);
      expect(letters.includes("R") || letters.includes("A"), activity.id).toBe(true);
    }
  });

  it("has unique ids and a label for every actor used", () => {
    const ids = RACI_ACTIVITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const activity of RACI_ACTIVITIES) {
      for (const actor of Object.keys(activity.assignments) as Actor[]) {
        expect(ACTOR_LABEL[actor], actor).toBeDefined();
        expect(ACTOR_ORDER).toContain(actor);
      }
    }
  });

  it("gives every activity a deliverable, not just a name", () => {
    // An activity with no artefact is impossible to call done.
    for (const activity of RACI_ACTIVITIES) {
      expect(activity.deliverable.es.length).toBeGreaterThan(0);
      expect(activity.deliverable.en.length).toBeGreaterThan(0);
    }
  });

  it("puts the client, not DataRev, accountable for adoption decisions", () => {
    // A project stalls when the business owner is merely Informed on the
    // calls only they can make. Both of these must be theirs.
    for (const id of ["kbq", "uat", "training"]) {
      const activity = RACI_ACTIVITIES.find((a) => a.id === id)!;
      const accountable = (Object.entries(activity.assignments) as [Actor, string][]).find(
        ([, l]) => l === "A",
      )!;
      expect(accountable[0], id).toBe("businessOwner");
    }
  });
});

describe("raciFor", () => {
  it("keeps the always-on activities even with nothing selected", () => {
    const ids = raciFor([]).map((a) => a.id);
    for (const always of ["kbq", "architecture", "access", "uat", "training", "handover"]) {
      expect(ids).toContain(always);
    }
  });

  it("omits build activities the selection does not need", () => {
    // Two plain dashboards need no model training and no agent work.
    const ids = raciFor(pick("fin-budget", "h2r-headcount")).map((a) => a.id);
    expect(ids).toContain("bi");
    expect(ids).not.toContain("model");
    expect(ids).not.toContain("agent");
  });

  it("adds model work when a predictive case is selected", () => {
    const ids = raciFor(pick("cust-churn")).map((a) => a.id);
    expect(ids).toContain("model");
    expect(ids).not.toContain("agent");
  });

  it("adds agent work when a generative case is selected", () => {
    const ids = raciFor(pick("cust-support-agent")).map((a) => a.id);
    expect(ids).toContain("agent");
  });

  it("never invents an activity outside the master list", () => {
    const master = new Set(RACI_ACTIVITIES.map((a) => a.id));
    for (const a of raciFor(USE_CASES)) expect(master.has(a.id)).toBe(true);
  });
});

describe("actorsIn", () => {
  it("returns only actors that actually appear, in chart order", () => {
    const activities = raciFor(pick("fin-budget"));
    const actors = actorsIn(activities);

    // No ML or FDE on a pure dashboard engagement.
    expect(actors).not.toContain("mlEngineer");
    expect(actors).not.toContain("fde");

    const positions = actors.map((a) => ACTOR_ORDER.indexOf(a));
    expect(positions).toEqual([...positions].sort((x, y) => x - y));
  });

  it("brings in the AI roles once an agent case is selected", () => {
    const actors = actorsIn(raciFor(pick("cust-support-agent")));
    expect(actors).toContain("mlEngineer");
    expect(actors).toContain("fde");
  });
});
