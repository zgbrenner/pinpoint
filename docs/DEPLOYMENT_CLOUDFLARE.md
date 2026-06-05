# Deploying Pinpoint to Cloudflare Pages

Pinpoint is a **fully static, browser-only** app. It builds to a plain folder of
HTML/CSS/JS with **no server runtime** — no API routes, no server actions, no
Workers, Pages Functions, KV, D1, R2, or Access. That makes Cloudflare Pages
(static hosting) an ideal target.

## Prerequisites

- The repository connected to Cloudflare Pages.
- Node 20 or 22 for the build (set via an environment variable, below).

## One-time setup (Cloudflare dashboard)

1. **Workers & Pages → Create → Pages → Connect to Git**, and select this
   repository.
2. **Set up builds and deployments** with these settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | None (or "Next.js (Static HTML Export)") |
   | Build command | `npx next build` |
   | Build output directory | `out` |
   | Production branch | `main` |

3. **Environment variables** (Build settings → Environment variables):

   | Variable | Value | Why |
   | --- | --- | --- |
   | `NODE_VERSION` | `20` (or `22`) | Pin a modern Node for the build |
   | `NEXT_TELEMETRY_DISABLED` | `1` | Belt-and-suspenders; already set in `.env` |

4. **Save and Deploy.** Cloudflare runs `npx next build`, which produces the
   static site in `out/` (including `out/_headers`), and serves it.

> `next build` here performs a **static export** because `next.config.mjs` sets
> `output: "export"`. There is nothing server-side to run.

## Security headers

Security headers — including the strict Content-Security-Policy — live in
[`public/_headers`](../public/_headers). Files in `public/` are copied verbatim
into `out/`, so `out/_headers` ships with every build and Cloudflare Pages
applies it to every response automatically. No dashboard configuration is
required for headers.

The CSP uses `connect-src 'self'`, which structurally blocks the page from making
requests to any third-party origin. Client-side DOCX/PDF generation works because
`blob:` is permitted for `img-src`/`worker-src`.

## Custom domain & HTTPS

Add your domain under **Pages project → Custom domains**. Cloudflare provisions
TLS automatically. Keep HTTPS enforced; the CSP includes
`upgrade-insecure-requests`.

## What Cloudflare can and cannot see

- **Can see:** ordinary static-hosting request metadata — the URLs/assets a
  browser fetches, IP address, timestamp, and user agent — the same as any web
  host or CDN. This is inherent to serving a website over the internet.
- **Cannot see:** your **assessment answers** or **generated policy pack**.
  Those never leave your browser. Pinpoint sends them to no server (Cloudflare's
  or anyone's), stores them in no database, and writes them only to your browser's
  local IndexedDB when you choose to save. Exports (DOCX/PDF/JSON) are generated
  entirely client-side and downloaded directly from browser memory.

If you want to minimize even request-metadata visibility, you can place the site
behind Cloudflare's standard proxy defaults; do not add request logging that
captures query strings or bodies (Pinpoint never puts user data in URLs anyway).

## Do NOT enable during the MVP

To preserve the privacy guarantees, **do not** enable any of the following on the
Pages project:

- Cloudflare **Web Analytics** / RUM, or any third-party analytics/telemetry.
- **Pages Functions**, **Workers**, **KV**, **D1**, **R2**, or **Durable
  Objects** — Pinpoint needs no server-side compute or storage, and adding one
  would create a place user data could be sent or retained.
- **Cloudflare Access** or any auth gateway — Pinpoint is account-free by design.

## Local verification before deploying

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run verify:privacy   # asserts no API routes / analytics / server egress
npm run build            # produces ./out (static export incl. _headers)
```

You can preview the exact static output locally with any static file server, e.g.
`npx serve out`, then visit the printed URL.
