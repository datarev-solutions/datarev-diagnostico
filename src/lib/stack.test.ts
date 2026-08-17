import { describe, expect, it } from "vitest";
import { ROLE_LABEL, ROLE_ORDER, ROLE_PURPOSE } from "./cloudPricing";
import {
  byPlane,
  coordinationRoles,
  expandStack,
  layersNeedingRole,
  PLANE_ORDER,
  rolesForStack,
  STACK,
  type StackLayer,
} from "./stack";
import { rollUpUseCases, USE_CASES } from "./useCases";

const byId = (id: string) => USE_CASES.find((u) => u.id === id)!;

describe("stack taxonomy", () => {
  it("describes every layer with a purpose, examples and an owner", () => {
    for (const [id, spec] of Object.entries(STACK)) {
      expect(spec.name.es.length, id).toBeGreaterThan(0);
      expect(spec.purpose.es.length, id).toBeGreaterThan(0);
      expect(spec.examples.length, id).toBeGreaterThan(0);
      expect(spec.roles.length, id).toBeGreaterThan(0);
    }
  });

  it("assigns every layer to a plane that is actually rendered", () => {
    for (const spec of Object.values(STACK)) {
      expect(PLANE_ORDER).toContain(spec.plane);
    }
  });

  it("names only roles the rate card can price", () => {
    // A layer owned by a role with no day rate would silently cost nothing.
    for (const [id, spec] of Object.entries(STACK)) {
      for (const role of spec.roles) {
        expect(ROLE_ORDER, id).toContain(role);
        expect(ROLE_LABEL[role]).toBeDefined();
        expect(ROLE_PURPOSE[role]).toBeDefined();
      }
    }
  });

  it("covers the four planes of the 2025 MAD landscape", () => {
    const planes = new Set(Object.values(STACK).map((s) => s.plane));
    expect([...planes].sort()).toEqual(["ai", "analytics", "data", "ml"]);
  });
});

describe("expandStack", () => {
  it("always lays the data floor, even for a single dashboard", () => {
    // Cisco 2025: only 51% of organizations have their data centralized. The
    // floor is the work, not an assumption.
    const layers = expandStack(["bi"], ["descriptive"]);
    expect(layers).toContain("ingestion");
    expect(layers).toContain("objectStore");
    expect(layers).toContain("catalog");
    expect(layers).toContain("governance");
  });

  it("pulls in the layers a thin tool list forgets", () => {
    // The point of the file: 'needs a vector database' is not a plan. It drags
    // in retrieval, a gateway, evals, observability and security.
    const layers = expandStack(["vectordb"], []);
    expect(layers).toEqual(expect.arrayContaining(["retrieval", "llmGateway", "evals", "aiObservability", "aiSecurity"]));
  });

  it("gives an agent a runtime, and a dashboard none", () => {
    expect(expandStack(["agent"], [])).toContain("agentRuntime");
    expect(expandStack(["bi"], ["descriptive"])).not.toContain("agentRuntime");
  });

  it("adds the ML plane from the tier alone, with no ML tag on the case", () => {
    const layers = expandStack(["warehouse"], ["predictive"]);
    expect(layers).toEqual(expect.arrayContaining(["featureStore", "training", "serving", "modelMonitoring"]));
  });

  it("returns layers in pipeline order regardless of input order", () => {
    const order = Object.keys(STACK) as StackLayer[];
    const layers = expandStack(["agent", "bi", "ingestion"], ["generative"]);
    const positions = layers.map((l) => order.indexOf(l));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("never repeats a layer however many capabilities imply it", () => {
    const layers = expandStack(["llm", "vectordb", "agent"], ["generative"]);
    expect(new Set(layers).size).toBe(layers.length);
  });

  it("grows monotonically as a selection gets more ambitious", () => {
    const dashboard = expandStack(["bi", "warehouse"], ["descriptive"]).length;
    const predictive = expandStack(["bi", "warehouse", "ml"], ["predictive"]).length;
    const agentic = expandStack(["bi", "warehouse", "ml", "agent"], ["generative"]).length;

    expect(predictive).toBeGreaterThan(dashboard);
    expect(agentic).toBeGreaterThan(predictive);
  });
});

describe("byPlane", () => {
  it("drops planes with nothing in them", () => {
    const groups = byPlane(expandStack(["bi"], ["descriptive"]));
    expect(groups.map((g) => g.plane)).not.toContain("ai");
    expect(groups.every((g) => g.layers.length > 0)).toBe(true);
  });

  it("keeps the data → analytics → ml → ai reading order", () => {
    const groups = byPlane(expandStack(["bi", "ml", "agent"], ["generative"]));
    expect(groups.map((g) => g.plane)).toEqual(["data", "analytics", "ml", "ai"]);
  });
});

describe("roles derived from the stack", () => {
  it("puts a security engineer on an agent project nobody asked one for", () => {
    // No use case lists a security engineer in its effort map. The layer needs
    // an owner, so the plan has to name one.
    const agentCase = USE_CASES.find((u) => u.tech.includes("agent"))!;
    expect(agentCase.effort.securityEngineer).toBeUndefined();

    const layers = expandStack(agentCase.tech, [agentCase.tier]);
    expect(rolesForStack(layers)).toContain("securityEngineer");
  });

  it("does not staff ML or AI seats onto a plain reporting project", () => {
    // The constraint Dante set: not every profile belongs on every project.
    const roll = rollUpUseCases([byId("fin-cockpit"), byId("h2r-headcount")]);
    const roles = rolesForStack(expandStack(roll.tech, ["descriptive"]));

    expect(roles).not.toContain("mlEngineer");
    expect(roles).not.toContain("fde");
    expect(roles).not.toContain("securityEngineer");
  });

  it("always staffs governance, because every project lands data", () => {
    const roles = rolesForStack(expandStack(["bi"], ["descriptive"]));
    expect(roles).toContain("governanceLead");
  });

  it("explains why each role is on the team", () => {
    const layers = expandStack(["agent", "ml", "bi"], ["generative"]);
    for (const role of rolesForStack(layers)) {
      expect(layersNeedingRole(layers, role).length).toBeGreaterThan(0);
    }
  });

  it("leaves a single dashboard without a PM, and staffs one for a real programme", () => {
    // Restraint is the point: not every profile belongs on every project.
    const oneDashboard = expandStack(["bi"], ["descriptive"]);
    expect(coordinationRoles(1, oneDashboard)).not.toContain("productManager");

    const programme = expandStack(["bi", "ml", "agent"], ["generative"]);
    expect(coordinationRoles(6, programme)).toContain("productManager");
  });

  it("staffs change management the moment output reaches a human", () => {
    // Cisco 2025: only a third have a formal change plan, and that gap is
    // where a technically finished build stops producing value.
    expect(coordinationRoles(1, expandStack(["bi"], ["descriptive"]))).toContain("changeManager");
    // A pure back-end pipeline with no surface does not need one.
    expect(coordinationRoles(1, expandStack(["ingestion"], []))).not.toContain("changeManager");
  });

  it("grows the roster with the ambition of the selection", () => {
    const reporting = rolesForStack(expandStack(["bi", "warehouse"], ["descriptive"]));
    const agentic = rolesForStack(expandStack(["bi", "warehouse", "ml", "agent"], ["generative"]));
    expect(agentic.length).toBeGreaterThan(reporting.length);
  });
});
