import { describe, it, expect } from "vitest";
import { createEmptyAssessment, type Assessment } from "@/lib/schemas";
import { deriveEngineInput } from "./index";
import { scoreEngineInput, deriveSignals } from "./scoring";

function score(mutate: (a: Assessment) => void) {
  const a = createEmptyAssessment();
  mutate(a);
  return scoreEngineInput(deriveEngineInput(a));
}

describe("scoreEngineInput", () => {
  it("returns Low risk and a clamped maturity for a governed, minimal setup", () => {
    const result = score((a) => {
      a.riskWorkflow.approvalWorkflow = "committee";
      a.riskWorkflow.approvedToolListExists = true;
      a.riskWorkflow.humanReviewRequired = true;
      a.riskWorkflow.riskTolerance = "conservative";
    });
    expect(result.maturityScore).toBeGreaterThan(70);
    expect(result.maturityScore).toBeLessThanOrEqual(100);
    expect(result.riskLevel).toBe("Low");
  });

  it("escalates risk level when sensitive data + free tools + no governance", () => {
    const result = score((a) => {
      a.aiTools.aiTools = ["ChatGPT / OpenAI", "Perplexity"];
      a.sensitiveData.sensitiveData = ["Health data (PHI)", "Biometric data", "Children's data"];
      a.riskWorkflow.approvalWorkflow = "none";
      a.riskWorkflow.humanReviewRequired = false;
    });
    expect(["High", "Critical"]).toContain(result.riskLevel);
  });

  it("detects free/public tools, coding assistants, transcription, and extensions", () => {
    const signals = score((a) => {
      a.aiTools.aiTools = [
        "ChatGPT / OpenAI",
        "GitHub Copilot",
        "Otter.ai (transcription)",
        "AI browser extension",
      ];
    }).signals;
    expect(signals.freePublicToolCount).toBeGreaterThan(0);
    expect(signals.usesCodingAssistants).toBe(true);
    expect(signals.usesMeetingTranscription).toBe(true);
    expect(signals.usesBrowserExtensions).toBe(true);
  });

  it("caps risk flags at ten and sorts most severe first", () => {
    const result = score((a) => {
      a.aiTools.aiTools = ["ChatGPT", "Copilot", "Otter", "AI browser extension", "Perplexity"];
      a.sensitiveData.sensitiveData = ["PHI", "Biometric", "Children's data", "Financial"];
      a.useCases.useCases = [
        "Hiring & resume screening (HR)",
        "Credit / lending decisions",
        "Automated decisions affecting people",
      ];
      a.jurisdictions.jurisdictions = ["EU"];
      a.riskWorkflow.approvalWorkflow = "none";
      a.riskWorkflow.humanReviewRequired = false;
    });
    expect(result.topRiskFlags.length).toBeLessThanOrEqual(10);
    const ranks = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    for (let i = 1; i < result.topRiskFlags.length; i++) {
      expect(ranks[result.topRiskFlags[i].severity]).toBeGreaterThanOrEqual(
        ranks[result.topRiskFlags[i - 1].severity],
      );
    }
  });

  it("is deterministic for identical input", () => {
    const a = createEmptyAssessment();
    a.aiTools.aiTools = ["ChatGPT / OpenAI"];
    const s1 = scoreEngineInput(deriveEngineInput(a));
    const s2 = scoreEngineInput(deriveEngineInput(a));
    expect(s1).toEqual(s2);
  });

  it("derives high-stakes domains from use cases", () => {
    const a = createEmptyAssessment();
    a.useCases.useCases = ["Healthcare / clinical support", "Biometric processing"];
    const signals = deriveSignals(deriveEngineInput(a));
    expect(signals.highStakesDomains).toContain("healthcare");
    expect(signals.highStakesDomains).toContain("biometrics");
  });
});
