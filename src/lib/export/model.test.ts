import { describe, it, expect } from "vitest";
import { createEmptyAssessment, type Assessment } from "@/lib/schemas";
import { generatePolicyPack } from "@/lib/policy";
import { POLICY_DOCUMENT_IDS } from "@/lib/policy/types";
import { buildExportModel, exportBaseName } from "./model";

function pack() {
  const a: Assessment = createEmptyAssessment();
  a.company.companyName = "Acme Inc.";
  a.jurisdictions.jurisdictions = ["US", "EU"];
  a.jurisdictions.usStates = ["CA"];
  a.aiTools.aiTools = ["ChatGPT / OpenAI", "GitHub Copilot"];
  a.sensitiveData.sensitiveData = ["Health data (PHI)"];
  a.packMeta.policyOwner = "Head of Compliance";
  return generatePolicyPack(a);
}

describe("buildExportModel", () => {
  it("includes cover metadata: company, date, jurisdictions, owner", () => {
    const m = buildExportModel(pack());
    expect(m.companyName).toBe("Acme Inc.");
    expect(m.generatedDate.length).toBeGreaterThan(3);
    expect(m.jurisdictionsLabel).toContain("United States");
    expect(m.jurisdictionsLabel).toContain("European Union");
    expect(m.jurisdictionsLabel).toContain("CA");
    expect(m.owner).toBe("Head of Compliance");
  });

  it("carries the disclaimer and privacy/no-retention statement", () => {
    const m = buildExportModel(pack());
    expect(m.disclaimer.toLowerCase()).toContain("not legal advice");
    expect(m.privacyStatement.toLowerCase()).toContain("not uploaded");
  });

  it("builds a TOC covering every section", () => {
    const m = buildExportModel(pack());
    expect(m.toc.length).toBe(m.sections.length);
    // Risk summary + all policy documents.
    expect(m.sections.length).toBe(POLICY_DOCUMENT_IDS.length + 1);
    expect(m.sections[0].title).toBe("Risk & Maturity Summary");
  });

  it("renders the tool matrix as a table block", () => {
    const m = buildExportModel(pack());
    const matrix = m.sections.find((s) => s.title.includes("Tool Matrix"));
    expect(matrix).toBeDefined();
    const table = matrix!.blocks.find((b) => b.type === "table");
    expect(table).toBeDefined();
  });

  it("produces a filesystem-safe base name", () => {
    const name = exportBaseName(pack());
    expect(name).toMatch(/^[a-z0-9-]+$/);
    expect(name).toContain("acme-inc");
  });

  it("falls back gracefully for an empty assessment", () => {
    const m = buildExportModel(generatePolicyPack(createEmptyAssessment()));
    expect(m.companyName).toBe("Your Organization");
    expect(m.jurisdictionsLabel.toLowerCase()).toContain("none selected");
  });
});
