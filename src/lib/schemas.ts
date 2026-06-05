import { z } from "zod";

/**
 * Zod schemas for the Pinpoint assessment.
 *
 * PRIVACY NOTE: These schemas describe data that NEVER leaves the browser.
 * They exist purely to validate the shape of the locally-held draft before we
 * persist it to IndexedDB (via Dexie) or run scoring. No network transport,
 * no server validation, no logging of values.
 */

export const JURISDICTIONS = ["US", "EU", "UK", "CA"] as const;
export const jurisdictionSchema = z.enum(JURISDICTIONS);
export type Jurisdiction = z.infer<typeof jurisdictionSchema>;

export const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
] as const;

export const RISK_TOLERANCE = ["conservative", "balanced", "progressive"] as const;
export const APPROVAL_WORKFLOWS = [
  "none",
  "manager",
  "central-review",
  "committee",
] as const;

/** Step 1 — Company profile. */
export const companyProfileSchema = z.object({
  companyName: z.string().trim().max(120).optional().default(""),
  industry: z.string().trim().max(120).optional().default(""),
  companySize: z.enum(COMPANY_SIZES).default("11-50"),
  regulatedSector: z.boolean().default(false),
});

/** Step 2 — Jurisdictions where the company operates / has staff or customers. */
export const jurisdictionsSchema = z.object({
  jurisdictions: z.array(jurisdictionSchema).default([]),
});

/** Step 3 — AI tools in use. Free-form tags plus a curated checklist. */
export const aiToolsSchema = z.object({
  aiTools: z.array(z.string().trim().max(80)).default([]),
});

/** Step 4 — Business systems / systems of record. */
export const businessSystemsSchema = z.object({
  businessSystems: z.array(z.string().trim().max(80)).default([]),
});

/** Step 5 — Sensitive data categories handled. */
export const sensitiveDataSchema = z.object({
  sensitiveData: z.array(z.string().trim().max(80)).default([]),
});

/** Step 6 — Departments / roles that will use AI. */
export const departmentsSchema = z.object({
  departments: z.array(z.string().trim().max(80)).default([]),
});

/** Step 7 — AI use cases. */
export const useCasesSchema = z.object({
  useCases: z.array(z.string().trim().max(120)).default([]),
});

/** Step 8 — Risk tolerance & approval workflow. */
export const riskWorkflowSchema = z.object({
  riskTolerance: z.enum(RISK_TOLERANCE).default("balanced"),
  approvalWorkflow: z.enum(APPROVAL_WORKFLOWS).default("manager"),
  humanReviewRequired: z.boolean().default(true),
});

/** The full assessment document held locally. */
export const assessmentSchema = z.object({
  // Stable local id so a draft can be re-loaded. NOT a tracking identifier:
  // it is generated in-browser, never transmitted, and removed on "Delete local data".
  id: z.string().default("draft"),
  version: z.literal(1).default(1),
  updatedAt: z.number().default(() => Date.now()),
  company: companyProfileSchema.default({}),
  jurisdictions: jurisdictionsSchema.default({}),
  aiTools: aiToolsSchema.default({}),
  businessSystems: businessSystemsSchema.default({}),
  sensitiveData: sensitiveDataSchema.default({}),
  departments: departmentsSchema.default({}),
  useCases: useCasesSchema.default({}),
  riskWorkflow: riskWorkflowSchema.default({}),
});

export type Assessment = z.infer<typeof assessmentSchema>;

/** A fresh, empty assessment with all defaults applied. */
export function createEmptyAssessment(): Assessment {
  return assessmentSchema.parse({});
}
