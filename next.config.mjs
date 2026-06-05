/**
 * Content Security Policy for a static, local-first app.
 *
 * PRIVACY/SECURITY: `connect-src 'self'` is the key line — it forbids the page
 * from making network requests to any third-party origin, which structurally
 * prevents assessment data from being exfiltrated. We avoid all third-party
 * script/style/font origins; fonts are self-hosted (next/font) and served from
 * 'self'. 'unsafe-inline' is required for Next.js's hydration bootstrap and
 * Tailwind's injected styles; there is no user-generated HTML/script in the app,
 * so the XSS surface that 'unsafe-inline' would otherwise widen is minimal.
 * 'blob:' is allowed for img/worker so client-side DOCX/PDF export can build and
 * preview files in memory.
 */
// 'unsafe-eval' is needed ONLY by the Next.js dev server (React Refresh / HMR).
// Production builds keep a stricter script-src with no eval.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const ContentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Privacy: Next.js telemetry is also disabled via .env / CI, but we make the
  // intent explicit here. Pinpoint ships no analytics or telemetry of any kind.
  poweredByHeader: false,
  // Security/privacy response headers. We deliberately avoid any third-party
  // origins so the Content-Security-Policy can stay strict.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          // No third-party embeds, no cross-origin data leakage, no FLoC/topics.
          {
            key: "Permissions-Policy",
            value:
              "browsing-topics=(), interest-cohort=(), camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
