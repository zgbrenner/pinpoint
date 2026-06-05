import type {
  EngineInput,
  JurisdictionRequirement,
  RecommendedControl,
  Priority,
} from "./types";
import { HIGH_STAKES_DOMAINS } from "./domains";

/**
 * Recommended-control library.
 *
 * Each control maps to the documents it supports and the risk themes it
 * addresses. The selection function decides which controls apply and whether the
 * assessment suggests they are already in place. Deterministic, no I/O.
 */

interface ControlDef {
  title: string;
  category: string;
  description: string;
  priority: Priority;
  relatedDocuments: string[];
  addresses: string[];
}

export const CONTROL_LIBRARY: Record<string, ControlDef> = {
  "ai-governance-charter": {
    title: "AI Governance Charter & Ownership",
    category: "Governance",
    description:
      "Name an accountable owner (and committee where appropriate) for AI policy, with a defined review cadence.",
    priority: "high",
    relatedDocuments: ["acceptable-use", "board-gc-memo"],
    addresses: ["governance", "accountability"],
  },
  "acceptable-use-policy": {
    title: "AI Acceptable Use Policy",
    category: "Governance",
    description:
      "A written policy defining permitted, restricted, and prohibited AI uses for all staff.",
    priority: "high",
    relatedDocuments: ["acceptable-use", "employee-attestation"],
    addresses: ["governance", "shadow-ai"],
  },
  "approval-workflow": {
    title: "AI Use-Case Approval Workflow",
    category: "Governance",
    description:
      "A defined intake and review path for new AI tools and use cases before adoption.",
    priority: "high",
    relatedDocuments: ["acceptable-use", "vendor-review-checklist"],
    addresses: ["shadow-ai", "vendor-risk"],
  },
  "approved-tool-list": {
    title: "Approved / Restricted / Blocked Tool List",
    category: "Governance",
    description:
      "A maintained register tiering AI tools by approval status, reducing shadow AI.",
    priority: "high",
    relatedDocuments: ["tool-matrix"],
    addresses: ["shadow-ai", "data-leakage"],
  },
  "ai-system-inventory": {
    title: "AI System Inventory",
    category: "Visibility",
    description:
      "An up-to-date inventory of AI systems, their owners, data, and use-case risk tier.",
    priority: "medium",
    relatedDocuments: ["tool-matrix", "shadow-ai-register"],
    addresses: ["visibility", "shadow-ai"],
  },
  "risk-classification": {
    title: "Use-Case Risk Classification",
    category: "Risk",
    description:
      "Classify each AI use case by risk tier (e.g. EU AI Act tiers) to scale obligations.",
    priority: "high",
    relatedDocuments: ["acceptable-use", "guardrail-roadmap"],
    addresses: ["regulatory", "high-stakes"],
  },
  "human-oversight": {
    title: "Human Oversight & Review",
    category: "Oversight",
    description:
      "Require meaningful human review for consequential AI-assisted decisions.",
    priority: "high",
    relatedDocuments: ["role-based-rules", "acceptable-use"],
    addresses: ["automated-decisions", "high-stakes"],
  },
  "data-minimization": {
    title: "Data Minimization for AI Inputs",
    category: "Data",
    description:
      "Limit what data is shared with AI tools; prohibit sensitive data in unapproved tools.",
    priority: "high",
    relatedDocuments: ["data-handling-matrix", "acceptable-use"],
    addresses: ["data-leakage", "privacy"],
  },
  "data-protection-assessment": {
    title: "Data Protection / Impact Assessment",
    category: "Data",
    description:
      "Run DPIAs/assessments for higher-risk processing and profiling activities.",
    priority: "medium",
    relatedDocuments: ["guardrail-roadmap", "board-gc-memo"],
    addresses: ["regulatory", "privacy"],
  },
  dpia: {
    title: "Data Protection Impact Assessment (DPIA)",
    category: "Data",
    description:
      "Formal DPIA for high-risk or large-scale automated processing of personal data.",
    priority: "medium",
    relatedDocuments: ["guardrail-roadmap"],
    addresses: ["regulatory", "privacy"],
  },
  "privacy-notice": {
    title: "Privacy Notice Covering AI Processing",
    category: "Transparency",
    description:
      "Disclose AI/automated processing and its purposes in your external privacy notice.",
    priority: "medium",
    relatedDocuments: ["privacy-retention-statement"],
    addresses: ["transparency", "regulatory"],
  },
  "dsar-process": {
    title: "Data Subject / Consumer Rights Process",
    category: "Transparency",
    description:
      "A documented process to honor access, deletion, correction, and opt-out rights.",
    priority: "medium",
    relatedDocuments: ["privacy-retention-statement"],
    addresses: ["regulatory", "rights"],
  },
  "opt-out-profiling": {
    title: "Profiling / Automated-Decision Opt-Out",
    category: "Rights",
    description:
      "Provide opt-out and review rights for profiling and automated decisions where required.",
    priority: "medium",
    relatedDocuments: ["role-based-rules", "privacy-retention-statement"],
    addresses: ["automated-decisions", "regulatory"],
  },
  "lawful-basis-register": {
    title: "Lawful Basis Register",
    category: "Data",
    description:
      "Document the lawful basis for each AI processing activity on personal data.",
    priority: "medium",
    relatedDocuments: ["data-handling-matrix"],
    addresses: ["regulatory", "privacy"],
  },
  "consent-management": {
    title: "Consent Management",
    category: "Data",
    description:
      "Capture and honor meaningful consent for AI data use where consent is the basis.",
    priority: "medium",
    relatedDocuments: ["data-handling-matrix", "privacy-retention-statement"],
    addresses: ["regulatory", "privacy"],
  },
  "ai-transparency": {
    title: "AI Transparency & Disclosure",
    category: "Transparency",
    description:
      "Disclose AI interaction and label AI-generated content where required or expected.",
    priority: "medium",
    relatedDocuments: ["acceptable-use", "role-based-rules"],
    addresses: ["transparency", "regulatory"],
  },
  "bias-testing": {
    title: "Bias & Fairness Testing",
    category: "Assurance",
    description:
      "Test consequential AI outputs for bias and document mitigations and trade-offs.",
    priority: "medium",
    relatedDocuments: ["guardrail-roadmap"],
    addresses: ["fairness", "high-stakes"],
  },
  "model-documentation": {
    title: "Model / System Documentation",
    category: "Assurance",
    description:
      "Maintain documentation of AI systems, intended use, limitations, and evaluation.",
    priority: "low",
    relatedDocuments: ["vendor-review-checklist"],
    addresses: ["assurance", "regulatory"],
  },
  "ai-literacy-training": {
    title: "AI Literacy & Staff Training",
    category: "People",
    description:
      "Train staff on safe AI use, data handling, and disclosure obligations.",
    priority: "medium",
    relatedDocuments: ["employee-attestation", "role-based-rules"],
    addresses: ["people", "shadow-ai"],
  },
  "vendor-due-diligence": {
    title: "AI Vendor Due Diligence",
    category: "Third-party",
    description:
      "Review AI vendors for security, data use, training opt-out, and contractual terms.",
    priority: "medium",
    relatedDocuments: ["vendor-review-checklist"],
    addresses: ["vendor-risk", "data-leakage"],
  },
  "incident-response": {
    title: "AI Incident Response Plan",
    category: "Resilience",
    description:
      "Define how AI-related incidents (leaks, harmful output, misuse) are detected and handled.",
    priority: "medium",
    relatedDocuments: ["guardrail-roadmap", "board-gc-memo"],
    addresses: ["resilience", "data-leakage"],
  },
  "ai-risk-register": {
    title: "AI Risk Register",
    category: "Risk",
    description:
      "Maintain a living register of AI risks with owners, mitigations, and residual risk.",
    priority: "medium",
    relatedDocuments: ["shadow-ai-register", "guardrail-roadmap"],
    addresses: ["governance", "risk"],
  },
  "retention-schedule": {
    title: "AI Data Retention Schedule",
    category: "Data",
    description:
      "Define retention and deletion for AI inputs, outputs, logs, and transcripts.",
    priority: "low",
    relatedDocuments: ["data-handling-matrix", "privacy-retention-statement"],
    addresses: ["privacy", "data-leakage"],
  },
  "dlp-controls": {
    title: "Data Loss Prevention for AI Channels",
    category: "Security",
    description:
      "Apply DLP/egress controls to limit sensitive data entering AI tools and extensions.",
    priority: "medium",
    relatedDocuments: ["data-handling-matrix", "tool-matrix"],
    addresses: ["data-leakage", "shadow-ai"],
  },
};

export type ControlId = keyof typeof CONTROL_LIBRARY;

/** Decide whether the assessment indicates a control is already in place. */
function isPresent(id: string, input: EngineInput): boolean {
  switch (id) {
    case "approval-workflow":
      return input.risk.approvalWorkflow !== "none";
    case "approved-tool-list":
      return input.risk.approvedToolListExists || input.meta.approvedTools.length > 0;
    case "human-oversight":
      return input.risk.humanReviewRequired;
    case "ai-governance-charter":
      return (
        input.risk.approvalWorkflow === "central-review" ||
        input.risk.approvalWorkflow === "committee"
      );
    default:
      return false;
  }
}

/**
 * Select the recommended controls for an assessment, drawing both from the
 * applicable jurisdiction requirements and from intrinsic risk signals.
 */
export function selectControls(
  input: EngineInput,
  requirements: JurisdictionRequirement[],
): RecommendedControl[] {
  const ids = new Set<string>();

  // Baseline controls every adopter should have.
  [
    "ai-governance-charter",
    "acceptable-use-policy",
    "approval-workflow",
    "approved-tool-list",
    "ai-system-inventory",
    "data-minimization",
    "ai-literacy-training",
    "incident-response",
    "ai-risk-register",
    "vendor-due-diligence",
  ].forEach((id) => ids.add(id));

  // Controls pulled in by applicable jurisdiction requirements.
  requirements.forEach((r) => r.relatedControls.forEach((c) => ids.add(c)));

  // Signal-driven additions.
  if (input.sensitiveData.categories.length > 0) {
    ids.add("dlp-controls");
    ids.add("retention-schedule");
    ids.add("data-protection-assessment");
  }
  const hasHighStakes = input.useCases.domains.some((d) =>
    HIGH_STAKES_DOMAINS.includes(d),
  );
  if (hasHighStakes) {
    ids.add("human-oversight");
    ids.add("risk-classification");
    ids.add("bias-testing");
  }
  if (input.useCases.domains.includes("automated-decision-making")) {
    ids.add("opt-out-profiling");
  }
  if (input.tools.tools.some((t) => t.category === "meeting-transcription")) {
    ids.add("retention-schedule");
    ids.add("ai-transparency");
  }

  const controls: RecommendedControl[] = [...ids]
    .filter((id) => CONTROL_LIBRARY[id])
    .map((id) => {
      const def = CONTROL_LIBRARY[id];
      return {
        id,
        title: def.title,
        category: def.category,
        description: def.description,
        priority: def.priority,
        addresses: def.addresses,
        relatedDocuments: def.relatedDocuments,
        present: isPresent(id, input),
      };
    });

  // Stable, priority-first ordering.
  const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  return controls.sort(
    (a, b) => rank[a.priority] - rank[b.priority] || a.title.localeCompare(b.title),
  );
}
