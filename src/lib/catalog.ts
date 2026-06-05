/**
 * Curated option catalogs for the assessment wizard.
 * These are static, ship in the bundle, and contain no user data.
 */

export const AI_TOOL_OPTIONS = [
  "ChatGPT / OpenAI",
  "Claude / Anthropic",
  "Microsoft Copilot",
  "Google Gemini",
  "GitHub Copilot",
  "Cursor (coding)",
  "Perplexity",
  "Otter.ai (transcription)",
  "Fireflies.ai (meeting bot)",
  "AI browser extension",
  "Midjourney / image gen",
  "Notion AI",
  "Internal / self-hosted LLM",
];

/** US state privacy regimes selectable for jurisdiction specificity. */
export const US_STATE_OPTIONS: { code: string; label: string }[] = [
  { code: "CA", label: "California (CCPA/CPRA)" },
  { code: "VA", label: "Virginia (VCDPA)" },
  { code: "CO", label: "Colorado (CPA)" },
  { code: "CT", label: "Connecticut (CTDPA)" },
  { code: "UT", label: "Utah (UCPA)" },
  { code: "TX", label: "Texas (TDPSA)" },
  { code: "OR", label: "Oregon (OCPA)" },
  { code: "MT", label: "Montana (MCDPA)" },
  { code: "IA", label: "Iowa (ICDPA)" },
  { code: "DE", label: "Delaware (DPDPA)" },
  { code: "NJ", label: "New Jersey (NJDPA)" },
  { code: "NH", label: "New Hampshire" },
  { code: "NE", label: "Nebraska (NDPA)" },
  { code: "IN", label: "Indiana (INCDPA)" },
  { code: "TN", label: "Tennessee (TIPA)" },
  { code: "FL", label: "Florida (FDBR)" },
  { code: "MN", label: "Minnesota (MCDPA)" },
  { code: "MD", label: "Maryland (MODPA)" },
  { code: "RI", label: "Rhode Island" },
  { code: "KY", label: "Kentucky (KCDPA)" },
];

export const BUSINESS_SYSTEM_OPTIONS = [
  "Microsoft 365",
  "Google Workspace",
  "Salesforce (CRM)",
  "HubSpot (CRM)",
  "Slack",
  "Jira / Confluence",
  "ServiceNow",
  "Workday (HR)",
  "NetSuite / ERP",
  "AWS / Cloud infra",
];

export const SENSITIVE_DATA_OPTIONS = [
  "Personal data (PII)",
  "Health data (PHI)",
  "Financial / payment data",
  "Biometric data",
  "Children's data",
  "Employee / HR records",
  "Customer support transcripts",
  "Source code / IP",
  "Legal / privileged",
];

export const DEPARTMENT_OPTIONS = [
  "Engineering",
  "Product",
  "Marketing",
  "Sales",
  "Customer Support",
  "HR / People",
  "Legal / Compliance",
  "Finance",
  "Operations",
  "Executive / Leadership",
];

export const USE_CASE_OPTIONS = [
  "Drafting & editing content",
  "Code generation & review",
  "Customer support responses",
  "Data analysis & summarization",
  "Meeting notes & transcription",
  "Research & search",
  "Hiring & resume screening (HR)",
  "Credit / lending decisions",
  "Insurance underwriting / claims",
  "Healthcare / clinical support",
  "Legal / contract analysis",
  "Education / student assessment",
  "Finance / fraud / KYC",
  "Customer decisioning & pricing",
  "Biometric processing",
  "Children's / teen services",
  "Automated decisions affecting people",
  "Marketing & image generation",
];
