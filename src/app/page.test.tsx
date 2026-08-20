import { describe, it, expect } from "vitest";
import { DataRevLanding } from "../components/DataRevLanding";
import LandingPage from "./page";

describe("DataRevLanding Home Page", () => {
  it("exports valid DataRevLanding and LandingPage components", () => {
    expect(typeof DataRevLanding).toBe("function");
    expect(typeof LandingPage).toBe("function");
  });
});
