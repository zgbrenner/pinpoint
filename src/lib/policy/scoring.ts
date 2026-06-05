import type {
  EngineInput,
  RiskFlag,
  ScoringResult,
  ScoringSignals,
  RiskLevel,
  Severity,
} from "./types";
import { DOMAIN_LABELS, HIGH_STAKES_DOMAINS } from "./domains";

/**
 * Deterministic scoring engine.
 *
 * Produces an AI policy maturity score (governance posture), an inherent risk
 * score (exposure before controls), an overall risk level, and the top risk
 * flags. Pure function of its input — no randomness, no I/O, fully testable.
 *
 * This is a transparent heuristic to prioritize attention. It is NOT a
 * compliance determination and NOT legal advice.
 */

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Extract the boolean/count signals the scoring model is built on. */
export function deriveSignals(input: EngineInput): ScoringSignals {
  const tools = input.tools.tools;
  const highStakesDomains = input.useCases.domains.filter((d) =>
    HIGH_STAKES_DOMAINS.includes(d),
  );
  return {
    toolCount: tools.length,
    freePublicToolCount: tools.filter((t) => t.freePublic).length,
    usesCodingAssistants: tools.some((t) => t.category === "coding-assistant"),
    usesMeetingTranscription: tools.some(
      (t) => t.category === "meeting-transcription",
    ),
    usesBrowserExtensions: tools.some((t) => t.category === "browser-extension"),
    usesImageGeneration: tools.some((t) => t.category === "image-generation"),
    sensitiveCategoryCount: input.sensitiveData.categories.length,
    highStakesDomains,
    jurisdictionCount: input.jurisdiction.regions.length,
    hasApprovalProcess: input.risk.approvalWorkflow !== "none",
    hasApprovedToolList:
      input.risk.approvedToolListExists || input.meta.approvedTools.length > 0,
    humanReviewRequired: input.risk.humanReviewRequired,
    regulatedSector: input.company.regulatedSector,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Governance maturity: higher is better. Built from controls in place. */
function computeMaturity(s: ScoringSignals, input: EngineInput): number {
  let score = 25; // baseline for engaging with the assessment at all
  if (s.hasApprovalProcess) score += 18;
  if (s.hasApprovedToolList) score += 18;
  if (s.humanReviewRequired) score += 12;
  if (
    input.risk.approvalWorkflow === "central-review" ||
    input.risk.approvalWorkflow === "committee"
  ) {
    score += 10; // centralized governance
  }
  if (input.risk.riskTolerance === "conservative") score += 5;
  if (input.risk.riskTolerance === "progressive") score -= 5;
  if (s.jurisdictionCount > 0) score += 5; // awareness of where you operate
  // Sprawl without governance erodes maturity.
  if (s.toolCount >= 5 && !s.hasApprovedToolList) score -= 8;
  if (s.freePublicToolCount > 0 && !s.hasApprovalProcess) score -= 6;
  return clamp(score);
}

/** Inherent risk: higher is worse. Built from exposure signals. */
function computeInherentRisk(s: ScoringSignals): number {
  let score = 8; // adopting AI carries baseline exposure
  score += Math.min(15, s.toolCount * 2);
  score += Math.min(15, s.freePublicToolCount * 6);
  if (s.usesCodingAssistants) score += 6;
  if (s.usesMeetingTranscription) score += 8;
  if (s.usesBrowserExtensions) score += 10;
  score += Math.min(24, s.sensitiveCategoryCount * 7);
  score += Math.min(24, s.highStakesDomains.length * 8);
  if (s.regulatedSector) score += 10;
  score += Math.min(8, s.jurisdictionCount * 2);
  return clamp(score);
}

/** Combine inherent risk and maturity into an overall level. */
function computeRiskLevel(inherent: number, maturity: number): RiskLevel {
  // Controls offset up to ~40 points of inherent exposure.
  const residual = clamp(inherent - maturity * 0.4);
  if (residual >= 70) return "Critical";
  if (residual >= 45) return "High";
  if (residual >= 22) return "Medium";
  return "Low";
}

/** Build the candidate risk flags, returning the top 10 by severity. */
function buildRiskFlags(s: ScoringSignals, input: EngineInput): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const push = (
    id: string,
    title: string,
    detail: string,
    severity: Severity,
    category: string,
  ) => flags.push({ id, title, detail, severity, category });

  if (!s.hasApprovalProcess) {
    push(
      "no-approval",
      "No AI approval process",
      "New AI tools and use cases can be adopted without review, increasing shadow-AI risk.",
      "high",
      "Governance",
    );
  }
  if (!s.hasApprovedToolList) {
    push(
      "no-approved-list",
      "No approved tool list",
      "Without a tiered tool list, staff lack clear guidance on what is permitted.",
      "high",
      "Governance",
    );
  }
  if (s.freePublicToolCount > 0) {
    push(
      "free-public-tools",
      "Free / public AI tools in use",
      `${s.freePublicToolCount} consumer-tier tool(s) may use inputs for training and lack enterprise data protections.`,
      s.sensitiveCategoryCount > 0 ? "critical" : "high",
      "Data leakage",
    );
  }
  if (s.usesBrowserExtensions) {
    push(
      "browser-extensions",
      "AI browser extensions detected",
      "Browser extensions can read broad page content, including sensitive data, across sites.",
      "high",
      "Data leakage",
    );
  }
  if (s.usesMeetingTranscription) {
    push(
      "meeting-bots",
      "Meeting transcription bots in use",
      "Recording/transcription tools capture conversations that may include confidential or personal data; consent and retention need controls.",
      "medium",
      "Privacy",
    );
  }
  if (s.usesCodingAssistants) {
    push(
      "coding-assistants",
      "AI coding assistants in use",
      "Source code and secrets can leak through coding assistants; configure data controls and IP terms.",
      "medium",
      "IP / Data leakage",
    );
  }
  if (s.sensitiveCategoryCount > 0) {
    push(
      "sensitive-data",
      "Sensitive data in scope",
      `${s.sensitiveCategoryCount} sensitive data categor${
        s.sensitiveCategoryCount === 1 ? "y is" : "ies are"
      } handled; AI inputs need minimization and DLP controls.`,
      s.sensitiveCategoryCount >= 3 ? "high" : "medium",
      "Privacy",
    );
  }
  s.highStakesDomains.forEach((d) => {
    const severity: Severity =
      d === "biometrics" || d === "children-teens" || d === "automated-decision-making"
        ? "high"
        : "medium";
    push(
      `domain-${d}`,
      `High-stakes use case: ${DOMAIN_LABELS[d]}`,
      `AI in ${DOMAIN_LABELS[d].toLowerCase()} can trigger heightened legal duties and fairness expectations.`,
      severity,
      "High-stakes",
    );
  });
  if (!s.humanReviewRequired) {
    push(
      "no-human-review",
      "No human review requirement",
      "Consequential AI outputs may be actioned without human oversight.",
      s.highStakesDomains.length > 0 ? "high" : "medium",
      "Oversight",
    );
  }
  if (input.jurisdiction.regions.includes("EU")) {
    push(
      "eu-ai-act",
      "EU AI Act obligations apply",
      "Classify each AI use case by risk tier and meet transparency/high-risk duties.",
      "medium",
      "Regulatory",
    );
  }
  if (s.jurisdictionCount === 0) {
    push(
      "no-jurisdiction",
      "No jurisdiction selected",
      "Add the regions where you operate so coverage and obligations can be mapped.",
      "medium",
      "Governance",
    );
  }
  if (s.regulatedSector) {
    push(
      "regulated-sector",
      "Regulated sector",
      "Operating in a regulated sector raises documentation and oversight expectations.",
      "medium",
      "Regulatory",
    );
  }
  if (s.toolCount >= 5 && !s.hasApprovedToolList) {
    push(
      "tool-sprawl",
      "AI tool sprawl",
      `${s.toolCount} tools reported without an approved-tool register to govern them.`,
      "medium",
      "Governance",
    );
  }

  return flags
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, 10);
}

/** Score an engine input. */
export function scoreEngineInput(input: EngineInput): ScoringResult {
  const signals = deriveSignals(input);
  const maturityScore = computeMaturity(signals, input);
  const inherentRiskScore = computeInherentRisk(signals);
  const riskLevel = computeRiskLevel(inherentRiskScore, maturityScore);
  const topRiskFlags = buildRiskFlags(signals, input);
  return { maturityScore, inherentRiskScore, riskLevel, topRiskFlags, signals };
}
