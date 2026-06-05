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
npm run lint       # ESLint (next/core-web-vitals)
npm run typecheck  # tsc --noEmit
npm run test       # Vitest unit tests
npm run build      # production build
```

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
    scoring.ts               # Transparent heuristic risk scoring
    catalog.ts               # Static option lists
```

## Roadmap

- **Next:** in-browser policy generation and Markdown/DOCX/PDF export
  (everything rendered and downloaded client-side).
- Richer, jurisdiction-specific control libraries.
- Optional, fully local import/export of a draft as an encrypted file.
- **Optional desktop agent (future, opt-in):** a local helper for deeper,
  on-device environment discovery — strictly local, no cloud, and never
  required to use Pinpoint.

## License

MIT — see [LICENSE](./LICENSE).
