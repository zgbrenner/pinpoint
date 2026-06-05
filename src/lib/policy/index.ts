import type { Assessment } from "@/lib/schemas";
import {
  engineInputSchema,
  type EngineInput,
  type PolicyPack,
  type PolicyPackMeta,
} from "./types";
import { toToolEntry } from "./tools";
import { deriveDomains } from "./domains";
import { selectJurisdictionRequirements } from "./jurisdictions";
import { selectControls } from "./controls";
import { scoreEngineInput } from "./scoring";
import { buildRiskRegister } from "./register";
import { generateDocuments } from "./generator";

/**
 * Public entry point for the Pinpoint policy engine.
 *
 * PRIVACY: this module is pure. `generatePolicyPack` takes the local assessment
 * (plus optional editable metadata) and returns the full pack synchronously,
 * with no network calls, storage writes, or logging.
 */

const DISCLAIMER =
  "This policy pack is informational guidance generated in your browser from your inputs using deterministic templates. It is not legal advice, does not guarantee compliance, and should be reviewed by qualified counsel before adoption.";

/** Normalize a local Assessment (+ overrides) into the engine's input shape. */
export function deriveEngineInput(
  assessment: Assessment,
  overrides?: Partial<PolicyPackMeta>,
): EngineInput {
  const meta: PolicyPackMeta = {
    companyName: assessment.company.companyName ?? "",
    policyOwner: assessment.packMeta.policyOwner ?? "",
    reviewer: assessment.packMeta.reviewer ?? "",
    effectiveDate: assessment.packMeta.effectiveDate ?? "",
    version: assessment.packMeta.version ?? "1.0",
    approvedTools: assessment.packMeta.approvedTools ?? [],
    ...overrides,
  };

  const domains = deriveDomains([
    ...assessment.useCases.useCases,
    ...assessment.sensitiveData.sensitiveData,
    ...assessment.departments.departments,
  ]);

  return engineInputSchema.parse({
    company: {
      companyName: assessment.company.companyName,
      industry: assessment.company.industry,
      companySize: assessment.company.companySize,
      regulatedSector: assessment.company.regulatedSector,
    },
    jurisdiction: {
      regions: assessment.jurisdictions.jurisdictions,
      usStates: assessment.jurisdictions.usStates ?? [],
    },
    tools: {
      tools: assessment.aiTools.aiTools.map(toToolEntry),
    },
    systems: { systems: assessment.businessSystems.businessSystems },
    sensitiveData: { categories: assessment.sensitiveData.sensitiveData },
    departments: { departments: assessment.departments.departments },
    useCases: { useCases: assessment.useCases.useCases, domains },
    risk: {
      riskTolerance: assessment.riskWorkflow.riskTolerance,
      approvalWorkflow: assessment.riskWorkflow.approvalWorkflow,
      humanReviewRequired: assessment.riskWorkflow.humanReviewRequired,
      approvedToolListExists: assessment.riskWorkflow.approvedToolListExists ?? false,
    },
    meta,
  });
}

/** Generate a full policy pack from an engine input. */
export function generateFromInput(input: EngineInput): PolicyPack {
  const requirements = selectJurisdictionRequirements({
    regions: input.jurisdiction.regions,
    usStates: input.jurisdiction.usStates,
  });
  const scoring = scoreEngineInput(input);
  const controls = selectControls(input, requirements);
  const register = buildRiskRegister(input, scoring);
  const documents = generateDocuments({
    input,
    scoring,
    requirements,
    controls,
    register,
  });

  return {
    schemaVersion: 1,
    product: "pinpoint",
    // Deterministic except for this timestamp; consumers may ignore it.
    generatedAt: new Date().toISOString(),
    meta: input.meta,
    scoring,
    jurisdictionRequirements: requirements,
    recommendedControls: controls,
    missingControls: controls.filter((c) => !c.present),
    riskRegister: register,
    documents,
    disclaimer: DISCLAIMER,
  };
}

/** Convenience: assessment (+ overrides) → full policy pack. */
export function generatePolicyPack(
  assessment: Assessment,
  overrides?: Partial<PolicyPackMeta>,
): PolicyPack {
  return generateFromInput(deriveEngineInput(assessment, overrides));
}

export * from "./types";
export { selectJurisdictionRequirements } from "./jurisdictions";
export { selectControls } from "./controls";
export { scoreEngineInput, deriveSignals } from "./scoring";
