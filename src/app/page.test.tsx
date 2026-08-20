import { describe, it, expect } from "vitest";
import { DataRevLanding } from "../components/DataRevLanding";

describe("DataRev Landing Components", () => {
  it("exports valid DataRevLanding component function", () => {
    expect(typeof DataRevLanding).toBe("function");
  });
});
