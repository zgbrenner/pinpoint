import { describe, it, expect } from "vitest";
import {
  selectJurisdictionRequirements,
  JURISDICTION_LIBRARY,
} from "./jurisdictions";

describe("selectJurisdictionRequirements", () => {
  it("always includes voluntary frameworks regardless of region", () => {
    const reqs = selectJurisdictionRequirements({ regions: [], usStates: [] });
    const ids = reqs.map((r) => r.id);
    expect(ids).toContain("nist-ai-rmf");
    expect(ids).toContain("nist-privacy-framework");
    expect(ids).toContain("uk-aime-self-assessment");
  });

  it("includes GDPR and the EU AI Act when EU is selected", () => {
    const reqs = selectJurisdictionRequirements({ regions: ["EU"], usStates: [] });
    const ids = reqs.map((r) => r.id);
    expect(ids).toContain("eu-gdpr");
    expect(ids).toContain("eu-ai-act");
  });

  it("includes the US common pattern but not a specific state until selected", () => {
    const usOnly = selectJurisdictionRequirements({ regions: ["US"], usStates: [] });
    const ids = usOnly.map((r) => r.id);
    expect(ids).toContain("us-state-common-pattern");
    expect(ids).not.toContain("us-ca");

    const withCa = selectJurisdictionRequirements({ regions: ["US"], usStates: ["CA"] });
    expect(withCa.map((r) => r.id)).toContain("us-ca");
  });

  it("matches US states case-insensitively", () => {
    const reqs = selectJurisdictionRequirements({ regions: ["US"], usStates: ["va"] });
    expect(reqs.map((r) => r.id)).toContain("us-va");
  });

  it("does not include EU entries when only Canada is selected", () => {
    const reqs = selectJurisdictionRequirements({ regions: ["CA"], usStates: [] });
    const ids = reqs.map((r) => r.id);
    expect(ids).toContain("ca-pipeda");
    expect(ids).toContain("ca-quebec-law25");
    expect(ids).not.toContain("eu-gdpr");
  });

  it("returns the public requirement shape with no internal trigger leaking", () => {
    const reqs = selectJurisdictionRequirements({ regions: ["UK"], usStates: [] });
    expect(reqs.length).toBeGreaterThan(0);
    reqs.forEach((r) => {
      expect(r).not.toHaveProperty("trigger");
      expect(typeof r.appliesWhen).toBe("string");
      expect(Array.isArray(r.obligations)).toBe(true);
    });
  });

  it("library covers the five core US state regimes named in the spec", () => {
    const ids = JURISDICTION_LIBRARY.map((e) => e.id);
    ["us-ca", "us-va", "us-co", "us-ct", "us-ut"].forEach((id) =>
      expect(ids).toContain(id),
    );
  });
});
