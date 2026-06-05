# Pinpoint Privacy Architecture

Pinpoint is built so there is **no server to leak from**. This document explains
exactly how data flows, what is and is not collected, how it is stored and
deleted, and the limits of the design.

> Summary: your assessment answers stay in your browser. Nothing is uploaded,
> there is no account, and there is no analytics or telemetry of any kind.

## Local-only data flow

```
You ─▶ Browser UI (React, client-side)
          │
          ├─▶ In-memory React state ......... while the tab is open
          │
          ├─▶ IndexedDB (Dexie) ............. only when you click "Save draft"
          │
          └─▶ Policy engine + exporters ..... pure functions, in the browser
                    │
                    └─▶ DOCX / PDF / JSON ..... built in memory, downloaded to you
```

There is **no backend application server** that receives assessment data, **no
database**, and **no API route** that accepts or persists company/assessment
inputs. Every page renders as static output. The only network requests the app
makes are for its own static assets from the same origin; the Content Security
Policy (`connect-src 'self'`) structurally forbids requests to any third party.

## What the assessment collects (in your browser only)

- Company profile: optional name, optional industry, size band, regulated-sector
  flag.
- Jurisdictions: regions (US/EU/UK/CA) and optional US state codes.
- AI tools, business systems, sensitive-data categories, departments/roles, and
  AI use cases (selected from lists or free text).
- Risk tolerance, approval workflow, human-review and approved-tool-list flags.
- Editable pack metadata: owner, reviewer, effective date, version, approved
  tools.

All of the above is held in memory and, if you choose to save, in this browser's
IndexedDB. It is never transmitted.

## What browser environment fields the optional scan reads

The optional **local environment scan** reads only coarse, non-unique
capability hints that any website can already see, to help tailor recommended
controls:

- Browser family and platform hint (from UA / UA-Client-Hints)
- Logical CPU core count (`navigator.hardwareConcurrency`)
- Approximate device memory, browser-rounded (`navigator.deviceMemory`)
- Screen size **category** (small/medium/large — never raw pixels)
- Timezone and language
- Permission **states** for camera, microphone, notifications, geolocation
  (read without prompting and without activating any sensor)
- Storage quota/usage estimate, rounded to GB

The scan is **opt-in**, computed on demand, displayed only on the page, and
never stored or transmitted.

## What is NOT collected

- No accounts, names, emails, or passwords (there is no auth).
- No analytics, telemetry, product metrics, or session recording.
- No cookies for tracking. (No tracking cookies are set at all.)
- No fingerprint hash and no persistent unique visitor ID.
- No access to your camera, microphone, location, files, contacts, other tabs,
  history, or installed software.
- No third-party scripts, no remote fonts, no remote document-rendering service.

## Storage model

- **In-memory** for the duration of the visit (React state).
- **IndexedDB** (via Dexie), database name `pinpoint`, a single `assessments`
  store keyed by a constant `draft` id — written **only** when you click
  "Save draft". The key is a constant string, not a tracking identifier.

## Deletion model

- The **Delete local data** button calls `Dexie.delete("pinpoint")`, removing
  the entire IndexedDB database — not just rows.
- Clearing site data in your browser, or using a private/incognito window,
  removes everything as well.
- Because nothing is ever uploaded, deletion is complete and final: there are no
  server copies, backups, or logs to purge.

## No-retention promise

Pinpoint retains **nothing** about you on any server, because no server ever
receives your data. The only persistence is the local draft you explicitly save,
which you control and can delete at any time.

## Threat model

What the design protects against:

- **Server breach / subpoena of user data** — there is no server-side user data,
  so there is nothing to breach or disclose.
- **Passive network observation** — assessment content is never sent over the
  network; `connect-src 'self'` blocks third-party exfiltration paths.
- **Third-party tracking** — no analytics, trackers, fonts, or scripts from
  other origins; FLoC/Topics disabled via headers.
- **Accidental data retention** — saving is explicit and deletion is one click.

Out of scope / shared responsibility:

- **A compromised device or browser** (malware, malicious extensions) can read
  anything you can; an AI browser extension is itself a risk Pinpoint flags.
- **Whoever can use your unlocked browser profile** can read a saved local
  draft. Use device-level security and the Delete control on shared machines.
- **Your hosting choice.** If you self-host, configure HTTPS and keep the CSP
  headers; a misconfigured host is outside Pinpoint's control.

## Limitations

- The local scan only surfaces what the browser exposes; it cannot and does not
  attempt deeper device inspection.
- Pinpoint is a policy **drafting** aid. Its coverage notes are best-effort and
  not a legal compliance determination (see `LEGAL_DISCLAIMER.md`).
- `'unsafe-inline'` is permitted in the CSP for scripts/styles because Next.js
  hydration and Tailwind require it; the app renders no user-supplied HTML or
  script, keeping the practical risk low.
