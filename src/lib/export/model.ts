import type { Jurisdiction, PolicyPack } from "@/lib/policy/types";

/**
 * Normalized, presentation-agnostic export model.
 *
 * Both the DOCX and PDF builders consume this so the two formats stay in sync.
 * Pure transform of the PolicyPack — no I/O, no rendering library here.
 */

export type ExportBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "table"; columns: string[]; rows: string[][] };

export interface ExportSection {
  number: number;
  title: string;
  summary?: string;
  blocks: ExportBlock[];
}

export interface ExportModel {
  title: string;
  companyName: string;
  generatedDate: string;
  jurisdictionsLabel: string;
  owner: string;
  reviewer: string;
  effectiveDate: string;
  version: string;
  disclaimer: string;
  privacyStatement: string;
  toc: { number: number; title: string }[];
  sections: ExportSection[];
}

const REGION_NAMES: Record<Jurisdiction, string> = {
  US: "United States",
  EU: "European Union",
  UK: "United Kingdom",
  CA: "Canada",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function jurisdictionsLabel(pack: PolicyPack): string {
  const { regions, usStates } = pack.jurisdictions;
  if (regions.length === 0) return "None selected (general good practice applied)";
  const parts = regions.map((r) => REGION_NAMES[r] ?? r);
  if (usStates.length > 0) {
    parts.push(`US states: ${usStates.join(", ")}`);
  }
  return parts.join("; ");
}

const PRIVACY_STATEMENT =
  "This document was generated entirely within your web browser by Pinpoint. " +
  "Your assessment answers were not uploaded, transmitted, or stored on any server, " +
  "no account was created, and no analytics or telemetry were collected. Drafts are " +
  "saved only to your browser's local storage and can be deleted at any time.";

/** Build the export model from a generated policy pack. */
export function buildExportModel(pack: PolicyPack): ExportModel {
  const companyName = pack.meta.companyName || "Your Organization";
  const sections: ExportSection[] = [];

  // Section 1 — Risk & maturity summary (derived from scoring).
  const s = pack.scoring;
  sections.push({
    number: 1,
    title: "Risk & Maturity Summary",
    summary: "An at-a-glance view of governance maturity and current AI risk.",
    blocks: [
      {
        type: "bullets",
        items: [
          `Policy maturity score: ${s.maturityScore}/100`,
          `Overall risk level: ${s.riskLevel}`,
          `Inherent risk score: ${s.inherentRiskScore}/100`,
          `Jurisdictions in scope: ${pack.jurisdictions.regions.length}`,
        ],
      },
      { type: "heading", text: "Top risk flags" },
      ...(s.topRiskFlags.length
        ? [
            {
              type: "table" as const,
              columns: ["Severity", "Flag", "Detail"],
              rows: s.topRiskFlags.map((f) => [
                f.severity.toUpperCase(),
                f.title,
                f.detail,
              ]),
            },
          ]
        : [{ type: "paragraph" as const, text: "No significant risk flags were raised." }]),
    ],
  });

  // Sections 2..N — the generated policy documents in order.
  pack.documents.forEach((doc, i) => {
    const blocks: ExportBlock[] = [];
    doc.clauses.forEach((clause) => {
      blocks.push({ type: "heading", text: clause.heading });
      clause.body.forEach((p) => blocks.push({ type: "paragraph", text: p }));
      if (clause.bullets && clause.bullets.length > 0) {
        blocks.push({ type: "bullets", items: clause.bullets });
      }
    });
    if (doc.table) {
      blocks.push({
        type: "table",
        columns: doc.table.columns,
        rows: doc.table.rows,
      });
    }
    sections.push({
      number: i + 2,
      title: doc.title,
      summary: doc.summary,
      blocks,
    });
  });

  return {
    title: "AI Policy Pack",
    companyName,
    generatedDate: formatDate(pack.generatedAt),
    jurisdictionsLabel: jurisdictionsLabel(pack),
    owner: pack.meta.policyOwner || "—",
    reviewer: pack.meta.reviewer || "—",
    effectiveDate: pack.meta.effectiveDate || "—",
    version: pack.meta.version || "1.0",
    disclaimer: pack.disclaimer,
    privacyStatement: PRIVACY_STATEMENT,
    toc: sections.map((sec) => ({ number: sec.number, title: sec.title })),
    sections,
  };
}

/** Stable, filesystem-safe base filename for an export. */
export function exportBaseName(pack: PolicyPack): string {
  const slug = (pack.meta.companyName || "pinpoint-policy-pack")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "pinpoint-policy-pack";
  const date = pack.generatedAt.slice(0, 10);
  return `${slug}-${date}`;
}
