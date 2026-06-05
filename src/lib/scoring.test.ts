import { describe, it, expect } from "vitest";
import { createEmptyAssessment } from "./schemas";
import { scoreAssessment, buildPolicyPack } from "./scoring";

describe("scoreAssessment", () => {
  it("returns a low band for an empty assessment", () => {
    const result = scoreAssessment(createEmptyAssessment());
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThan(25);
    expect(result.riskBand).toBe("low");
  });

  it("raises the score for sensitive data + regulated sector", () => {
    const a = createEmptyAssessment();
    a.company.regulatedSector = true;
    a.sensitiveData.sensitiveData = ["PII", "PHI", "Financial"];
    const result = scoreAssessment(a);
    expect(result.riskScore).toBeGreaterThan(40);
    expect(result.topRiskFlags.some((f) => f.id === "regulated-sector")).toBe(true);
    expect(result.topRiskFlags.some((f) => f.id === "sensitive-data")).toBe(true);
  });

  it("clamps the score within 0..100", () => {
    const a = createEmptyAssessment();
    a.company.regulatedSector = true;
    a.sensitiveData.sensitiveData = ["a", "b", "c", "d", "e", "f"];
    a.aiTools.aiTools = ["1", "2", "3", "4", "5", "6"];
    a.jurisdictions.jurisdictions = ["US", "EU", "UK", "CA"];
    a.riskWorkflow.approvalWorkflow = "none";
    a.riskWorkflow.humanReviewRequired = false;
    a.riskWorkflow.riskTolerance = "progressive";
    const result = scoreAssessment(a);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
  });

  it("flags the EU AI Act when EU is selected", () => {
    const a = createEmptyAssessment();
    a.jurisdictions.jurisdictions = ["EU"];
    const result = scoreAssessment(a);
    expect(result.coverage.map((c) => c.jurisdiction)).toContain("EU");
    expect(result.topRiskFlags.some((f) => f.id === "eu-ai-act")).toBe(true);
  });

  it("caps top risk flags at five", () => {
    const a = createEmptyAssessment();
    a.company.regulatedSector = true;
    a.sensitiveData.sensitiveData = ["a", "b", "c"];
    a.aiTools.aiTools = ["1", "2", "3", "4", "5"];
    a.jurisdictions.jurisdictions = ["EU"];
    a.riskWorkflow.approvalWorkflow = "none";
    a.riskWorkflow.humanReviewRequired = false;
    const result = scoreAssessment(a);
    expect(result.topRiskFlags.length).toBeLessThanOrEqual(5);
  });
});

describe("buildPolicyPack", () => {
  it("always recommends acceptable use and incident response", () => {
    const pack = buildPolicyPack(createEmptyAssessment());
    const required = pack.filter((p) =>
      ["acceptable-use", "incident-response"].includes(p.id),
    );
    expect(required.every((p) => p.recommended)).toBe(true);
  });

  it("recommends a data handling standard when sensitive data is present", () => {
    const a = createEmptyAssessment();
    a.sensitiveData.sensitiveData = ["PII"];
    const pack = buildPolicyPack(a);
    expect(pack.find((p) => p.id === "data-handling")?.recommended).toBe(true);
  });
});
