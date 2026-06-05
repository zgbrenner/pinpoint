"use client";

import * as React from "react";
import Link from "next/link";
import {
  Gauge,
  Globe2,
  AlertTriangle,
  ListChecks,
  ShieldCheck,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsList, TabTrigger } from "@/components/ui/tabs";
import { LocalDataManager } from "@/components/privacy/local-data-manager";
import { PackMetaFields } from "./pack-meta-fields";
import { PolicyDocumentView } from "./policy-document-view";
import { ExportPanel } from "./export-panel";
import { useAssessment } from "@/components/assessment/assessment-context";
import { generatePolicyPack } from "@/lib/policy";
import type { RiskLevel, Severity } from "@/lib/policy/types";

const RISK_VARIANT: Record<RiskLevel, "success" | "warning" | "danger"> = {
  Low: "success",
  Medium: "warning",
  High: "warning",
  Critical: "danger",
};

const SEVERITY_VARIANT: Record<Severity, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

function MaturityGauge({ score }: { score: number }) {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="hsl(var(--signal))"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 264} 264`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-2xl font-semibold">{score}</span>
        <span className="pp-eyebrow text-[9px]">maturity</span>
      </div>
    </div>
  );
}

export function ResultsDashboard() {
  const { assessment, hydrated } = useAssessment();
  const pack = React.useMemo(
    () => generatePolicyPack(assessment),
    [assessment],
  );
  const [activeTab, setActiveTab] = React.useState<string>("overview");

  const isEmpty =
    assessment.jurisdictions.jurisdictions.length === 0 &&
    assessment.aiTools.aiTools.length === 0 &&
    assessment.sensitiveData.sensitiveData.length === 0;

  if (!hydrated) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-md animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded bg-secondary" />
          <div className="h-32 rounded-lg bg-secondary" />
          <div className="h-24 rounded-lg bg-secondary" />
        </div>
      </div>
    );
  }

  // Dedicated empty state — clearer than a half-built dashboard.
  if (isEmpty) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-lg text-center">
          <CardContent className="flex flex-col items-center gap-4 p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Nothing to generate yet
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Your assessment is empty, so there&apos;s no meaningful policy pack
                to build. Answer a few questions — it takes about five minutes and
                everything stays in your browser.
              </p>
            </div>
            <Button asChild>
              <Link href="/assessment">Start the assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="pp-eyebrow">Generated locally · Not legal advice</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
            Your policy pack
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated in your browser from your assessment. Informational
            guidance only.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/assessment">
            <ArrowLeft className="h-4 w-4" />
            Edit assessment
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Score card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-signal" />
                <CardTitle className="text-base">Scorecard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
                <div className="flex items-center gap-4">
                  <MaturityGauge score={pack.scoring.maturityScore} />
                  <div>
                    <p className="text-sm text-muted-foreground">Policy maturity</p>
                    <p className="text-lg font-semibold">
                      {pack.scoring.maturityScore}
                      <span className="text-sm font-normal text-muted-foreground">
                        /100
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">Higher is better</p>
                  </div>
                </div>
                <div className="hidden h-12 w-px bg-border sm:block" aria-hidden />
                <div>
                  <p className="text-sm text-muted-foreground">Overall risk level</p>
                  <Badge
                    variant={RISK_VARIANT[pack.scoring.riskLevel]}
                    className="mt-1.5"
                  >
                    {pack.scoring.riskLevel}
                  </Badge>
                </div>
                <div className="hidden h-12 w-px bg-border sm:block" aria-hidden />
                <div className="min-w-[180px] flex-1">
                  <p className="text-sm text-muted-foreground">Inherent risk</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-destructive"
                      style={{ width: `${pack.scoring.inherentRiskScore}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {pack.missingControls.length} of{" "}
                    {pack.recommendedControls.length} recommended controls missing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk flags */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-signal" />
                <CardTitle className="text-base">
                  Top risk flags ({pack.scoring.topRiskFlags.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pack.scoring.topRiskFlags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No significant flags — keep documenting as you scale.
                </p>
              ) : (
                pack.scoring.topRiskFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <Badge
                      variant={SEVERITY_VARIANT[flag.severity]}
                      className="mt-0.5 capitalize"
                    >
                      {flag.severity}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{flag.title}</p>
                      <p className="text-sm text-muted-foreground">{flag.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Jurisdiction coverage */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-signal" />
                <CardTitle className="text-base">
                  Jurisdiction & framework coverage
                </CardTitle>
              </div>
              <CardDescription>
                Obligations considered based on your selections. Coverage notes, not
                legal conclusions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pack.jurisdictionRequirements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No jurisdictions selected yet.
                </p>
              ) : (
                pack.jurisdictionRequirements.map((r) => (
                  <div
                    key={r.id}
                    className="border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{r.name}</span>
                      <Badge variant="secondary">{r.scope}</Badge>
                      <span className="text-xs text-muted-foreground">{r.reference}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.summary}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-signal" />
                <CardTitle className="text-base">Recommended controls</CardTitle>
              </div>
              <CardDescription>
                {pack.missingControls.length} of {pack.recommendedControls.length}{" "}
                recommended controls appear to be missing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pack.recommendedControls.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 rounded-md border border-border/60 px-3 py-2"
                >
                  {c.present ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{c.title}</span>
                      <Badge
                        variant={
                          c.priority === "high"
                            ? "danger"
                            : c.priority === "medium"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {c.priority}
                      </Badge>
                      {c.present && <Badge variant="success">in place</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Policy pack preview with per-document tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-signal" />
                <CardTitle className="text-base">Policy pack</CardTitle>
              </div>
              <CardDescription>
                {pack.documents.length} generated documents. Select a tab to preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TabsList>
                <TabTrigger
                  active={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </TabTrigger>
                {pack.documents.map((doc) => (
                  <TabTrigger
                    key={doc.id}
                    active={activeTab === doc.id}
                    onClick={() => setActiveTab(doc.id)}
                  >
                    {doc.title}
                  </TabTrigger>
                ))}
              </TabsList>

              <div className="rounded-lg border border-border p-5">
                {activeTab === "overview" ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">What&apos;s in your pack</h3>
                    <ul className="space-y-2 text-sm">
                      {pack.documents.map((doc) => (
                        <li key={doc.id} className="flex items-start gap-2">
                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>
                            <button
                              className="font-medium underline-offset-2 hover:underline"
                              onClick={() => setActiveTab(doc.id)}
                            >
                              {doc.title}
                            </button>
                            <span className="text-muted-foreground"> — {doc.summary}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <PolicyDocumentView
                    doc={pack.documents.find((d) => d.id === activeTab)!}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <PackMetaFields />
          <ExportPanel pack={pack} />
          <LocalDataManager />
        </aside>
      </div>

      <p className="text-xs text-muted-foreground">{pack.disclaimer}</p>
    </div>
  );
}
