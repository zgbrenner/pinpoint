/**
 * Pinpoint ships as a fully static export (Cloudflare Pages, or any static host).
 *
 * PRIVACY/SECURITY: there is no server runtime — no API routes, no server
 * actions, no backend storage. Security response headers (including the strict
 * Content-Security-Policy) are served by the host via `public/_headers`, which
 * Cloudflare Pages applies to every response. Next.js `headers()` is intentionally
 * NOT used here because it has no effect under `output: "export"`; `_headers` is
 * the single source of truth so dev and production stay consistent.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a static site into ./out — no Node server required to host it.
  output: "export",
  // Cloudflare Pages serves clean directory URLs; trailing slashes make routing
  // (and 404 handling) predictable for the exported folder-per-route layout.
  trailingSlash: true,
  // No next/image is used, but if it ever is, the optimizer needs a server.
  // Keep it unoptimized so images work on a pure static host.
  images: { unoptimized: true },
  reactStrictMode: true,
  // Privacy: never advertise the framework; no analytics or telemetry anywhere.
  poweredByHeader: false,
};

export default nextConfig;
