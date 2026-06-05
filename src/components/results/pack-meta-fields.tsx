"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionGrid } from "@/components/ui/option-grid";
import { useAssessment } from "@/components/assessment/assessment-context";

/**
 * Edit-in-browser policy metadata: company name, owner, reviewer, effective
 * date, and approved tools. Edits flow into the assessment context, which
 * re-generates the pack live. Everything stays local.
 */
export function PackMetaFields() {
  const { assessment, update } = useAssessment();
  const meta = assessment.packMeta;
  const company = assessment.company;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Pencil className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Policy details</CardTitle>
        </div>
        <CardDescription>
          Edit these and the pack updates instantly. Saved locally only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="m-company">Company name</Label>
            <Input
              id="m-company"
              value={company.companyName}
              placeholder="Acme Inc."
              onChange={(e) =>
                update("company", { ...company, companyName: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-owner">Policy owner</Label>
            <Input
              id="m-owner"
              value={meta.policyOwner}
              placeholder="e.g. Head of Compliance"
              onChange={(e) =>
                update("packMeta", { ...meta, policyOwner: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-reviewer">Reviewer</Label>
            <Input
              id="m-reviewer"
              value={meta.reviewer}
              placeholder="e.g. General Counsel"
              onChange={(e) =>
                update("packMeta", { ...meta, reviewer: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-date">Effective date</Label>
            <Input
              id="m-date"
              type="date"
              value={meta.effectiveDate}
              onChange={(e) =>
                update("packMeta", { ...meta, effectiveDate: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Approved tools (override matrix to &ldquo;Approved&rdquo;)</Label>
          <OptionGrid
            options={assessment.aiTools.aiTools}
            selected={meta.approvedTools}
            onChange={(approvedTools) => update("packMeta", { ...meta, approvedTools })}
            customPlaceholder="Add an approved tool…"
          />
        </div>
      </CardContent>
    </Card>
  );
}
