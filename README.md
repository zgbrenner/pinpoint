# Pinpoint

**Your AI policy, built from how your team actually works.**

Pinpoint is a privacy-first AI policy builder. It runs entirely in your browser,
needs no account, and generates a tailored AI policy pack from your company
profile, tools, data types, AI usage, and jurisdictions.

> Pinpoint provides general informational guidance only and is **not legal
> advice**. Review any policy with qualified counsel before adopting it.

---

## What Pinpoint is

- A multi-step **assessment** of how your team uses AI.
- A **local scan** of coarse, non-unique browser capabilities (optional).
- A **results dashboard** with a risk score, jurisdiction coverage, top risk
  flags, and a recommended **policy pack** checklist.
- A future **export** to Markdown, DOCX, and PDF (wired up, generation lands in
  the next release).

It covers four jurisdictions out of the box: **US, EU, UK, and Canada**.

## Privacy model

Pinpoint is designed so there is **no server to leak from**:

- **No accounts.** Nothing to sign up for or log into.
- **No backend database.** There is no server-side storage of your inputs.
- **No API routes** that receive or persist company/assessment data.
- **No analytics, no telemetry, no third-party trackers.** Even Next.js build
  telemetry is disabled (`NEXT_TELEMETRY_DISABLED=1`).
- **No fingerprinting and no persistent visitor ID.** The local scan reads only
  coarse capability hints and never hashes them into an identifier.
- **Local-first storage.** Your assessment lives in memory during your visit and
  is written to this browser's **IndexedDB** (via [Dexie](https://dexie.org/))
  only when you click **Save draft**.
- **Delete local data** button wipes the entire local database instantly.
- **Self-hosted fonts** (via `next/font`) — no request to Google Fonts at
  runtime.

Privacy-relevant decisions are commented inline in the source (search for
`PRIVACY`).

### What the website can detect

Only values any website can already read, presented transparently and never
stored or transmitted:

- Browser family and platform hint (from UA / UA-Client-Hints)
- Logical CPU core count (`navigator.hardwareConcurrency`)
- Approximate device memory, browser-rounded (`navigator.deviceMemory`)
- Screen size **category** (small/medium/large — never raw pixels)
- Timezone and language
- Permission **states** for camera, microphone, notifications, geolocation
  (read without prompting and without activating any sensor)
- Storage quota/usage estimate, rounded to GB

### What the website cannot / does not do

- It does **not** create or store a fingerprint hash or unique identifier.
- It does **not** access your camera, microphone, location, files, or contacts.
- It does **not** read your other tabs, history, or installed software.
- It does **not** send your answers or scan results anywhere.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) with shadcn/ui-style components
- [Dexie.js](https://dexie.org/) for local-first IndexedDB storage
- [Zod](https://zod.dev/) for assessment validation
- [Vitest](https://vitest.dev/) for unit tests

## Run locally

Requires Node.js 18.18+ (Node 20+ recommended).

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run lint            # ESLint (next/core-web-vitals)
npm run typecheck       # tsc --noEmit
npm run test            # Vitest unit tests
npm run build           # production build
npm run verify:privacy  # static privacy checks (no API routes / analytics, etc.)
```

## Export formats

From the results dashboard you can download the full policy pack — all built
**client-side from local state**, never via a server:

- **DOCX** (`docx`) — cover page, table of contents, numbered sections,
  headings, tables for the tool and data-handling matrices, the attestation
  block, and a page-numbered footer.
- **PDF** (`jsPDF` + `jspdf-autotable`) — cover page, table of contents,
  readable typography, section breaks, tables, and page numbers.
- **JSON** — the complete structured `PolicyPack` object for integration.

Both DOCX and PDF libraries are **dynamically imported**, so they load only when
you export and never bloat the initial page.

## Privacy & security docs

- [`docs/PRIVACY_ARCHITECTURE.md`](./docs/PRIVACY_ARCHITECTURE.md) — data flow,
  what is/ isn't collected, storage, deletion, no-retention promise, threat
  model, and limitations.
- [`docs/LEGAL_DISCLAIMER.md`](./docs/LEGAL_DISCLAIMER.md) — not legal advice;
  outputs are drafts; review with counsel.
- [`SECURITY.md`](./SECURITY.md) — how to report vulnerabilities; local-only
  design.

A strict **Content Security Policy** (`connect-src 'self'`) ships in
`next.config.mjs`, structurally blocking third-party network requests. The app
bundles **no third-party scripts** and **no remote fonts** (Inter is self-hosted
via `next/font`).

## Project structure

```
src/
  app/
    page.tsx                 # Landing page
    (app)/
      layout.tsx             # Shared AssessmentProvider (in-memory state)
      assessment/page.tsx    # Multi-step wizard
      results/page.tsx       # Results dashboard
  components/
    assessment/              # Wizard, steps, local state context
    privacy/                 # Local data manager + privacy status card
    scan/                    # Transparent browser scan card
    results/                 # Results dashboard
    ui/                      # shadcn-style primitives
  lib/
    schemas.ts               # Zod schemas (local-only validation)
    db.ts                    # Dexie local persistence + delete-all
    scan.ts                  # Browser capability scan (non-unique)
    catalog.ts               # Static option lists
    policy/                  # The deterministic policy engine (see below)
      types.ts               # Typed model (profiles + output artifacts)
      tools.ts               # AI-tool classification + default tiering
      domains.ts             # High-stakes domain detection
      jurisdictions.ts       # Seed jurisdiction/framework library + selection
      controls.ts            # Recommended-control library + selection
      scoring.ts             # Maturity + inherent-risk scoring engine
      register.ts            # Shadow-AI risk register builder
      generator.ts           # All 11 policy documents
      index.ts               # Orchestration (assessment → PolicyPack)
    export/                  # Client-side document export
      model.ts               # PolicyPack → presentation-agnostic export model
      docx.ts                # DOCX builder (dynamic import of `docx`)
      pdf.ts                 # PDF builder (dynamic import of `jspdf`)
      index.ts               # download helpers (DOCX / PDF / JSON)
scripts/
  verify-privacy.mjs         # Standalone privacy verification
docs/
  PRIVACY_ARCHITECTURE.md
  LEGAL_DISCLAIMER.md
```

## Policy engine design

The policy engine in `src/lib/policy/` turns an assessment into a complete
policy pack **deterministically and entirely in the browser** — no LLM calls,
no network, no server. The same input always yields the same output (apart from
a `generatedAt` timestamp), which makes it fully unit-testable.

**Pipeline** (`generatePolicyPack(assessment, overrides?)`):

1. **Derive** a normalized `EngineInput` from the local assessment. Free-text AI
   tools are classified into categories (general LLM, coding assistant, meeting
   transcription, browser extension, image generation, search, internal) and
   flagged as free/public vs. enterprise. Use cases, sensitive data, and
   departments are mapped to high-stakes **domains** (HR, credit, insurance,
   healthcare, legal, education, finance, customer decisioning, biometrics,
   children/teens, automated decision-making).
2. **Select jurisdiction requirements** from the seed library. Covered:
   - **US** — CCPA/CPRA, VCDPA, CPA, CTDPA, UCPA plus all other comprehensive
     state regimes (TX, OR, MT, IA, DE, NJ, NH, NE, IN, TN, FL, MN, MD, RI, KY)
     as configurable entries, and a generic *US state common pattern* module.
   - **EU** — GDPR, EU AI Act.
   - **UK** — UK GDPR / DPA 2018, ICO AI guidance.
   - **Canada** — PIPEDA, Québec Law 25, Canadian regulators' generative-AI
     principles.
   - **Frameworks** (always surfaced) — NIST AI RMF, NIST Privacy Framework, and
     an AIME-style organizational AI management self-assessment.
3. **Score** a governance **maturity score** (0–100, higher is better) and an
   **inherent risk score**, combined into an overall **risk level**
   (Low / Medium / High / Critical), plus the **top 10 risk flags**. Signals
   include tool count/type, free/public tools, coding assistants, meeting bots,
   browser extensions, sensitive data, high-stakes domains, jurisdictions, and
   whether an approval process and approved-tool list exist.
4. **Select recommended controls** (with priority and present/missing status)
   and build a **Shadow-AI risk register** with inherent/residual ratings.
5. **Generate the policy pack documents**:
   AI Acceptable Use Policy · Approved/Restricted/Blocked Tool Matrix ·
   Data Handling Matrix · Role-Based AI Use Rules · AI Vendor Review Checklist ·
   Employee AI Use Attestation · Shadow AI Risk Register · Guardrail Roadmap ·
   Board/GC Summary Memo · Privacy + Data Retention Statement ·
   Legal Review Notes / No Legal Advice Disclaimer.
6. **Export** the whole pack as a JSON object (`schemaVersion`, `product`,
   scoring, requirements, controls, register, documents) for future
   integration — downloaded directly from browser memory.

The results dashboard renders the scorecard, risk flags, jurisdiction coverage,
controls, and a tabbed preview of every document, with edit-in-browser fields
(company name, owner, reviewer, effective date, approved tools) that regenerate
the pack live.

> **Not legal advice.** The engine produces *policy coverage and control
> recommendations* from deterministic templates. It does not provide legal
> advice and does not guarantee compliance. Have qualified counsel review any
> output before adoption. A future, optional local WebLLM mode may enrich
> drafting, but the MVP works fully offline/static after install.

## Deployment

Pinpoint is a privacy-first **static** app: there is no backend, no database, and
no API route. `next.config.mjs` sets `output: "export"`, so `npm run build`
produces a fully static site in `./out` that you can host on any static platform.

Security headers (including the strict `Content-Security-Policy`) ship in
[`public/_headers`](./public/_headers), which is copied into `out/` at build time
and applied by static hosts such as Cloudflare Pages. Always serve over HTTPS.

### Cloudflare Pages (recommended)

| Setting | Value |
| --- | --- |
| Build command | `npx next build` |
| Build output directory | `out` |
| Production branch | `main` |
| Environment variable | `NODE_VERSION=20` (or `22`) |

Cloudflare receives ordinary static-hosting request metadata (URL, IP, user
agent) like any web host, but **never** your assessment answers or generated
policy pack — those stay in your browser. Do **not** enable Cloudflare Analytics,
Pages Functions, Workers, KV/D1/R2, or Access during the MVP. Full guide:
[`docs/DEPLOYMENT_CLOUDFLARE.md`](./docs/DEPLOYMENT_CLOUDFLARE.md).

## Roadmap

- **Done:** deterministic policy engine, results dashboard, and client-side
  DOCX / PDF / JSON export.
- **Next:** Markdown export and richer document theming.
- Optional, fully local WebLLM drafting to enrich the deterministic templates
  (still offline, still no server).
- Optional, fully local import/export of a draft as an encrypted file.
- **Optional desktop agent (future, opt-in):** a local helper for deeper,
  on-device environment discovery — strictly local, no cloud, and never
  required to use Pinpoint.

## License

MIT — see [LICENSE](./LICENSE).
