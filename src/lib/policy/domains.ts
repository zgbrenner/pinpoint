import type { UseCaseDomain } from "./types";

/**
 * Map free-text use cases, sensitive-data categories, and departments to the
 * high-stakes domains that drive jurisdiction requirements and risk scoring.
 * Deterministic keyword mapping — no inference, no I/O.
 */

const DOMAIN_PATTERNS: Record<UseCaseDomain, RegExp[]> = {
  "hr-employment": [/\bhr\b|hiring|recruit|resume|cv|candidate|employee|workforce|payroll/i],
  credit: [/credit|lending|loan|underwrit/i],
  insurance: [/insurance|claims|actuar|premium/i],
  healthcare: [/health|patient|clinical|medical|phi|diagnos/i],
  legal: [/legal|contract|privileg|litigation|counsel/i],
  education: [/education|student|school|grading|tutor|exam/i],
  finance: [/financ|accounting|invoice|payment|fraud|aml|kyc/i],
  "customer-decisioning": [/customer (decision|scoring)|eligibility|pricing|churn|segment/i],
  biometrics: [/biometr|face|facial|voiceprint|fingerprint|gait/i],
  "children-teens": [/child|minor|teen|kids|under.?13|under.?18|coppa/i],
  "automated-decision-making": [
    /automat(ed|ic).*(decision|approval|reject)|decision(ing)?|adverse action|no human/i,
  ],
  "content-generation": [/content|copywrit|marketing|image|draft|blog|social/i],
  "general-productivity": [/summar|notes|search|research|email|document|productivity/i],
};

/** Derive the set of high-stakes domains present across the provided text. */
export function deriveDomains(inputs: string[]): UseCaseDomain[] {
  const haystack = inputs.join(" • ");
  const found = new Set<UseCaseDomain>();
  (Object.keys(DOMAIN_PATTERNS) as UseCaseDomain[]).forEach((domain) => {
    if (DOMAIN_PATTERNS[domain].some((p) => p.test(haystack))) {
      found.add(domain);
    }
  });
  return [...found];
}

/** Domains considered "high-stakes" for risk weighting (excludes generic ones). */
export const HIGH_STAKES_DOMAINS: UseCaseDomain[] = [
  "hr-employment",
  "credit",
  "insurance",
  "healthcare",
  "legal",
  "education",
  "finance",
  "customer-decisioning",
  "biometrics",
  "children-teens",
  "automated-decision-making",
];

export const DOMAIN_LABELS: Record<UseCaseDomain, string> = {
  "hr-employment": "HR & employment",
  credit: "Credit & lending",
  insurance: "Insurance",
  healthcare: "Healthcare",
  legal: "Legal",
  education: "Education",
  finance: "Finance",
  "customer-decisioning": "Customer decisioning",
  biometrics: "Biometrics",
  "children-teens": "Children & teens",
  "automated-decision-making": "Automated decision-making",
  "content-generation": "Content generation",
  "general-productivity": "General productivity",
};
