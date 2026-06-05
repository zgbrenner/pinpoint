/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Privacy: Next.js telemetry is also disabled via .env / CI, but we make the
  // intent explicit here. Pinpoint ships no analytics or telemetry of any kind.
  poweredByHeader: false,
  // Security/privacy response headers. We deliberately avoid any third-party
  // origins so the default Content-Security-Policy can stay strict.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          // No third-party embeds, no cross-origin data leakage.
          {
            key: "Permissions-Policy",
            value: "browsing-topics=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
