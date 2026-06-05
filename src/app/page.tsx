import Link from "next/link";
import {
  ShieldCheck,
  UserX,
  FileText,
  Globe2,
  MonitorSmartphone,
  Fingerprint,
  Server,
  Building2,
  Gauge,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    title: "No account, no upload",
    body: "Skip the sign-up. There is nothing to log into and nothing to upload — just start the assessment.",
  },
  {
    icon: FileText,
    title: "DOCX + PDF policy pack",
    body: "Export a structured AI policy pack as Markdown, DOCX, and PDF, ready to adapt for your organization.",
  },
  {
    icon: Globe2,
    title: "US · EU · UK · Canada",
    body: "Map your AI use cases against frameworks across four major jurisdictions in a single assessment.",
  },
  {
    icon: MonitorSmartphone,
    title: "Browser-only",
    body: "Everything happens client-side. Close the tab and your working data stays only where you left it.",
  },
  {
    icon: Fingerprint,
    title: "No fingerprinting",
    body: "No analytics, no telemetry, no third-party trackers, and never a persistent visitor identifier.",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    icon: Building2,
    t: "Describe how you work",
    b: "Tools, data, departments, jurisdictions. Curated options — answer in about five minutes.",
  },
  {
    n: "02",
    icon: Gauge,
    t: "Get a risk read",
    b: "A deterministic engine scores maturity and inherent risk, then flags the gaps.",
  },
  {
    n: "03",
    icon: FileText,
    t: "Export your pack",
    b: "Eleven tailored policy documents, downloadable as DOCX, PDF, or JSON — built locally.",
  },
];

/** A static preview of the live scorecard, shown in the hero. */
function HeroPreview() {
  const r = 42;
  const c = 2 * Math.PI * r;
  const maturity = 62;
  return (
    <Card className="w-full max-w-sm p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="pp-eyebrow">Live scorecard</span>
        <Badge variant="warning">Medium risk</Badge>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative grid h-[92px] w-[92px] place-items-center">
          <svg viewBox="0 0 100 100" className="h-[92px] w-[92px] -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="9" />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="hsl(var(--signal))"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${(maturity / 100) * c} ${c}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-display text-2xl font-semibold">{maturity}</span>
            <span className="pp-eyebrow text-[9px]">maturity</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <div className="text-xs text-muted-foreground">Inherent risk</div>
            <div className="font-display text-[22px] font-semibold">
              58<span className="text-[13px] font-normal text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-signal" style={{ width: "58%" }} />
          </div>
        </div>
      </div>
      <hr className="my-4 border-border" />
      <div className="flex flex-col gap-2.5">
        {[
          { s: "danger" as const, l: "high", t: "Free / public AI tools in use" },
          { s: "danger" as const, l: "high", t: "No approval workflow" },
          { s: "warning" as const, l: "med", t: "Meeting bots capturing calls" },
        ].map((f) => (
          <div key={f.t} className="flex items-center gap-2.5">
            <Badge variant={f.s}>{f.l}</Badge>
            <span className="text-[13px]">{f.t}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const TRUST_FACTS = [
  "No accounts",
  "No backend database",
  "No trackers or fingerprinting",
  "Self-hosted fonts",
  "connect-src 'self'",
];

export default function HomePage() {
  return (
    <div>
      {/* Ink hero — the "secure instrument" first impression. */}
      <section className="pp-ink border-b border-border">
        <div className="container py-[clamp(48px,7vw,92px)]">
          <div className="pp-hero-grid grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col items-start gap-5">
              <span
                className="inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-[11.5px] uppercase tracking-[0.06em]"
                style={{
                  borderColor: "hsl(var(--signal) / 0.4)",
                  color: "hsl(var(--ink-foreground) / 0.75)",
                }}
              >
                <Lock className="h-3.5 w-3.5" />
                Local-only · No accounts · No tracking
              </span>
              <h1 className="max-w-[15ch] font-display text-[clamp(34px,5vw,56px)] font-semibold leading-[1.04] tracking-tight text-balance">
                Your AI policy, built from how your team actually works.
              </h1>
              <p
                className="max-w-[52ch] text-pretty text-[clamp(16px,1.4vw,19px)] leading-relaxed"
                style={{ color: "hsl(var(--ink-foreground) / 0.72)" }}
              >
                Pinpoint assesses your tools, data, and jurisdictions, then
                assembles a tailored AI policy pack with recommended controls —
                entirely in your browser.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="signal">
                  <Link href="/assessment">
                    Start your assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
                >
                  <Link href="/results">See a sample pack</Link>
                </Button>
              </div>
              <p
                className="pp-eyebrow"
                style={{ color: "hsl(var(--ink-foreground) / 0.6)" }}
              >
                Takes about 5 minutes · Nothing is sent anywhere
              </p>
            </div>
            <div className="flex justify-center">
              <HeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="container pt-7">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {TRUST_FACTS.map((f) => (
            <span key={f} className="pp-eyebrow inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="how-it-works" className="container scroll-mt-20 pb-2 pt-11">
        <div className="mb-6">
          <p className="pp-eyebrow">How it protects you</p>
          <h2 className="mt-2 font-display text-[clamp(24px,2.6vw,32px)] font-semibold">
            Built so there is no server to leak from.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="h-full p-6">
              <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-ink text-signal">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-12">
        <div className="mb-6">
          <p className="pp-eyebrow">Three steps</p>
          <h2 className="mt-2 font-display text-[clamp(24px,2.6vw,32px)] font-semibold">
            From &ldquo;we just use ChatGPT&rdquo; to a real policy.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_STEPS.map(({ n, icon: Icon, t, b }) => (
            <Card key={n} className="p-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-ink text-signal">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display text-3xl font-semibold text-muted-foreground/35">
                  {n}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {b}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Privacy explainer */}
      <section id="privacy" className="container scroll-mt-20 py-2">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[0.9fr_1.1fr]">
            <div className="pp-ink p-9">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-signal text-ink">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold">
                What stays local
              </h3>
              <p
                className="mt-2 text-pretty text-[14.5px] leading-relaxed"
                style={{ color: "hsl(var(--ink-foreground) / 0.7)" }}
              >
                Pinpoint is built so that there is no server to leak from. Here is
                exactly what that means.
              </p>
            </div>
            <div className="flex flex-col gap-3.5 p-9">
              {[
                "Your assessment answers stay in this browser (IndexedDB).",
                "No accounts, no databases, no server-side storage of inputs.",
                "No analytics, telemetry, third-party trackers, or fingerprinting.",
                "A visible Delete local data button removes everything instantly.",
                "The optional local scan reads only coarse capability hints — never a unique ID.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-signal" />
                  <span className="text-[14.5px] leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="container py-14 text-center">
        <h2 className="font-display text-[clamp(26px,3vw,38px)] font-semibold">
          Ready when you are.
        </h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-muted-foreground">
          Build a draft AI policy pack in a few minutes. Nothing is saved until
          you choose to save it locally.
        </p>
        <Button asChild size="lg" variant="signal" className="mt-6">
          <Link href="/assessment">
            Start your assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
