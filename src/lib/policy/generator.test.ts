import { describe, it, expect } from "vitest";
import { createEmptyAssessment, type Assessment } from "@/lib/schemas";
import { generatePolicyPack } from "./index";
import { POLICY_DOCUMENT_IDS } from "./types";

function richAssessment(): Assessment {
  const a = createEmptyAssessment();
  a.company.companyName = "Acme Inc.";
  a.company.regulatedSector = true;
  a.jurisdictions.jurisdictions = ["US", "EU"];
  a.jurisdictions.usStates = ["CA"];
  a.aiTools.aiTools = ["ChatGPT / OpenAI", "GitHub Copilot", "Otter.ai (transcription)"];
  a.sensitiveData.sensitiveData = ["Health data (PHI)", "Employee / HR records"];
  a.departments.departments = ["Engineering", "HR / People"];
  a.useCases.useCases = ["Hiring & resume screening (HR)", "Code generation & review"];
  return a;
}

describe("generatePolicyPack", () => {
  it("includes every required document, in canonical order", () => {
    const pack = generatePolicyPack(richAssessment());
    const ids = pack.documents.map((d) => d.id);
    expect(ids).toEqual([...POLICY_DOCUMENT_IDS]);
    POLICY_DOCUMENT_IDS.forEach((id) => expect(ids).toContain(id));
  });

  it("produces non-empty, readable content for each document", () => {
    const pack = generatePolicyPack(richAssessment());
    pack.documents.forEach((doc) => {
      expect(doc.title.length).toBeGreaterThan(3);
      expect(doc.summary.length).toBeGreaterThan(3);
      const hasClauseText = doc.clauses.some(
        (c) => c.body.length > 0 || (c.bullets?.length ?? 0) > 0,
      );
      const hasTable = (doc.table?.rows.length ?? 0) > 0;
      expect(hasClauseText || hasTable).toBe(true);
    });
  });

  it("personalizes content with the company name", () => {
    const pack = generatePolicyPack(richAssessment());
    const aup = pack.documents.find((d) => d.id === "acceptable-use")!;
    const text = JSON.stringify(aup);
    expect(text).toContain("Acme Inc.");
  });

  it("reflects approved-tool overrides in the tool matrix", () => {
    const a = richAssessment();
    a.packMeta.approvedTools = ["ChatGPT / OpenAI"];
    const pack = generatePolicyPack(a);
    const matrix = pack.documents.find((d) => d.id === "tool-matrix")!;
    const chatgptRow = matrix.table!.rows.find((r) => r[0] === "ChatGPT / OpenAI")!;
    expect(chatgptRow[2]).toBe("Approved");
  });

  it("exposes a serializable JSON export object (Sonomos-ready)", () => {
    const pack = generatePolicyPack(richAssessment());
    const json = JSON.stringify(pack);
    const parsed = JSON.parse(json);
    expect(parsed.product).toBe("pinpoint");
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.scoring.riskLevel).toBeDefined();
    expect(Array.isArray(parsed.jurisdictionRequirements)).toBe(true);
    expect(Array.isArray(parsed.recommendedControls)).toBe(true);
    expect(Array.isArray(parsed.riskRegister)).toBe(true);
    expect(parsed.documents.length).toBe(POLICY_DOCUMENT_IDS.length);
  });

  it("builds a risk register and recommended controls", () => {
    const pack = generatePolicyPack(richAssessment());
    expect(pack.riskRegister.length).toBeGreaterThan(0);
    expect(pack.recommendedControls.length).toBeGreaterThan(0);
    expect(pack.missingControls.length).toBeLessThanOrEqual(
      pack.recommendedControls.length,
    );
  });

  it("includes a no-legal-advice disclaimer", () => {
    const pack = generatePolicyPack(richAssessment());
    expect(pack.disclaimer.toLowerCase()).toContain("not legal advice");
    const legalDoc = pack.documents.find((d) => d.id === "legal-review-notes")!;
    expect(JSON.stringify(legalDoc).toLowerCase()).toContain("not legal advice");
  });

  it("generates a usable pack even from an empty assessment", () => {
    const pack = generatePolicyPack(createEmptyAssessment());
    expect(pack.documents.map((d) => d.id)).toEqual([...POLICY_DOCUMENT_IDS]);
  });
});
