import type {
  EngineInput,
  JurisdictionRequirement,
  PolicyDocument,
  RecommendedControl,
  RiskRegisterItem,
  ScoringResult,
} from "./types";
import { DOMAIN_LABELS } from "./domains";
import { defaultTier, toToolEntry } from "./tools";

/**
 * Deterministic policy-document generator.
 *
 * Builds professional, assessment-specific policy text from local TypeScript
 * templates. No LLM, no network — every sentence is a function of the inputs.
 * Content is informational guidance, NOT legal advice.
 */

interface GeneratorContext {
  input: EngineInput;
  scoring: ScoringResult;
  requirements: JurisdictionRequirement[];
  controls: RecommendedControl[];
  register: RiskRegisterItem[];
}

function companyName(input: EngineInput): string {
  return input.meta.companyName || input.company.companyName || "the Company";
}

function effectiveLine(input: EngineInput): string[] {
  const parts: string[] = [];
  parts.push(`Owner: ${input.meta.policyOwner || "—"}`);
  parts.push(`Reviewer: ${input.meta.reviewer || "—"}`);
  parts.push(`Effective date: ${input.meta.effectiveDate || "—"}`);
  parts.push(`Version: ${input.meta.version || "1.0"}`);
  return parts;
}

function jurisdictionSentence(input: EngineInput): string {
  const regions = input.jurisdiction.regions;
  if (regions.length === 0) {
    return "No operating jurisdictions were selected; this pack applies general good-practice controls.";
  }
  const names: Record<string, string> = {
    US: "the United States",
    EU: "the European Union",
    UK: "the United Kingdom",
    CA: "Canada",
  };
  return `${companyName(input)} operates in ${regions
    .map((r) => names[r] ?? r)
    .join(", ")}, which shapes the obligations below.`;
}

/* -------------------------------------------------------------------------- */
/*  1. AI Acceptable Use Policy                                               */
/* -------------------------------------------------------------------------- */

function acceptableUse(ctx: GeneratorContext): PolicyDocument {
  const { input } = ctx;
  const co = companyName(input);
  const sensitive = input.sensitiveData.categories;
  return {
    id: "acceptable-use",
    title: "AI Acceptable Use Policy",
    summary: `How staff at ${co} may and may not use AI tools in their work.`,
    clauses: [
      {
        id: "purpose",
        heading: "1. Purpose & Scope",
        body: [
          `This policy governs the use of artificial intelligence ("AI") tools — including generative AI assistants, AI features embedded in business systems, and AI browser extensions — by all employees, contractors, and workers acting on behalf of ${co}.`,
          jurisdictionSentence(input),
        ],
        bullets: [
          "It applies to both company-provided and personal AI tools used for work.",
          "It complements, and does not replace, existing data protection, security, and confidentiality policies.",
        ],
      },
      {
        id: "principles",
        heading: "2. Core Principles",
        body: ["All AI use must follow these principles:"],
        bullets: [
          "Use only AI tools that are Approved or Restricted under the AI Tool Matrix.",
          "Never enter sensitive, regulated, or confidential data into tools not approved for it.",
          "Treat AI output as a draft: verify accuracy and never present it as fact without review.",
          "Maintain human oversight for any decision that affects a person, their rights, or their finances.",
          "Disclose AI assistance where required by law, contract, or audience expectation.",
        ],
      },
      {
        id: "permitted",
        heading: "3. Permitted Uses",
        body: ["Subject to the principles above, staff may use approved AI tools to:"],
        bullets: [
          "Draft, summarize, translate, and edit non-sensitive content.",
          "Brainstorm, research, and structure work (with independent verification).",
          "Assist with coding, analysis, and productivity in approved environments.",
        ],
      },
      {
        id: "prohibited",
        heading: "4. Prohibited Uses",
        body: ["The following are prohibited unless explicitly approved in writing:"],
        bullets: [
          sensitive.length
            ? `Entering ${sensitive.join(", ")} into any tool not approved for that data category.`
            : "Entering personal, confidential, or regulated data into unapproved tools.",
          "Using AI to make solely-automated decisions about people without human review.",
          "Uploading proprietary source code or secrets into free/public AI tools.",
          "Using AI to generate unlawful, deceptive, harassing, or infringing content.",
          "Bypassing security controls, DLP, or the approval workflow ('shadow AI').",
        ],
      },
      {
        id: "responsibilities",
        heading: "5. Responsibilities & Enforcement",
        body: [
          `The policy owner maintains this policy and the AI Tool Matrix. Managers ensure their teams comply. Violations are handled under ${co}'s standard disciplinary and security incident processes.`,
          "Questions and new-tool requests go through the AI approval workflow.",
        ],
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  2. Approved / Restricted / Blocked AI Tool Matrix                         */
/* -------------------------------------------------------------------------- */

function toolMatrix(ctx: GeneratorContext): PolicyDocument {
  const { input } = ctx;
  const approved = new Set(
    input.meta.approvedTools.map((t) => t.toLowerCase().trim()),
  );
  const rows = input.tools.tools.map((t) => {
    const override = approved.has(t.name.toLowerCase().trim());
    const { tier, rationale } = defaultTier(t);
    const finalTier = override ? "Approved" : tier;
    return [
      t.name,
      categoryLabel(t.category),
      finalTier,
      override ? "Explicitly approved by the organization." : rationale,
    ];
  });

  return {
    id: "tool-matrix",
    title: "Approved / Restricted / Blocked AI Tool Matrix",
    summary:
      "A tiered register of AI tools. Approved = permitted within its data scope; Restricted = limited to non-sensitive data; Blocked = not permitted pending review.",
    clauses: [
      {
        id: "how-to-use",
        heading: "How to use this matrix",
        body: [
          "Each tool is assigned a tier with a rationale. Default tiers are derived from tool type and data-handling posture; the organization may override a tool to Approved by listing it as an approved tool.",
        ],
        bullets: [
          "Approved — permitted for use within the stated data scope.",
          "Restricted — permitted only for non-sensitive, non-confidential data.",
          "Blocked — not permitted until reviewed and reclassified.",
        ],
      },
    ],
    table: {
      columns: ["Tool", "Type", "Tier", "Rationale"],
      rows: rows.length
        ? rows
        : [["—", "—", "—", "No AI tools were listed in the assessment."]],
    },
  };
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    "general-llm": "General LLM assistant",
    "coding-assistant": "Coding assistant",
    "meeting-transcription": "Meeting transcription",
    "browser-extension": "Browser extension",
    "image-generation": "Image generation",
    "search-research": "Search / research",
    "internal-self-hosted": "Internal / self-hosted",
    other: "Other",
  };
  return labels[category] ?? category;
}

/* -------------------------------------------------------------------------- */
/*  3. Data Handling Matrix                                                   */
/* -------------------------------------------------------------------------- */

function dataHandlingMatrix(ctx: GeneratorContext): PolicyDocument {
  const { input } = ctx;
  const categories = input.sensitiveData.categories.length
    ? input.sensitiveData.categories
    : ["General business data"];

  const rows = categories.map((cat) => {
    const isSensitive = !/general business/i.test(cat);
    return [
      cat,
      isSensitive ? "Sensitive / regulated" : "Low sensitivity",
      isSensitive ? "Approved enterprise tools only" : "Approved or Restricted tools",
      isSensitive
        ? "Minimize, mask where possible, no free/public tools, retain per schedule"
        : "Avoid unnecessary disclosure; verify outputs",
    ];
  });

  return {
    id: "data-handling-matrix",
    title: "Data Handling Matrix",
    summary:
      "What data may be used with AI, in which tools, and under what handling rules.",
    clauses: [
      {
        id: "rules",
        heading: "Handling rules",
        body: [
          "Match each data category to the most restrictive applicable rule. When in doubt, treat data as sensitive and seek approval.",
        ],
      },
    ],
    table: {
      columns: ["Data category", "Sensitivity", "Permitted AI tools", "Handling rule"],
      rows,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  4. Role-Based AI Use Rules                                                */
/* -------------------------------------------------------------------------- */

function roleBasedRules(ctx: GeneratorContext): PolicyDocument {
  const { input } = ctx;
  const departments = input.departments.departments.length
    ? input.departments.departments
    : ["All staff"];

  const ROLE_GUIDANCE: { match: RegExp; rules: string[] }[] = [
    {
      match: /engineer|developer|product/i,
      rules: [
        "Use enterprise coding assistants with training opt-out; never paste secrets or customer data.",
        "Keep AI-generated code under code review; verify licensing of suggested snippets.",
      ],
    },
    {
      match: /hr|people|recruit/i,
      rules: [
        "Do not use AI for solely-automated hiring or employment decisions.",
        "Apply human review and bias awareness to any AI-assisted candidate screening.",
      ],
    },
    {
      match: /legal|compliance/i,
      rules: [
        "Never enter privileged or litigation material into non-approved tools.",
        "Verify all AI legal output; AI is not a substitute for qualified counsel.",
      ],
    },
    {
      match: /sales|marketing/i,
      rules: [
        "Label AI-generated marketing content where required; verify claims for accuracy.",
        "Do not enter prospect/customer personal data into free/public tools.",
      ],
    },
    {
      match: /support|customer/i,
      rules: [
        "Disclose AI assistance to customers where expected; keep a human in the loop.",
        "Avoid pasting full customer records into AI tools; share only what is necessary.",
      ],
    },
    {
      match: /finance|account/i,
      rules: [
        "Verify all AI-produced figures; never rely on AI for final financial decisions.",
        "Keep regulated financial data within approved enterprise tools.",
      ],
    },
  ];

  return {
    id: "role-based-rules",
    title: "Role-Based AI Use Rules",
    summary: "Tailored AI guardrails for each department and role.",
    clauses: [
      {
        id: "intro",
        heading: "Overview",
        body: [
          "These role-specific rules supplement the Acceptable Use Policy. Where a role is not listed, the general rules apply.",
        ],
      },
      ...departments.map((dept, i) => {
        const guidance = ROLE_GUIDANCE.find((g) => g.match.test(dept));
        return {
          id: `role-${i}`,
          heading: dept,
          body: [],
          bullets:
            guidance?.rules ?? [
              "Follow the Acceptable Use Policy and Data Handling Matrix.",
              "Maintain human review and verify AI output before relying on it.",
            ],
        };
      }),
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  5. AI Vendor Review Checklist                                            */
/* -------------------------------------------------------------------------- */

function vendorChecklist(): PolicyDocument {
  return {
    id: "vendor-review-checklist",
    title: "AI Vendor Review Checklist",
    summary: "Due-diligence questions to assess an AI vendor before adoption.",
    clauses: [
      {
        id: "data",
        heading: "Data & training",
        body: [],
        bullets: [
          "Does the vendor use customer inputs to train models? Is opt-out available and on by default for our tier?",
          "Where is data processed and stored, and under what regional safeguards?",
          "What are retention and deletion terms for inputs, outputs, and logs?",
        ],
      },
      {
        id: "security",
        heading: "Security & compliance",
        body: [],
        bullets: [
          "Independent certifications (e.g. SOC 2, ISO 27001) and recent audit results?",
          "Encryption in transit and at rest; access controls and tenant isolation?",
          "Sub-processors disclosed, with a Data Processing Agreement available?",
        ],
      },
      {
        id: "governance",
        heading: "Model governance & terms",
        body: [],
        bullets: [
          "Documentation of intended use, limitations, and evaluation (incl. bias)?",
          "Indemnification and IP terms for generated output?",
          "Incident notification commitments and support SLAs?",
        ],
      },
      {
        id: "decision",
        heading: "Decision",
        body: [
          "Record the reviewer, date, tier assigned, and any conditions of approval. Re-review on material change or annually.",
        ],
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  6. Employee AI Use Attestation                                           */
/* -------------------------------------------------------------------------- */

function attestation(ctx: GeneratorContext): PolicyDocument {
  const co = companyName(ctx.input);
  return {
    id: "employee-attestation",
    title: "Employee AI Use Attestation",
    summary: "A short attestation for staff to acknowledge the AI policy.",
    clauses: [
      {
        id: "statement",
        heading: "Acknowledgement",
        body: [
          `I confirm that I have read and understood the ${co} AI Acceptable Use Policy and related guidance, and I agree to the following:`,
        ],
        bullets: [
          "I will use only Approved or Restricted AI tools, within their permitted data scope.",
          "I will not enter sensitive, regulated, or confidential data into unapproved tools.",
          "I will verify AI output and keep human oversight for consequential decisions.",
          "I will route new AI tools and use cases through the approval workflow.",
          "I will report suspected AI-related incidents promptly.",
        ],
      },
      {
        id: "signoff",
        heading: "Sign-off",
        body: ["Name: ____________________   Role/Department: ____________________"],
        bullets: ["Signature: ____________________", "Date: ____________________"],
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  7. Shadow AI Risk Register                                               */
/* -------------------------------------------------------------------------- */

function shadowAiRegister(ctx: GeneratorContext): PolicyDocument {
  const rows = ctx.register.map((r) => [
    r.risk,
    r.category,
    `${r.likelihood} / ${r.impact}`,
    r.inherentRisk,
    r.mitigation,
    r.residualRisk,
  ]);
  return {
    id: "shadow-ai-register",
    title: "Shadow AI Risk Register",
    summary:
      "A living register of AI risks with inherent rating, mitigation, and residual rating.",
    clauses: [
      {
        id: "intro",
        heading: "Using the register",
        body: [
          "Review at least quarterly. Assign each row an owner and track mitigations to closure. Residual ratings assume the listed mitigation is implemented.",
        ],
      },
    ],
    table: {
      columns: [
        "Risk",
        "Category",
        "Likelihood / Impact",
        "Inherent",
        "Mitigation",
        "Residual",
      ],
      rows,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  8. Guardrail Roadmap                                                     */
/* -------------------------------------------------------------------------- */

function guardrailRoadmap(ctx: GeneratorContext): PolicyDocument {
  const missing = ctx.controls.filter((c) => !c.present);
  const now = missing.filter((c) => c.priority === "high");
  const next = missing.filter((c) => c.priority === "medium");
  const later = missing.filter((c) => c.priority === "low");
  const phase = (label: string, items: RecommendedControl[]) => ({
    id: `phase-${label.toLowerCase().replace(/\W+/g, "-")}`,
    heading: label,
    body: items.length ? [] : ["No additional controls in this phase — already in good shape."],
    bullets: items.map((c) => `${c.title} — ${c.description}`),
  });

  return {
    id: "guardrail-roadmap",
    title: "Guardrail Roadmap",
    summary:
      "A phased plan to close control gaps, ordered by priority. Present controls are excluded.",
    clauses: [
      {
        id: "intro",
        heading: "Approach",
        body: [
          `Current maturity score: ${ctx.scoring.maturityScore}/100. Overall risk level: ${ctx.scoring.riskLevel}. The phases below sequence the missing controls so the highest-leverage guardrails land first.`,
        ],
      },
      phase("Phase 1 — Now (0–30 days)", now),
      phase("Phase 2 — Next (30–90 days)", next),
      phase("Phase 3 — Later (90+ days)", later),
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  9. Board / GC Summary Memo                                              */
/* -------------------------------------------------------------------------- */

function boardMemo(ctx: GeneratorContext): PolicyDocument {
  const { input, scoring } = ctx;
  const co = companyName(input);
  const highStakes = scoring.signals.highStakesDomains
    .map((d) => DOMAIN_LABELS[d])
    .join(", ");
  const topFlags = scoring.topRiskFlags.slice(0, 5).map((f) => `${f.title}: ${f.detail}`);

  return {
    id: "board-gc-memo",
    title: "Board / GC Summary Memo",
    summary: "An executive summary of AI risk posture and recommended actions.",
    clauses: [
      {
        id: "summary",
        heading: "Executive summary",
        body: [
          `This memo summarizes ${co}'s AI governance posture based on an internal assessment. ${jurisdictionSentence(
            input,
          )}`,
          `Overall AI risk level is assessed as ${scoring.riskLevel}, with a governance maturity score of ${scoring.maturityScore}/100.`,
          highStakes
            ? `High-stakes AI use was identified in: ${highStakes}. These areas warrant heightened oversight.`
            : "No high-stakes AI domains were identified in the assessment.",
        ],
      },
      {
        id: "risks",
        heading: "Key risks",
        body: ["The most significant flags from the assessment are:"],
        bullets: topFlags.length ? topFlags : ["No significant risk flags were raised."],
      },
      {
        id: "actions",
        heading: "Recommended actions",
        body: ["Management recommends prioritizing the following high-priority controls:"],
        bullets: ctx.controls
          .filter((c) => c.priority === "high" && !c.present)
          .slice(0, 6)
          .map((c) => c.title),
      },
      {
        id: "ask",
        heading: "Decision requested",
        body: [
          "Endorse the attached policy pack as the baseline AI governance framework, approve the Guardrail Roadmap, and confirm the named policy owner and review cadence.",
        ],
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  10. Privacy + Data Retention Statement                                   */
/* -------------------------------------------------------------------------- */

function privacyStatement(ctx: GeneratorContext): PolicyDocument {
  const co = companyName(ctx.input);
  return {
    id: "privacy-retention-statement",
    title: "Pinpoint Privacy + Data Retention Statement",
    summary:
      "How this assessment was produced and how AI data should be retained.",
    clauses: [
      {
        id: "pinpoint-privacy",
        heading: "How this pack was produced",
        body: [
          "This policy pack was generated entirely within your browser by Pinpoint. Your assessment answers were not uploaded, transmitted, or stored on any server. No account was created and no analytics or telemetry were collected.",
          "Drafts are saved only to this browser's local storage and can be deleted at any time using the Delete local data control.",
        ],
      },
      {
        id: "retention",
        heading: `${co} AI data retention principles`,
        body: ["Apply the following retention principles to AI inputs and outputs:"],
        bullets: [
          "Retain AI inputs, outputs, transcripts, and logs only as long as needed for the stated purpose.",
          "Delete or anonymize personal data in AI systems per your retention schedule.",
          "Prefer enterprise tiers that allow disabling training on your data and support deletion.",
          "Document retention periods per data category in the Data Handling Matrix.",
        ],
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  11. Legal Review Notes / No Legal Advice Disclaimer                      */
/* -------------------------------------------------------------------------- */

function legalNotes(ctx: GeneratorContext): PolicyDocument {
  const reqs = ctx.requirements;
  return {
    id: "legal-review-notes",
    title: "Legal Review Notes / No Legal Advice Disclaimer",
    summary: "Scope, assumptions, and the no-legal-advice disclaimer.",
    clauses: [
      {
        id: "disclaimer",
        heading: "No legal advice",
        body: [
          "This policy pack is informational guidance generated from your inputs using deterministic templates. It is NOT legal advice, does NOT create an attorney–client relationship, and does NOT guarantee compliance with any law or framework.",
          "Coverage notes indicate where obligations may apply; they are a starting point for review, not a legal conclusion. Have qualified counsel review and adapt this pack before adoption.",
        ],
      },
      {
        id: "scope",
        heading: "Jurisdictions & frameworks considered",
        body: reqs.length
          ? ["Based on your selections, the following were considered:"]
          : ["No jurisdictions were selected; only general good practice was applied."],
        bullets: reqs.map((r) => `${r.name} (${r.scope}) — ${r.reference}`),
      },
      {
        id: "review",
        heading: "Suggested legal review focus",
        body: ["When reviewing, give particular attention to:"],
        bullets: [
          "Automated decision-making and profiling rights in your jurisdictions.",
          "Sector-specific rules where you operate in a regulated industry.",
          "Cross-border data transfer terms for any non-domestic AI vendors.",
          "Consent and transparency obligations for recording and personal data use.",
        ],
      },
    ],
  };
}

/** Generate all policy documents in canonical order. */
export function generateDocuments(ctx: GeneratorContext): PolicyDocument[] {
  return [
    acceptableUse(ctx),
    toolMatrix(ctx),
    dataHandlingMatrix(ctx),
    roleBasedRules(ctx),
    vendorChecklist(),
    attestation(ctx),
    shadowAiRegister(ctx),
    guardrailRoadmap(ctx),
    boardMemo(ctx),
    privacyStatement(ctx),
    legalNotes(ctx),
  ];
}

/** Re-export so callers can prepend metadata lines to any document if desired. */
export { effectiveLine, toToolEntry };
