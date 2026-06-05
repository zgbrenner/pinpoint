import { describe, it, expect } from "vitest";
import {
  assessmentSchema,
  createEmptyAssessment,
  companyProfileSchema,
} from "./schemas";

describe("assessment schemas", () => {
  it("creates a valid empty assessment with defaults", () => {
    const a = createEmptyAssessment();
    expect(a.version).toBe(1);
    expect(a.company.companySize).toBe("11-50");
    expect(a.jurisdictions.jurisdictions).toEqual([]);
    expect(a.riskWorkflow.humanReviewRequired).toBe(true);
  });

  it("rejects an unknown company size", () => {
    const result = companyProfileSchema.safeParse({ companySize: "huge" });
    expect(result.success).toBe(false);
  });

  it("re-parsing applies defaults to a partial draft", () => {
    const partial = { id: "draft", company: { companySize: "1-10" } };
    const parsed = assessmentSchema.parse(partial);
    expect(parsed.company.companySize).toBe("1-10");
    expect(parsed.aiTools.aiTools).toEqual([]);
    expect(parsed.riskWorkflow.approvalWorkflow).toBe("manager");
  });

  it("trims and bounds free-form tags via the schema", () => {
    const parsed = assessmentSchema.parse({
      aiTools: { aiTools: ["  ChatGPT  "] },
    });
    expect(parsed.aiTools.aiTools[0]).toBe("ChatGPT");
  });
});
