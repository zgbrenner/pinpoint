import type { Assessment, Jurisdiction } from "./schemas";

/**
 * Placeholder risk scoring & policy-pack planning.
 *
 * This is intentionally a transparent, deterministic heuristic that runs
 * entirely in the browser. It is NOT legal advice and NOT a real maturity
 * model — it exists so the results dashboard has meaningful structure to show.
 * A later prompt will replace the heuristic with the real policy generator.
 */

export interface RiskFlag {
  id: string;
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface PolicyPackItem {
  id: string;
  title: string;
  /** Whether the assessment suggests this control is needed. */
  recommended: boolean;
}

export interface JurisdictionCoverage {
  jurisdiction: Jurisdiction;
  label: string;
  frameworks: string[];
}

export interface AssessmentResult {
  riskScore: number; // 0-100, higher = more attention needed
  riskBand: "low" | "moderate" | "elevated" | "high";
  coverage: JurisdictionCoverage[];
  topRiskFlags: RiskFlag[];
  policyPack: PolicyPackItem[];
}

const JURISDICTION_FRAMEWORKS: Record<Jurisdiction, { label: string; frameworks: string[] }> = {
  US: { label: "United States", frameworks: ["NIST AI RMF", "State privacy laws", "Sector rules"] },
  EU: { label: "European Union", frameworks: ["EU AI Act", "GDPR"] },
  UK: { label: "United Kingdom", frameworks: ["UK GDPR", "ICO guidance"] },
  CA: { label: "Canada", frameworks: ["PIPEDA", "AIDA (proposed)"] },
};

function band(score: number): AssessmentResult["riskBand"] {
  if (score < 25) return "low";
  if (score < 50) return "moderate";
  if (score < 75) return "elevated";
  return "high";
}

/**
 * Compute a transparent heuristic result from the assessment.
 * Pure function — no side effects, no I/O — so it is trivially testable.
 */
export function scoreAssessment(a: Assessment): AssessmentResult {
  let score = 10; // baseline: adopting AI at all carries some governance need
  const flags: RiskFlag[] = [];

  const sensitiveCount = a.sensitiveData.sensitiveData.length;
  if (sensitiveCount > 0) {
    score += Math.min(30, sensitiveCount * 8);
    flags.push({
      id: "sensitive-data",
      title: "Sensitive data in scope",
      detail: `${sensitiveCount} sensitive data ${
        sensitiveCount === 1 ? "category is" : "categories are"
      } handled. Recommended controls cover minimization and access.`,
      severity: sensitiveCount >= 3 ? "high" : "medium",
    });
  }

  if (a.company.regulatedSector) {
    score += 15;
    flags.push({
      id: "regulated-sector",
      title: "Regulated sector",
      detail: "Operating in a regulated sector raises documentation and oversight expectations.",
      severity: "high",
    });
  }

  const jCount = a.jurisdictions.jurisdictions.length;
  if (jCount === 0) {
    flags.push({
      id: "no-jurisdiction",
      title: "No jurisdiction selected",
      detail: "Add the regions where you operate so coverage can be mapped.",
      severity: "medium",
    });
  } else {
    score += Math.min(15, jCount * 4);
  }

  if (a.jurisdictions.jurisdictions.includes("EU")) {
    flags.push({
      id: "eu-ai-act",
      title: "EU AI Act applies",
      detail: "Classify each AI use case by risk tier and document accordingly.",
      severity: "medium",
    });
  }

  const toolCount = a.aiTools.aiTools.length;
  if (toolCount >= 5) {
    score += 10;
    flags.push({
      id: "tool-sprawl",
      title: "Multiple AI tools in use",
      detail: `${toolCount} tools reported. An approved-tools register is recommended.`,
      severity: "medium",
    });
  }

  if (a.riskWorkflow.approvalWorkflow === "none") {
    score += 12;
    flags.push({
      id: "no-approval",
      title: "No approval workflow",
      detail: "Define at least a lightweight review path for new AI use cases.",
      severity: "high",
    });
  }

  if (!a.riskWorkflow.humanReviewRequired) {
    score += 8;
    flags.push({
      id: "no-human-review",
      title: "Human review not required",
      detail: "Consider human-in-the-loop checks for higher-impact decisions.",
      severity: "medium",
    });
  }

  // Conservative tolerance slightly lowers residual risk; progressive raises it.
  if (a.riskWorkflow.riskTolerance === "conservative") score -= 5;
  if (a.riskWorkflow.riskTolerance === "progressive") score += 8;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const coverage: JurisdictionCoverage[] = a.jurisdictions.jurisdictions.map(
    (j) => ({
      jurisdiction: j,
      label: JURISDICTION_FRAMEWORKS[j].label,
      frameworks: JURISDICTION_FRAMEWORKS[j].frameworks,
    }),
  );

  const policyPack = buildPolicyPack(a);

  // Surface the most severe flags first.
  const severityRank = { high: 0, medium: 1, low: 2 } as const;
  const topRiskFlags = [...flags]
    .sort((x, y) => severityRank[x.severity] - severityRank[y.severity])
    .slice(0, 5);

  return { riskScore: score, riskBand: band(score), coverage, topRiskFlags, policyPack };
}

/** Recommended policy-pack checklist derived from the assessment. */
export function buildPolicyPack(a: Assessment): PolicyPackItem[] {
  const has = (arr: unknown[]) => arr.length > 0;
  return [
    { id: "acceptable-use", title: "Acceptable Use Policy", recommended: true },
    { id: "approved-tools", title: "Approved AI Tools Register", recommended: has(a.aiTools.aiTools) },
    {
      id: "data-handling",
      title: "Data Handling & Minimization Standard",
      recommended: has(a.sensitiveData.sensitiveData),
    },
    {
      id: "human-oversight",
      title: "Human Oversight & Review Procedure",
      recommended: a.riskWorkflow.humanReviewRequired || a.company.regulatedSector,
    },
    {
      id: "approval-workflow",
      title: "AI Use-Case Approval Workflow",
      recommended: a.riskWorkflow.approvalWorkflow !== "none",
    },
    {
      id: "jurisdiction-addendum",
      title: "Jurisdiction Compliance Addendum",
      recommended: has(a.jurisdictions.jurisdictions),
    },
    {
      id: "incident-response",
      title: "AI Incident Response Plan",
      recommended: true,
    },
    {
      id: "role-guidance",
      title: "Role & Department Guidance",
      recommended: has(a.departments.departments),
    },
  ];
}
