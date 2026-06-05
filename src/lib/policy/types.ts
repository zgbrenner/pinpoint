import { z } from "zod";
import {
  COMPANY_SIZES,
  RISK_TOLERANCE,
  APPROVAL_WORKFLOWS,
  JURISDICTIONS,
  jurisdictionSchema,
  type Jurisdiction,
} from "@/lib/schemas";

/**
 * Typed model for the Pinpoint policy engine.
 *
 * PRIVACY: every type here describes data that is created, validated, and
 * consumed entirely in the browser. Nothing in this module performs I/O, makes
 * network calls, or logs values. The engine is a pure function of its inputs.
 *
 * Two groups of types live here:
 *  - INPUT PROFILES (Zod-validated) — the normalized view of an assessment.
 *  - OUTPUT ARTIFACTS (interfaces) — the deterministically generated policy pack.
 */

/* -------------------------------------------------------------------------- */
/*  Input profiles                                                            */
/* -------------------------------------------------------------------------- */

/** Categories we classify AI tools into for risk and tiering purposes. */
export const TOOL_CATEGORIES = [
  "general-llm",
  "coding-assistant",
  "meeting-transcription",
  "browser-extension",
  "image-generation",
  "search-research",
  "internal-self-hosted",
  "other",
] as const;
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

/** Sensitive/high-stakes domains a use case can touch. Drives jurisdiction + risk. */
export const USE_CASE_DOMAINS = [
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
  "content-generation",
  "general-productivity",
] as const;
export type UseCaseDomain = (typeof USE_CASE_DOMAINS)[number];

export const companyProfileSchema = z.object({
  companyName: z.string().trim().max(120).default(""),
  industry: z.string().trim().max(120).default(""),
  companySize: z.enum(COMPANY_SIZES).default("11-50"),
  regulatedSector: z.boolean().default(false),
});
export type CompanyProfile = z.infer<typeof companyProfileSchema>;

export const jurisdictionSelectionSchema = z.object({
  regions: z.array(jurisdictionSchema).default([]),
  /** Optional US state codes (e.g. "CA", "VA") for state-privacy specificity. */
  usStates: z.array(z.string().trim().max(4)).default([]),
});
export type JurisdictionSelection = z.infer<typeof jurisdictionSelectionSchema>;

export const toolEntrySchema = z.object({
  name: z.string().trim().max(80),
  category: z.enum(TOOL_CATEGORIES),
  /** Free/public consumer tier (no enterprise data protections assumed). */
  freePublic: z.boolean().default(false),
});
export type ToolEntry = z.infer<typeof toolEntrySchema>;

export const toolInventorySchema = z.object({
  tools: z.array(toolEntrySchema).default([]),
});
export type ToolInventory = z.infer<typeof toolInventorySchema>;

export const businessSystemInventorySchema = z.object({
  systems: z.array(z.string().trim().max(80)).default([]),
});
export type BusinessSystemInventory = z.infer<typeof businessSystemInventorySchema>;

export const sensitiveDataProfileSchema = z.object({
  categories: z.array(z.string().trim().max(80)).default([]),
});
export type SensitiveDataProfile = z.infer<typeof sensitiveDataProfileSchema>;

export const departmentRoleProfileSchema = z.object({
  departments: z.array(z.string().trim().max(80)).default([]),
});
export type DepartmentRoleProfile = z.infer<typeof departmentRoleProfileSchema>;

export const aiUseCaseProfileSchema = z.object({
  useCases: z.array(z.string().trim().max(120)).default([]),
  /** Derived high-stakes domains the selected use cases touch. */
  domains: z.array(z.enum(USE_CASE_DOMAINS)).default([]),
});
export type AIUseCaseProfile = z.infer<typeof aiUseCaseProfileSchema>;

export const riskToleranceProfileSchema = z.object({
  riskTolerance: z.enum(RISK_TOLERANCE).default("balanced"),
  approvalWorkflow: z.enum(APPROVAL_WORKFLOWS).default("manager"),
  humanReviewRequired: z.boolean().default(true),
  approvedToolListExists: z.boolean().default(false),
});
export type RiskToleranceProfile = z.infer<typeof riskToleranceProfileSchema>;

/** Editable pack metadata (owner, reviewer, dates, approved tools). */
export const policyPackMetaSchema = z.object({
  companyName: z.string().trim().max(120).default(""),
  policyOwner: z.string().trim().max(120).default(""),
  reviewer: z.string().trim().max(120).default(""),
  effectiveDate: z.string().trim().max(40).default(""),
  version: z.string().trim().max(20).default("1.0"),
  /** Tools the organization explicitly approves (overrides default tiering). */
  approvedTools: z.array(z.string().trim().max(80)).default([]),
});
export type PolicyPackMeta = z.infer<typeof policyPackMetaSchema>;

/** The complete, normalized input the engine consumes. */
export const engineInputSchema = z.object({
  company: companyProfileSchema,
  jurisdiction: jurisdictionSelectionSchema,
  tools: toolInventorySchema,
  systems: businessSystemInventorySchema,
  sensitiveData: sensitiveDataProfileSchema,
  departments: departmentRoleProfileSchema,
  useCases: aiUseCaseProfileSchema,
  risk: riskToleranceProfileSchema,
  meta: policyPackMetaSchema,
});
export type EngineInput = z.infer<typeof engineInputSchema>;

/* -------------------------------------------------------------------------- */
/*  Output artifacts                                                          */
/* -------------------------------------------------------------------------- */

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type Severity = "low" | "medium" | "high" | "critical";
export type Priority = "high" | "medium" | "low";

export interface RiskFlag {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
  category: string;
}

export interface RiskRegisterItem {
  id: string;
  risk: string;
  category: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  inherentRisk: RiskLevel;
  mitigation: string;
  residualRisk: RiskLevel;
  owner: string;
}

export interface RecommendedControl {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: Priority;
  /** Risk themes / flag ids this control addresses. */
  addresses: string[];
  relatedDocuments: string[];
  /** Whether the assessment indicates this control is already in place. */
  present: boolean;
}

export interface JurisdictionRequirement {
  id: string;
  region: Jurisdiction;
  /** Short scope label, e.g. "California" or "EU-wide". */
  scope: string;
  name: string;
  summary: string;
  appliesWhen: string;
  obligations: string[];
  relatedControls: string[];
  reference: string;
}

/** A single titled block of policy text (paragraphs and/or bullets). */
export interface PolicyClause {
  id: string;
  heading: string;
  body: string[];
  bullets?: string[];
}

/** A generated policy document. May include a tabular matrix. */
export interface PolicyDocument {
  id: string;
  title: string;
  summary: string;
  clauses: PolicyClause[];
  table?: {
    columns: string[];
    rows: string[][];
  };
}

export interface ScoringSignals {
  toolCount: number;
  freePublicToolCount: number;
  usesCodingAssistants: boolean;
  usesMeetingTranscription: boolean;
  usesBrowserExtensions: boolean;
  usesImageGeneration: boolean;
  sensitiveCategoryCount: number;
  highStakesDomains: UseCaseDomain[];
  jurisdictionCount: number;
  hasApprovalProcess: boolean;
  hasApprovedToolList: boolean;
  humanReviewRequired: boolean;
  regulatedSector: boolean;
}

export interface ScoringResult {
  /** 0-100; higher means a more mature governance posture. */
  maturityScore: number;
  /** 0-100 inherent exposure before controls. */
  inherentRiskScore: number;
  riskLevel: RiskLevel;
  topRiskFlags: RiskFlag[];
  signals: ScoringSignals;
}

/** Canonical, ordered list of documents every pack must contain. */
export const POLICY_DOCUMENT_IDS = [
  "acceptable-use",
  "tool-matrix",
  "data-handling-matrix",
  "role-based-rules",
  "vendor-review-checklist",
  "employee-attestation",
  "shadow-ai-register",
  "guardrail-roadmap",
  "board-gc-memo",
  "privacy-retention-statement",
  "legal-review-notes",
] as const;
export type PolicyDocumentId = (typeof POLICY_DOCUMENT_IDS)[number];

/** The full generated policy pack — also the JSON export shape (Sonomos-ready). */
export interface PolicyPack {
  schemaVersion: 1;
  product: "pinpoint";
  generatedAt: string;
  meta: PolicyPackMeta;
  /** The selected jurisdictions, surfaced for cover pages and the JSON export. */
  jurisdictions: {
    regions: Jurisdiction[];
    usStates: string[];
  };
  scoring: ScoringResult;
  jurisdictionRequirements: JurisdictionRequirement[];
  recommendedControls: RecommendedControl[];
  missingControls: RecommendedControl[];
  riskRegister: RiskRegisterItem[];
  documents: PolicyDocument[];
  disclaimer: string;
}

export { JURISDICTIONS };
export type { Jurisdiction };
