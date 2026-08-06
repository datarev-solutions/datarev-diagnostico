import { describe, expect, it } from "vitest";
import { DIMENSIONS, type Level } from "./framework";
import { questionsFor } from "./questions";
import { defaultTargets, type Answers } from "./scoring";
import { createState, decodeState, encodeState, type AssessmentState } from "./state";

function filled(mode: "express" | "full"): AssessmentState {
  const answers: Answers = {};
  questionsFor(mode).forEach((question, index) => {
    answers[question.id] = ((index % 5) + 1) as Level;
  });
  return {
    ...createState(mode, "en"),
    answers,
    targets: defaultTargets(4),
    company: {
      name: "Acme Industrial",
      industry: "Manufacturing",
      size: "1,000 – 10,000 employees",
      assessor: "Head of Transformation",
    },
  };
}

describe("state codec", () => {
  it("round-trips a complete assessment", () => {
    const original = filled("full");
    const restored = decodeState(encodeState(original));
    expect(restored).not.toBeNull();
    expect(restored!.mode).toBe("full");
    expect(restored!.locale).toBe("en");
    expect(restored!.answers).toEqual(original.answers);
    expect(restored!.targets).toEqual(original.targets);
    expect(restored!.company).toEqual(original.company);
  });

  it("round-trips express mode", () => {
    const original = filled("express");
    const restored = decodeState(encodeState(original));
    expect(restored!.mode).toBe("express");
    expect(Object.keys(restored!.answers)).toHaveLength(16);
  });

  it("preserves unanswered questions as absent", () => {
    const state = createState("full");
    const questions = questionsFor("full");
    state.answers[questions[0].id] = 4;
    state.answers[questions[7].id] = 2;

    const restored = decodeState(encodeState(state))!;
    expect(Object.keys(restored.answers)).toHaveLength(2);
    expect(restored.answers[questions[0].id]).toBe(4);
    expect(restored.answers[questions[7].id]).toBe(2);
  });

  it("handles non-ASCII company names", () => {
    const state = createState("express");
    state.company.name = "Compañía Eléctrica de Baja — Diagnóstico";
    const restored = decodeState(encodeState(state))!;
    expect(restored.company.name).toBe("Compañía Eléctrica de Baja — Diagnóstico");
  });

  it("omits the company segment when the context is empty", () => {
    const encoded = encodeState(createState("express"));
    expect(encoded.endsWith("~")).toBe(true);
    expect(decodeState(encoded)!.company.name).toBe("");
  });

  it("produces a link short enough to paste into email", () => {
    // Nearly all of the payload is the company context; the 48 answer and
    // target digits cost almost nothing. Well inside the ~2,000 character
    // ceiling that keeps a URL intact through mail clients.
    expect(encodeState(filled("full")).length).toBeLessThan(400);
  });

  it("keeps the answer payload constant regardless of answers given", () => {
    const a = encodeState({ ...filled("full"), company: createState("full").company });
    const b = encodeState(createState("full"));
    expect(a.length).toBe(b.length);
  });

  it("rejects malformed input rather than throwing", () => {
    expect(decodeState("")).toBeNull();
    expect(decodeState("garbage")).toBeNull();
    expect(decodeState("v2~f~111~111~es~")).toBeNull();
    expect(decodeState("v1~f~11~11111111~es~")).toBeNull();
  });

  it("infers the ambition profile from uniform targets", () => {
    const state = { ...createState("full"), targets: defaultTargets(5) };
    expect(decodeState(encodeState(state))!.ambition).toBe("frontier");

    const follower = { ...createState("full"), targets: defaultTargets(3) };
    expect(decodeState(encodeState(follower))!.ambition).toBe("follower");
  });

  it("keeps per-dimension target overrides", () => {
    const state = createState("full");
    state.targets[DIMENSIONS[0].id] = 5;
    state.targets[DIMENSIONS[3].id] = 2;
    const restored = decodeState(encodeState(state))!;
    expect(restored.targets[DIMENSIONS[0].id]).toBe(5);
    expect(restored.targets[DIMENSIONS[3].id]).toBe(2);
  });
});
