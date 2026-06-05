import type {
  EngineInput,
  RiskRegisterItem,
  RiskLevel,
  ScoringResult,
} from "./types";
import { DOMAIN_LABELS } from "./domains";

/**
 * Build a Shadow-AI / AI risk register from the assessment signals.
 * Deterministic mapping from signals to register rows with inherent and
 * residual risk ratings. Pure function — no I/O.
 */

const SEVERITY_TO_LEVEL: Record<string, RiskLevel> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function downgrade(level: RiskLevel): RiskLevel {
  const order: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
  const i = order.indexOf(level);
  return order[Math.max(0, i - 1)];
}

export function buildRiskRegister(
  input: EngineInput,
  scoring: ScoringResult,
): RiskRegisterItem[] {
  const owner = input.meta.policyOwner || "AI Policy Owner";
  const items: RiskRegisterItem[] = [];

  const add = (
    id: string,
    risk: string,
    category: string,
    likelihood: RiskLevel,
    impact: RiskLevel,
    mitigation: string,
  ) => {
    const order: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
    const inherent = order[Math.max(order.indexOf(likelihood), order.indexOf(impact))];
    items.push({
      id,
      risk,
      category,
      likelihood,
      impact,
      inherentRisk: inherent,
      mitigation,
      residualRisk: downgrade(inherent),
      owner,
    });
  };

  const s = scoring.signals;

  if (s.freePublicToolCount > 0) {
    add(
      "rr-free-public",
      "Sensitive or confidential data entered into free/public AI tools.",
      "Data leakage",
      "High",
      s.sensitiveCategoryCount > 0 ? "Critical" : "High",
      "Restrict free tiers to non-sensitive data; provide approved enterprise alternatives; apply DLP.",
    );
  }
  if (!s.hasApprovedToolList || !s.hasApprovalProcess) {
    add(
      "rr-shadow-ai",
      "Unsanctioned AI tools adopted without review (shadow AI).",
      "Governance",
      "High",
      "High",
      "Publish an approved-tool list and a lightweight approval workflow; communicate to all staff.",
    );
  }
  if (s.usesBrowserExtensions) {
    add(
      "rr-extensions",
      "AI browser extensions exfiltrate page content across sites.",
      "Data leakage",
      "Medium",
      "High",
      "Block unreviewed extensions via endpoint controls; allowlist vetted extensions only.",
    );
  }
  if (s.usesMeetingTranscription) {
    add(
      "rr-transcription",
      "Meeting bots record conversations without consent or retention limits.",
      "Privacy",
      "Medium",
      "High",
      "Require participant notice/consent; set retention/deletion; restrict in privileged meetings.",
    );
  }
  if (s.usesCodingAssistants) {
    add(
      "rr-code-leak",
      "Proprietary code or secrets leak through AI coding assistants.",
      "IP / Data leakage",
      "Medium",
      "High",
      "Use enterprise tiers with training opt-out; block secrets; configure repo exclusions.",
    );
  }
  if (s.sensitiveCategoryCount > 0) {
    add(
      "rr-sensitive",
      "Regulated/sensitive data processed by AI without minimization.",
      "Privacy",
      "Medium",
      "High",
      "Apply data minimization, lawful basis, and DPIAs; prohibit sensitive data in unapproved tools.",
    );
  }
  s.highStakesDomains.forEach((d) => {
    add(
      `rr-domain-${d}`,
      `Unfair, inaccurate, or non-compliant AI outcomes in ${DOMAIN_LABELS[d].toLowerCase()}.`,
      "High-stakes",
      "Medium",
      d === "biometrics" || d === "children-teens" ? "Critical" : "High",
      "Classify as higher-risk; require human review and bias testing; document decision logic.",
    );
  });
  if (!s.humanReviewRequired) {
    add(
      "rr-no-review",
      "Consequential AI outputs actioned without human oversight.",
      "Oversight",
      "Medium",
      "High",
      "Require human-in-the-loop review for decisions affecting people or finances.",
    );
  }

  // Always include a couple of foundational governance risks.
  add(
    "rr-accuracy",
    "Inaccurate or fabricated AI output ('hallucination') relied upon.",
    "Assurance",
    "Medium",
    "Medium",
    "Mandate verification of AI output; prohibit unreviewed use for factual or legal claims.",
  );
  add(
    "rr-training-gap",
    "Staff lack awareness of safe AI use and disclosure duties.",
    "People",
    "Medium",
    "Medium",
    "Deliver AI literacy training and require attestation to the acceptable use policy.",
  );

  // Top flags that aren't already represented become register lines too.
  scoring.topRiskFlags.forEach((flag) => {
    if (items.some((i) => i.id === `rr-${flag.id}`)) return;
    if (["no-approval", "no-approved-list", "free-public-tools"].includes(flag.id)) return;
    add(
      `rr-${flag.id}`,
      flag.detail,
      flag.category,
      SEVERITY_TO_LEVEL[flag.severity] ?? "Medium",
      SEVERITY_TO_LEVEL[flag.severity] ?? "Medium",
      "See recommended controls for the corresponding mitigation.",
    );
  });

  return items;
}
