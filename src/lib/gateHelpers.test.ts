import { describe, expect, it } from "vitest";
import {
  formatTeaserNumber,
  isGated,
  lockedAnnouncement,
  teaserWidthCh,
  upgradeTarget,
} from "./gateHelpers";
import { CAPABILITY_COPY, TIERS_COPY } from "./i18nTiers";
import { TIERS, type Capability } from "./tiers";

describe("isGated", () => {
  it("shows the figure only when the tier grants it", () => {
    expect(isGated("plan", "calculator.llm", 1200)).toBe(false);
    expect(isGated("free", "calculator.llm", 1200)).toBe(true);
  });

  it("treats a null as gated even for an entitled tier", () => {
    // A null means the server never serialised the number — `redactFor` output
    // or a missing field. Rendering it would print NaN next to a currency.
    expect(isGated("plan", "calculator.llm", null)).toBe(true);
    expect(isGated("guided", "calculator.headcount", null)).toBe(true);
  });

  it("does not mistake a legitimate zero for a redacted value", () => {
    // Zero cost is a real answer and a paying user is owed it.
    expect(isGated("plan", "calculator.cloud", 0)).toBe(false);
  });
});

describe("upgradeTarget", () => {
  it("names the cheapest tier that unlocks the capability", () => {
    expect(upgradeTarget("free", "calculator.llm")).toBe("plan");
    expect(upgradeTarget("free", "report.pdf")).toBe("diagnostic");
    expect(upgradeTarget("plan", "session.guided")).toBe("guided");
  });

  it("has nothing to sell someone who already paid for it", () => {
    expect(upgradeTarget("plan", "calculator.llm")).toBeNull();
    expect(upgradeTarget("free", "usecases.browse")).toBeNull();
    expect(upgradeTarget("guided", "session.guided")).toBeNull();
  });
});

describe("teaserWidthCh", () => {
  it("falls back to a default rather than collapsing the layout", () => {
    expect(teaserWidthCh()).toBe(5);
    expect(teaserWidthCh(Number.NaN)).toBe(5);
    expect(teaserWidthCh(Number.POSITIVE_INFINITY)).toBe(5);
  });

  it("clamps so a bad caller cannot break the row", () => {
    expect(teaserWidthCh(0)).toBe(2);
    expect(teaserWidthCh(-40)).toBe(2);
    expect(teaserWidthCh(500)).toBe(24);
  });

  it("rounds to whole characters", () => {
    expect(teaserWidthCh(7.4)).toBe(7);
    expect(teaserWidthCh(7.6)).toBe(8);
  });
});

describe("lockedAnnouncement", () => {
  it("says the value is locked and what unlocks it, in the active language", () => {
    const es = lockedAnnouncement("calculator.llm", "es");
    expect(es).toContain(TIERS_COPY.lockedValue.es);
    expect(es).toContain(TIERS.plan.name.es);

    const en = lockedAnnouncement("calculator.llm", "en");
    expect(en).toContain(TIERS_COPY.lockedValue.en);
    expect(en).toContain(TIERS.plan.name.en);
  });

  it("carries the unit, which was never the secret", () => {
    const unit = { es: "USD / mes", en: "USD / month" };
    expect(lockedAnnouncement("calculator.cloud", "es", unit)).toContain(
      "USD / mes",
    );
    expect(lockedAnnouncement("calculator.cloud", "en", unit)).toContain(
      "USD / month",
    );
  });

  it("never announces digits or placeholder glyphs", () => {
    // The whole point: a screen reader must not hear something that could be
    // mistaken for the figure.
    for (const locale of ["es", "en"] as const) {
      const said = lockedAnnouncement("calculator.headcount", locale, {
        es: "personas",
        en: "people",
      });
      expect(said).not.toMatch(/\d/);
      expect(said).not.toContain("•");
    }
  });
});

describe("formatTeaserNumber", () => {
  it("groups thousands the way the rest of the calculator does", () => {
    expect(formatTeaserNumber(1234567, "en")).toBe("1,234,567");
    expect(formatTeaserNumber(1234567, "es")).toMatch(/^1.234.567$/);
  });
});

describe("paywall copy", () => {
  it("can name every capability in both languages", () => {
    // An upgrade card that says "calculator.llm" is honest and useless, so a
    // new capability must arrive with its copy.
    const capabilities = Object.keys(CAPABILITY_COPY) as Capability[];
    for (const capability of capabilities) {
      const copy = CAPABILITY_COPY[capability];
      expect(copy.es.length, capability).toBeGreaterThan(0);
      expect(copy.en.length, capability).toBeGreaterThan(0);
    }
    // Every capability any tier grants has copy — the `satisfies` clause in
    // i18nTiers.ts covers the type, this covers the data.
    for (const tier of Object.values(TIERS)) {
      for (const capability of tier.capabilities) {
        expect(capabilities, tier.id).toContain(capability);
      }
    }
  });
});
