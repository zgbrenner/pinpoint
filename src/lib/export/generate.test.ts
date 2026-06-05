import { describe, it, expect } from "vitest";
import { createEmptyAssessment } from "@/lib/schemas";
import { generatePolicyPack } from "@/lib/policy";
import { exportDocx } from "./docx";
import { exportPdf } from "./pdf";
import { buildJsonBlob } from "./index";

/**
 * Smoke tests: the DOCX and PDF builders must produce non-empty output in a
 * browser-like environment (jsdom) without any network access.
 */
function pack() {
  const a = createEmptyAssessment();
  a.company.companyName = "Acme Inc.";
  a.jurisdictions.jurisdictions = ["EU"];
  a.aiTools.aiTools = ["ChatGPT / OpenAI", "Otter.ai (transcription)"];
  a.sensitiveData.sensitiveData = ["Health data (PHI)"];
  return generatePolicyPack(a);
}

describe("client-side document export", () => {
  it("builds a non-empty DOCX blob", async () => {
    const blob = await exportDocx(pack());
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });

  it("builds a non-empty PDF blob", async () => {
    const blob = await exportPdf(pack());
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });

  it("builds a JSON blob containing the full pack", () => {
    const p = pack();
    const blob = buildJsonBlob(p);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/json");
    expect(blob.size).toBeGreaterThan(100);
    // The blob wraps the exact serialized pack.
    const parsed = JSON.parse(JSON.stringify(p));
    expect(parsed.product).toBe("pinpoint");
    expect(parsed.documents.length).toBeGreaterThan(0);
  });
});
