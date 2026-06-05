"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OptionGrid } from "@/components/ui/option-grid";
import { useAssessment } from "./assessment-context";
import {
  COMPANY_SIZES,
  RISK_TOLERANCE,
  APPROVAL_WORKFLOWS,
  JURISDICTIONS,
  type Jurisdiction,
} from "@/lib/schemas";
import {
  AI_TOOL_OPTIONS,
  BUSINESS_SYSTEM_OPTIONS,
  SENSITIVE_DATA_OPTIONS,
  DEPARTMENT_OPTIONS,
  USE_CASE_OPTIONS,
} from "@/lib/catalog";

const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  US: "United States",
  EU: "European Union",
  UK: "United Kingdom",
  CA: "Canada",
};

const APPROVAL_LABELS: Record<(typeof APPROVAL_WORKFLOWS)[number], string> = {
  none: "No formal approval",
  manager: "Manager sign-off",
  "central-review": "Central review team",
  committee: "Governance committee",
};

export function CompanyProfileStep() {
  const { assessment, update } = useAssessment();
  const c = assessment.company;
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company name (optional)</Label>
        <Input
          id="companyName"
          value={c.companyName}
          placeholder="Acme Inc."
          onChange={(e) => update("company", { ...c, companyName: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Optional and only used to title your policy pack. It stays local.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry (optional)</Label>
        <Input
          id="industry"
          value={c.industry}
          placeholder="e.g. SaaS, healthcare, finance"
          onChange={(e) => update("company", { ...c, industry: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companySize">Company size</Label>
        <Select
          id="companySize"
          value={c.companySize}
          onChange={(e) =>
            update("company", {
              ...c,
              companySize: e.target.value as (typeof COMPANY_SIZES)[number],
            })
          }
        >
          {COMPANY_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} employees
            </option>
          ))}
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={c.regulatedSector}
          onChange={(e) =>
            update("company", { ...c, regulatedSector: e.target.checked })
          }
        />
        We operate in a regulated sector (e.g. healthcare, finance, public sector)
      </label>
    </div>
  );
}

export function JurisdictionsStep() {
  const { assessment, update } = useAssessment();
  const selected = assessment.jurisdictions.jurisdictions;
  const toggle = (j: Jurisdiction) =>
    update("jurisdictions", {
      jurisdictions: selected.includes(j)
        ? selected.filter((x) => x !== j)
        : [...selected, j],
    });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select every region where you have staff, customers, or data subjects.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {JURISDICTIONS.map((j) => {
          const active = selected.includes(j);
          return (
            <button
              key={j}
              type="button"
              onClick={() => toggle(j)}
              aria-pressed={active}
              className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                active
                  ? "border-primary bg-secondary"
                  : "border-input hover:bg-accent"
              }`}
            >
              <span className="font-medium">{JURISDICTION_LABELS[j]}</span>
              <span className="text-xs text-muted-foreground">{j}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AiToolsStep() {
  const { assessment, update } = useAssessment();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Which AI tools are in use (officially or unofficially)?
      </p>
      <OptionGrid
        options={AI_TOOL_OPTIONS}
        selected={assessment.aiTools.aiTools}
        onChange={(aiTools) => update("aiTools", { aiTools })}
        customPlaceholder="Add another tool…"
      />
    </div>
  );
}

export function BusinessSystemsStep() {
  const { assessment, update } = useAssessment();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Which core business systems hold your data?
      </p>
      <OptionGrid
        options={BUSINESS_SYSTEM_OPTIONS}
        selected={assessment.businessSystems.businessSystems}
        onChange={(businessSystems) => update("businessSystems", { businessSystems })}
        customPlaceholder="Add another system…"
      />
    </div>
  );
}

export function SensitiveDataStep() {
  const { assessment, update } = useAssessment();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Which sensitive data categories might AI tools touch?
      </p>
      <OptionGrid
        options={SENSITIVE_DATA_OPTIONS}
        selected={assessment.sensitiveData.sensitiveData}
        onChange={(sensitiveData) => update("sensitiveData", { sensitiveData })}
        customPlaceholder="Add another category…"
      />
    </div>
  );
}

export function DepartmentsStep() {
  const { assessment, update } = useAssessment();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Which departments or roles will use AI?
      </p>
      <OptionGrid
        options={DEPARTMENT_OPTIONS}
        selected={assessment.departments.departments}
        onChange={(departments) => update("departments", { departments })}
        customPlaceholder="Add another team…"
      />
    </div>
  );
}

export function UseCasesStep() {
  const { assessment, update } = useAssessment();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        What are the main AI use cases you want to cover?
      </p>
      <OptionGrid
        options={USE_CASE_OPTIONS}
        selected={assessment.useCases.useCases}
        onChange={(useCases) => update("useCases", { useCases })}
        customPlaceholder="Add another use case…"
      />
    </div>
  );
}

export function RiskWorkflowStep() {
  const { assessment, update } = useAssessment();
  const r = assessment.riskWorkflow;
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Risk tolerance</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {RISK_TOLERANCE.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update("riskWorkflow", { ...r, riskTolerance: t })}
              className={`rounded-lg border p-3 text-sm capitalize transition-colors ${
                r.riskTolerance === t
                  ? "border-primary bg-secondary font-medium"
                  : "border-input hover:bg-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="approval">Approval workflow for new AI use</Label>
        <Select
          id="approval"
          value={r.approvalWorkflow}
          onChange={(e) =>
            update("riskWorkflow", {
              ...r,
              approvalWorkflow: e.target
                .value as (typeof APPROVAL_WORKFLOWS)[number],
            })
          }
        >
          {APPROVAL_WORKFLOWS.map((w) => (
            <option key={w} value={w}>
              {APPROVAL_LABELS[w]}
            </option>
          ))}
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={r.humanReviewRequired}
          onChange={(e) =>
            update("riskWorkflow", {
              ...r,
              humanReviewRequired: e.target.checked,
            })
          }
        />
        Require human review for higher-impact AI outputs
      </label>
    </div>
  );
}

function SummaryRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="border-b border-border/60 py-2 last:border-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">
        {items.length ? items.join(", ") : <span className="text-muted-foreground">—</span>}
      </p>
    </div>
  );
}

export function ReviewStep() {
  const { assessment } = useAssessment();
  const a = assessment;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review your answers before generating a draft policy pack. Everything
        below stays in your browser.
      </p>
      <div className="rounded-lg border border-border p-4">
        <SummaryRow
          label="Company"
          items={[
            a.company.companyName || "—",
            a.company.industry || "—",
            `${a.company.companySize} employees`,
            a.company.regulatedSector ? "Regulated sector" : "Not regulated",
          ]}
        />
        <SummaryRow label="Jurisdictions" items={a.jurisdictions.jurisdictions} />
        <SummaryRow label="AI tools" items={a.aiTools.aiTools} />
        <SummaryRow label="Business systems" items={a.businessSystems.businessSystems} />
        <SummaryRow label="Sensitive data" items={a.sensitiveData.sensitiveData} />
        <SummaryRow label="Departments" items={a.departments.departments} />
        <SummaryRow label="Use cases" items={a.useCases.useCases} />
        <SummaryRow
          label="Risk & workflow"
          items={[
            `Tolerance: ${a.riskWorkflow.riskTolerance}`,
            `Approval: ${APPROVAL_LABELS[a.riskWorkflow.approvalWorkflow]}`,
            a.riskWorkflow.humanReviewRequired
              ? "Human review required"
              : "No human review requirement",
          ]}
        />
      </div>
    </div>
  );
}
