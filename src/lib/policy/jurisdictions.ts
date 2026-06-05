import type { Jurisdiction, JurisdictionRequirement, UseCaseDomain } from "./types";

/**
 * Seed jurisdiction / framework library.
 *
 * IMPORTANT: This is a transparent coverage aid, NOT legal advice and NOT a
 * guarantee of compliance. Entries summarize widely-reported obligations to help
 * scope policy coverage and recommended controls. Always confirm specifics with
 * qualified counsel.
 *
 * The data is static TypeScript that ships in the bundle — no network fetch.
 */

interface LibraryTrigger {
  /** Region this entry belongs to. */
  region: Jurisdiction;
  /** US state codes that activate this entry (when region is US). */
  usStates?: string[];
  /** Apply whenever its region is selected (e.g. GDPR for EU). */
  alwaysForRegion?: boolean;
  /** Apply whenever any high-stakes domain is present (regardless of region). */
  domains?: UseCaseDomain[];
  /** Voluntary framework: include regardless of region selection. */
  alwaysFramework?: boolean;
}

export interface LibraryEntry extends Omit<JurisdictionRequirement, "appliesWhen"> {
  trigger: LibraryTrigger;
  appliesWhen: string;
}

/* -------------------------------------------------------------------------- */
/*  US — comprehensive state privacy laws                                     */
/* -------------------------------------------------------------------------- */

/** Common obligations shared by the comprehensive US state privacy statutes. */
const US_STATE_COMMON_OBLIGATIONS = [
  "Maintain a clear, accessible privacy notice covering AI/automated processing.",
  "Honor consumer rights: access, deletion, correction, and portability.",
  "Offer opt-out of targeted advertising, sale, and certain profiling.",
  "Recognize universal opt-out signals where the statute requires them.",
  "Conduct data protection assessments for higher-risk processing and profiling.",
  "Apply data minimization and purpose limitation to AI inputs and outputs.",
];

/** A single named-state entry built from the common pattern plus specifics. */
function usState(
  code: string,
  name: string,
  law: string,
  reference: string,
  extras: string[] = [],
): LibraryEntry {
  return {
    id: `us-${code.toLowerCase()}`,
    region: "US",
    scope: name,
    name: law,
    summary: `${law} — a comprehensive consumer privacy statute applying the common US state pattern with state-specific nuances.`,
    appliesWhen: `You process ${name} residents' personal data above the statute's applicability thresholds.`,
    obligations: [...US_STATE_COMMON_OBLIGATIONS, ...extras],
    relatedControls: [
      "privacy-notice",
      "dsar-process",
      "data-protection-assessment",
      "opt-out-profiling",
      "data-minimization",
    ],
    reference,
    trigger: { region: "US", usStates: [code] },
  };
}

const US_STATES: LibraryEntry[] = [
  usState("CA", "California", "CCPA/CPRA", "Cal. Civ. Code §1798.100 et seq.", [
    "Provide opt-out of automated decision-making and access to profiling logic (per CPPA ADMT rulemaking).",
    "Honor sensitive personal information limitation rights.",
  ]),
  usState("VA", "Virginia", "VCDPA", "Va. Code §59.1-575 et seq.", [
    "Obtain opt-in consent before processing sensitive data.",
  ]),
  usState("CO", "Colorado", "CPA", "Colo. Rev. Stat. §6-1-1301 et seq.", [
    "Honor the Colorado Universal Opt-Out mechanism.",
  ]),
  usState("CT", "Connecticut", "CTDPA", "Conn. Gen. Stat. §42-515 et seq."),
  usState("UT", "Utah", "UCPA", "Utah Code §13-61-101 et seq.", [
    "Note Utah's lighter-touch model: no profiling opt-out or assessment mandate.",
  ]),
  // Additional comprehensive regimes as configurable entries.
  usState("TX", "Texas", "TDPSA", "Tex. Bus. & Com. Code §541"),
  usState("OR", "Oregon", "OCPA", "Or. Rev. Stat. §646A.570"),
  usState("MT", "Montana", "MCDPA", "Mont. Code §30-14-2801"),
  usState("IA", "Iowa", "ICDPA", "Iowa Code §715D"),
  usState("DE", "Delaware", "DPDPA", "Del. Code tit. 6 §12D"),
  usState("NJ", "New Jersey", "NJDPA", "N.J. Stat. §56:8-166.4"),
  usState("NH", "New Hampshire", "NH SB 255", "N.H. Rev. Stat. §507-H"),
  usState("NE", "Nebraska", "NDPA", "Neb. Rev. Stat. §87-1101"),
  usState("IN", "Indiana", "INCDPA", "Ind. Code §24-15"),
  usState("TN", "Tennessee", "TIPA", "Tenn. Code §47-18-3201"),
  usState("FL", "Florida", "FDBR", "Fla. Stat. §501.701"),
  usState("MN", "Minnesota", "MCDPA", "Minn. Stat. §325O"),
  usState("MD", "Maryland", "MODPA", "Md. Code Com. Law §14-46", [
    "Apply Maryland's stricter data minimization and sensitive-data prohibitions.",
  ]),
  usState("RI", "Rhode Island", "RIDTPPA", "R.I. Gen. Laws §6-48.1"),
  usState("KY", "Kentucky", "KCDPA", "Ky. Rev. Stat. §367.3611"),
];

/** Generic pattern surfaced whenever the US region is selected. */
const US_COMMON_PATTERN: LibraryEntry = {
  id: "us-state-common-pattern",
  region: "US",
  scope: "US state privacy (common pattern)",
  name: "US State Privacy Law — Common Pattern",
  summary:
    "A consolidated module of obligations shared across comprehensive US state privacy laws. Use it as a baseline when specific states are not individually selected.",
  appliesWhen: "You operate in the US and may be subject to one or more state privacy statutes.",
  obligations: US_STATE_COMMON_OBLIGATIONS,
  relatedControls: [
    "privacy-notice",
    "dsar-process",
    "data-protection-assessment",
    "opt-out-profiling",
    "data-minimization",
  ],
  reference: "Multistate comprehensive privacy statutes (2020–present)",
  trigger: { region: "US", alwaysForRegion: true },
};

/* -------------------------------------------------------------------------- */
/*  EU                                                                        */
/* -------------------------------------------------------------------------- */

const EU_ENTRIES: LibraryEntry[] = [
  {
    id: "eu-gdpr",
    region: "EU",
    scope: "EU-wide",
    name: "GDPR (Regulation 2016/679)",
    summary:
      "The EU's general data protection regime. Governs lawful basis, transparency, data subject rights, and DPIAs for higher-risk AI processing.",
    appliesWhen: "You process personal data of individuals in the EU/EEA.",
    obligations: [
      "Establish and document a lawful basis for each AI processing activity.",
      "Provide transparent information about automated processing and its logic.",
      "Honor data subject rights including access, erasure, and objection.",
      "Run a DPIA for high-risk processing, including profiling and large-scale use.",
      "Respect Article 22 limits on solely-automated decisions with legal/significant effects.",
      "Apply data minimization, storage limitation, and security by design and default.",
    ],
    relatedControls: [
      "lawful-basis-register",
      "dpia",
      "dsar-process",
      "human-oversight",
      "data-minimization",
    ],
    reference: "Regulation (EU) 2016/679",
    trigger: { region: "EU", alwaysForRegion: true },
  },
  {
    id: "eu-ai-act",
    region: "EU",
    scope: "EU-wide",
    name: "EU AI Act (Regulation 2024/1689)",
    summary:
      "Risk-tiered regulation of AI systems. Classifies systems as prohibited, high-risk, limited-risk, or minimal-risk, with obligations scaled accordingly.",
    appliesWhen: "You place AI systems on the EU market or their output is used in the EU.",
    obligations: [
      "Classify each AI use case by risk tier (prohibited / high / limited / minimal).",
      "For high-risk systems: risk management, data governance, logging, and human oversight.",
      "Provide transparency for limited-risk systems (e.g. disclose AI interaction and AI-generated content).",
      "Maintain technical documentation and post-market monitoring for high-risk systems.",
      "Ensure AI literacy among staff operating AI systems.",
    ],
    relatedControls: [
      "ai-system-inventory",
      "risk-classification",
      "human-oversight",
      "ai-transparency",
      "ai-literacy-training",
    ],
    reference: "Regulation (EU) 2024/1689",
    trigger: { region: "EU", alwaysForRegion: true },
  },
];

/* -------------------------------------------------------------------------- */
/*  UK                                                                        */
/* -------------------------------------------------------------------------- */

const UK_ENTRIES: LibraryEntry[] = [
  {
    id: "uk-gdpr-dpa",
    region: "UK",
    scope: "United Kingdom",
    name: "UK GDPR & Data Protection Act 2018",
    summary:
      "The UK's data protection posture, mirroring GDPR with UK-specific oversight by the ICO.",
    appliesWhen: "You process personal data of individuals in the UK.",
    obligations: [
      "Identify a lawful basis and document AI processing in your records of processing.",
      "Carry out a DPIA for high-risk or large-scale automated processing.",
      "Honor UK data subject rights and Article 22-equivalent automated-decision limits.",
      "Apply accountability, transparency, and data minimization principles.",
    ],
    relatedControls: ["lawful-basis-register", "dpia", "dsar-process", "human-oversight"],
    reference: "UK GDPR; Data Protection Act 2018",
    trigger: { region: "UK", alwaysForRegion: true },
  },
  {
    id: "uk-ico-ai",
    region: "UK",
    scope: "United Kingdom",
    name: "ICO Guidance on AI and Data Protection",
    summary:
      "ICO expectations for fairness, transparency, explainability, and accountability when using AI on personal data.",
    appliesWhen: "You use AI that processes UK personal data.",
    obligations: [
      "Assess and mitigate fairness and bias risks in AI outputs.",
      "Be able to explain AI-assisted decisions to affected individuals.",
      "Document trade-offs (e.g. accuracy vs. privacy) and accountability ownership.",
      "Apply meaningful human review to consequential AI-assisted decisions.",
    ],
    relatedControls: ["bias-testing", "ai-transparency", "human-oversight", "model-documentation"],
    reference: "ICO — Guidance on AI and Data Protection",
    trigger: { region: "UK", alwaysForRegion: true },
  },
];

/* -------------------------------------------------------------------------- */
/*  Canada                                                                    */
/* -------------------------------------------------------------------------- */

const CA_ENTRIES: LibraryEntry[] = [
  {
    id: "ca-pipeda",
    region: "CA",
    scope: "Canada (federal)",
    name: "PIPEDA",
    summary:
      "Canada's federal private-sector privacy law, built on ten fair information principles including consent and accountability.",
    appliesWhen: "You handle personal information in the course of commercial activity in Canada.",
    obligations: [
      "Obtain meaningful consent for collection, use, and disclosure of personal information.",
      "Limit collection to what is necessary and be accountable for AI processing.",
      "Provide access and correction rights; safeguard data appropriately.",
      "Be transparent about automated processing and its purposes.",
    ],
    relatedControls: ["consent-management", "privacy-notice", "dsar-process", "data-minimization"],
    reference: "Personal Information Protection and Electronic Documents Act",
    trigger: { region: "CA", alwaysForRegion: true },
  },
  {
    id: "ca-quebec-law25",
    region: "CA",
    scope: "Québec",
    name: "Québec Law 25",
    summary:
      "Québec's modernized privacy law with strict consent, transparency for automated decisions, and privacy impact assessments.",
    appliesWhen: "You process personal information of individuals in Québec.",
    obligations: [
      "Inform individuals when a decision is based exclusively on automated processing.",
      "Allow individuals to submit observations and request review of automated decisions.",
      "Conduct Privacy Impact Assessments (PIAs) for projects involving personal information.",
      "Appoint a person responsible for privacy and honor data portability.",
    ],
    relatedControls: ["dpia", "human-oversight", "ai-transparency", "consent-management"],
    reference: "Act to modernize legislative provisions (Law 25)",
    trigger: { region: "CA", alwaysForRegion: true },
  },
  {
    id: "ca-genai-principles",
    region: "CA",
    scope: "Canada (regulators)",
    name: "Canadian Privacy Regulators' Generative AI Principles",
    summary:
      "Joint principles from Canadian privacy authorities on developing and using generative AI responsibly.",
    appliesWhen: "You develop or deploy generative AI affecting Canadians.",
    obligations: [
      "Establish legal authority and appropriate consent for generative AI data use.",
      "Limit collection, retention, and secondary use of personal information.",
      "Be transparent and accountable; enable individual rights and complaint handling.",
      "Mitigate bias, accuracy, and safety risks throughout the lifecycle.",
    ],
    relatedControls: ["consent-management", "bias-testing", "ai-transparency", "data-minimization"],
    reference: "OPC et al. — Principles for responsible generative AI",
    trigger: { region: "CA", alwaysForRegion: true },
  },
];

/* -------------------------------------------------------------------------- */
/*  Voluntary frameworks (always surfaced as governance references)           */
/* -------------------------------------------------------------------------- */

const FRAMEWORK_ENTRIES: LibraryEntry[] = [
  {
    id: "nist-ai-rmf",
    region: "US",
    scope: "Voluntary framework",
    name: "NIST AI Risk Management Framework",
    summary:
      "A voluntary framework structured around four functions — Govern, Map, Measure, Manage — for trustworthy AI.",
    appliesWhen: "Recommended for any organization adopting AI, regardless of jurisdiction.",
    obligations: [
      "Govern: establish AI governance, roles, and accountability.",
      "Map: inventory AI uses and their context and impacts.",
      "Measure: assess AI risks including bias, robustness, and explainability.",
      "Manage: prioritize and treat risks with documented controls.",
    ],
    relatedControls: ["ai-governance-charter", "ai-system-inventory", "bias-testing", "ai-risk-register"],
    reference: "NIST AI RMF 1.0",
    trigger: { region: "US", alwaysFramework: true },
  },
  {
    id: "nist-privacy-framework",
    region: "US",
    scope: "Voluntary framework",
    name: "NIST Privacy Framework",
    summary:
      "A voluntary framework (Identify, Govern, Control, Communicate, Protect) to manage privacy risk from data processing.",
    appliesWhen: "Recommended wherever AI processes personal data.",
    obligations: [
      "Identify and inventory data processing and associated privacy risks.",
      "Govern privacy risk with policies, roles, and risk tolerance.",
      "Implement controls for data minimization and individual participation.",
      "Communicate privacy practices and protect data with security measures.",
    ],
    relatedControls: ["privacy-notice", "data-minimization", "data-protection-assessment"],
    reference: "NIST Privacy Framework 1.0",
    trigger: { region: "US", alwaysFramework: true },
  },
  {
    id: "uk-aime-self-assessment",
    region: "UK",
    scope: "Voluntary self-assessment",
    name: "Organizational AI Management Self-Assessment (AIME-style)",
    summary:
      "An AIME-style organizational AI management self-assessment inspiration: evaluate governance maturity across leadership, risk, data, and oversight.",
    appliesWhen: "Recommended as a periodic AI governance maturity check.",
    obligations: [
      "Assess leadership ownership and AI policy completeness.",
      "Review risk processes, approval workflows, and an approved-tool list.",
      "Evaluate data handling, vendor due diligence, and incident readiness.",
      "Confirm human oversight and staff AI literacy.",
    ],
    relatedControls: ["ai-governance-charter", "approved-tool-list", "vendor-due-diligence", "ai-literacy-training"],
    reference: "AIME-inspired organizational AI management self-assessment",
    trigger: { region: "UK", alwaysFramework: true },
  },
];

/** The full static library. */
export const JURISDICTION_LIBRARY: LibraryEntry[] = [
  US_COMMON_PATTERN,
  ...US_STATES,
  ...EU_ENTRIES,
  ...UK_ENTRIES,
  ...CA_ENTRIES,
  ...FRAMEWORK_ENTRIES,
];

export interface JurisdictionSelectionInput {
  regions: Jurisdiction[];
  usStates: string[];
}

/**
 * Deterministically select the jurisdiction requirements that apply to a given
 * region/state selection. Pure function — trivially testable.
 */
export function selectJurisdictionRequirements(
  selection: JurisdictionSelectionInput,
): JurisdictionRequirement[] {
  const regions = new Set(selection.regions);
  const states = new Set(selection.usStates.map((s) => s.toUpperCase()));

  const matches = JURISDICTION_LIBRARY.filter((entry) => {
    const t = entry.trigger;
    // Voluntary frameworks are always recommended as governance references.
    if (t.alwaysFramework) return true;
    if (!regions.has(t.region)) return false;
    if (t.alwaysForRegion) return true;
    if (t.usStates) return t.usStates.some((s) => states.has(s.toUpperCase()));
    return false;
  });

  // Strip the internal trigger before returning the public requirement shape.
  return matches.map(({ trigger: _trigger, ...req }) => req);
}
