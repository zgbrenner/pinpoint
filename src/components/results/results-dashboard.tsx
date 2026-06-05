"use client";

import * as React from "react";
import Link from "next/link";
import {
  Gauge,
  Globe2,
  AlertTriangle,
  ListChecks,
  FileText,
  FileType2,
  FileDown,
  ArrowLeft,
  Lock,
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
import { LocalDataManager } from "@/components/privacy/local-data-manager";
import { useAssessment } from "@/components/assessment/assessment-context";
import { scoreAssessment, type RiskFlag } from "@/lib/scoring";

const BAND_VARIANT: Record<
  string,
  "success" | "warning" | "danger" | "secondary"
> = {
  low: "success",
  moderate: "warning",
  elevated: "warning",
  high: "danger",
};

const SEVERITY_VARIANT: Record<RiskFlag["severity"], "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

function RiskGauge({ score, band }: { score: number; band: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="10"
          />
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
      <div>
        <p className="text-sm text-muted-foreground">Risk score</p>
        <Badge variant={BAND_VARIANT[band] ?? "secondary"} className="mt-1 capitalize">
          {band} attention
        </Badge>
        <p className="mt-2 max-w-xs text-xs text-muted-foreground">
          A transparent heuristic from your answers. Higher means more governance
          attention is suggested.
        </p>
      </div>
    </div>
  );
}

export function ResultsDashboard() {
  const { assessment, hydrated } = useAssessment();
  const result = React.useMemo(
    () => scoreAssessment(assessment),
    [assessment],
  );

  // Detect the "landed here with nothing entered" case (e.g. hard refresh).
  const isEmpty =
    assessment.jurisdictions.jurisdictions.length === 0 &&
    assessment.aiTools.aiTools.length === 0 &&
    assessment.sensitiveData.sensitiveData.length === 0;

  if (!hydrated) {
    return (
      <div className="container py-10 text-sm text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="container space-y-6 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your draft policy pack
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A preview built from your assessment — computed locally in your
            browser.
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
              This assessment looks empty. Head back and answer a few questions
              to see a meaningful policy pack.
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Risk score */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Risk overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RiskGauge score={result.riskScore} band={result.riskBand} />
            </CardContent>
          </Card>

          {/* Jurisdiction coverage */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Jurisdiction coverage</CardTitle>
              </div>
              <CardDescription>
                Frameworks mapped to the regions you selected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.coverage.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No jurisdictions selected yet.
                </p>
              ) : (
                result.coverage.map((c) => (
                  <div
                    key={c.jurisdiction}
                    className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="w-32 font-medium">{c.label}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.frameworks.map((f) => (
                        <Badge key={f} variant="secondary">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top risk flags */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Top risk flags</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.topRiskFlags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No significant flags — nice. Keep documenting as you scale.
                </p>
              ) : (
                result.topRiskFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <Badge variant={SEVERITY_VARIANT[flag.severity]} className="mt-0.5 capitalize">
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

          {/* Policy pack checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Policy pack checklist</CardTitle>
              </div>
              <CardDescription>
                Recommended documents based on your assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.policyPack.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                >
                  <span className="text-sm">{item.title}</span>
                  <Badge variant={item.recommended ? "success" : "secondary"}>
                    {item.recommended ? "Recommended" : "Optional"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Export buttons — disabled until the generator lands next prompt. */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Export policy pack</CardTitle>
              </div>
              <CardDescription>
                Markdown, DOCX, and PDF export arrive in the next release.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
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
                Exports will be generated in your browser and downloaded directly
                — never via a server.
              </p>
            </CardContent>
          </Card>

          <LocalDataManager />
        </aside>
      </div>

      <p className="text-xs text-muted-foreground">
        Pinpoint provides general informational guidance only and is not legal
        advice. Review any policy with qualified counsel before adopting it.
      </p>
    </div>
  );
}
