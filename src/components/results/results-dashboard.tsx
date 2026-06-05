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
  FileType2,
  FileDown,
  FileJson,
  ArrowLeft,
  Lock,
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
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 264} 264`}
        />
      </svg>
      <span className="absolute text-2xl font-semibold">{score}</span>
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

  // Browser-only JSON export. PRIVACY: serialized in-page and downloaded
  // directly from memory — never sent to a server.
  const downloadJson = React.useCallback(() => {
    const blob = new Blob([JSON.stringify(pack, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pinpoint-policy-pack-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pack]);

  if (!hydrated) {
    return <div className="container py-10 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="container space-y-6 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your policy pack</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated locally in your browser from your assessment. Informational
            guidance only — not legal advice.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/assessment">
            <ArrowLeft className="h-4 w-4" />
            Edit assessment
          </Link>
        </Button>
      </div>

      {isEmpty && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>
              This assessment looks empty. Head back and answer a few questions for
              a meaningful policy pack.
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Score card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Scorecard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4">
                  <MaturityGauge score={pack.scoring.maturityScore} />
                  <div>
                    <p className="text-sm text-muted-foreground">Policy maturity</p>
                    <p className="text-lg font-semibold">
                      {pack.scoring.maturityScore}/100
                    </p>
                  </div>
                </div>
                <div className="h-12 w-px bg-border" aria-hidden />
                <div>
                  <p className="text-sm text-muted-foreground">Overall risk level</p>
                  <Badge
                    variant={RISK_VARIANT[pack.scoring.riskLevel]}
                    className="mt-1 text-sm"
                  >
                    {pack.scoring.riskLevel}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Inherent risk score {pack.scoring.inherentRiskScore}/100
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk flags */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
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
                <Globe2 className="h-5 w-5 text-primary" />
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
                <ShieldCheck className="h-5 w-5 text-primary" />
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
                <ListChecks className="h-5 w-5 text-primary" />
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

          {/* Export */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Export</CardTitle>
              </div>
              <CardDescription>
                JSON export is available now. Markdown, DOCX, and PDF arrive next.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" onClick={downloadJson}>
                <FileJson className="h-4 w-4" />
                Download policy pack (JSON)
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <FileText className="h-4 w-4" />
                Export Markdown
                <Badge variant="secondary" className="ml-auto">
                  Coming soon
                </Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <FileType2 className="h-4 w-4" />
                Export DOCX
                <Badge variant="secondary" className="ml-auto">
                  Coming soon
                </Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <FileDown className="h-4 w-4" />
                Export PDF
                <Badge variant="secondary" className="ml-auto">
                  Coming soon
                </Badge>
              </Button>
              <p className="flex items-start gap-2 pt-1 text-xs text-muted-foreground">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Exports are built in your browser and downloaded directly — never via
                a server.
              </p>
            </CardContent>
          </Card>

          <LocalDataManager />
        </aside>
      </div>

      <p className="text-xs text-muted-foreground">{pack.disclaimer}</p>
    </div>
  );
}
