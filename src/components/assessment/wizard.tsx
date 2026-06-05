"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocalDataManager } from "@/components/privacy/local-data-manager";
import { BrowserScanCard } from "@/components/scan/browser-scan-card";
import { useAssessment } from "./assessment-context";
import {
  CompanyProfileStep,
  JurisdictionsStep,
  AiToolsStep,
  BusinessSystemsStep,
  SensitiveDataStep,
  DepartmentsStep,
  UseCasesStep,
  RiskWorkflowStep,
  ReviewStep,
} from "./steps";

interface Step {
  title: string;
  description: string;
  Component: React.ComponentType;
}

const STEPS: Step[] = [
  {
    title: "Company profile",
    description: "Tell us a little about your organization.",
    Component: CompanyProfileStep,
  },
  {
    title: "Jurisdictions",
    description: "Where do you operate?",
    Component: JurisdictionsStep,
  },
  {
    title: "AI tools used",
    description: "What AI tools are in play today?",
    Component: AiToolsStep,
  },
  {
    title: "Business systems used",
    description: "Where does your data live?",
    Component: BusinessSystemsStep,
  },
  {
    title: "Sensitive data handled",
    description: "What kinds of sensitive data are in scope?",
    Component: SensitiveDataStep,
  },
  {
    title: "Departments / roles",
    description: "Who will use AI?",
    Component: DepartmentsStep,
  },
  {
    title: "AI use cases",
    description: "What will AI be used for?",
    Component: UseCasesStep,
  },
  {
    title: "Risk tolerance / approval workflow",
    description: "How do you want to govern AI use?",
    Component: RiskWorkflowStep,
  },
  {
    title: "Review and generate",
    description: "Confirm and build your draft policy pack.",
    Component: ReviewStep,
  },
];

export function AssessmentWizard() {
  const router = useRouter();
  const { hydrated } = useAssessment();
  const [step, setStep] = React.useState(0);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const generate = () => {
    // In-memory assessment is provided to /results via the shared route layout,
    // so no forced disk write is required. Navigation keeps everything local.
    router.push("/results");
  };

  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="pp-eyebrow">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="pp-eyebrow">{progress}% complete</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-signal transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{current.title}</CardTitle>
            <CardDescription>{current.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {hydrated ? (
              <current.Component />
            ) : (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {!isLast ? (
            <Button onClick={next}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="signal" onClick={generate}>
              <Sparkles className="h-4 w-4" />
              Generate policy pack
            </Button>
          )}
        </div>

        {/* Step navigator */}
        <ol className="grid gap-1 text-sm sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                  i === step
                    ? "bg-secondary font-medium"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border font-mono text-[10px] ${
                    i < step
                      ? "border-signal bg-signal text-signal-foreground"
                      : i === step
                        ? "border-primary text-foreground"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Sidebar: privacy controls + optional scan */}
      <aside className="space-y-6">
        <LocalDataManager />
        <BrowserScanCard />
      </aside>
    </div>
  );
}
