import Link from "next/link";
import {
  ShieldCheck,
  UserX,
  FileText,
  Globe2,
  MonitorSmartphone,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Privacy-first by design",
    body: "No backend stores your answers. The assessment runs locally and your inputs never leave your browser.",
  },
  {
    icon: UserX,
    title: "No account, no upload required",
    body: "Skip the sign-up. There is nothing to log into and nothing to upload — just start the assessment.",
  },
  {
    icon: FileText,
    title: "DOCX + PDF policy pack",
    body: "Export a structured AI policy pack as Markdown, DOCX, and PDF, ready to adapt for your organization.",
  },
  {
    icon: Globe2,
    title: "US, EU, UK, and Canada coverage",
    body: "Map your AI use cases against frameworks across four major jurisdictions in a single assessment.",
  },
  {
    icon: MonitorSmartphone,
    title: "Browser-only assessment",
    body: "Everything happens client-side. Close the tab and your working data stays only where you left it — locally.",
  },
];

export default function HomePage() {
  return (
    <div className="container">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <Lock className="h-3.5 w-3.5" />
          Local-only · No accounts · No tracking
        </div>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Your AI policy, built from how your team actually works.
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          Pinpoint assesses your tools, data, and jurisdictions, then assembles a
          tailored AI policy pack with recommended controls — entirely in your
          browser.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/assessment">
              Start your assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Takes about 5 minutes · Nothing is sent anywhere
        </p>
      </section>

      {/* Features */}
      <section id="how-it-works" className="scroll-mt-20 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="h-full">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{body}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Privacy explainer */}
      <section id="privacy" className="scroll-mt-20 py-12">
        <Card className="overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <CardHeader className="bg-secondary/50 p-8">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle>What stays local</CardTitle>
              <CardDescription>
                Pinpoint is built so that there is no server to leak from. Here
                is exactly what that means.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-8 text-sm">
              <ul className="space-y-2">
                {[
                  "Your assessment answers stay in this browser (IndexedDB).",
                  "No accounts, no databases, no server-side storage of your inputs.",
                  "No analytics, no telemetry, no third-party trackers or fingerprinting.",
                  "A visible Delete local data button removes everything instantly.",
                  "The optional local scan reads only coarse browser capability hints — never a unique ID.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Ready when you are
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Build a draft AI policy pack in a few minutes. Nothing is saved until
          you choose to save it locally.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/assessment">
            Start your assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
