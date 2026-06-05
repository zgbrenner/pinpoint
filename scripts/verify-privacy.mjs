#!/usr/bin/env node
/**
 * Standalone privacy verification.
 *
 * Mirrors src/privacy-verification.test.ts so the checks can run in any
 * pipeline without the full test runner. Exits non-zero on any violation.
 *
 *   node scripts/verify-privacy.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  failures.push(msg);
  console.error(`  ✗ ${msg}`);
};

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

console.log("Pinpoint privacy verification\n");

// 1. No API routes accepting assessment data.
const routeHandlers = walk(path.join(ROOT, "src", "app")).filter((f) =>
  /[/\\]route\.(t|j)sx?$/.test(f),
);
if (routeHandlers.length === 0 && !existsSync(path.join(ROOT, "src", "app", "api"))) {
  ok("No API route handlers that could receive assessment data");
} else {
  fail(`Found API route handlers: ${routeHandlers.join(", ") || "src/app/api"}`);
}

// 2 & 3. No analytics/telemetry packages.
const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
const blocked = [
  "google-analytics", "gtag", "react-ga", "@vercel/analytics", "@segment",
  "analytics-node", "mixpanel", "amplitude", "posthog", "plausible", "@sentry",
  "datadog", "dd-trace", "newrelic", "bugsnag", "logrocket", "hotjar", "fullstory",
];
const offenders = deps.filter((d) => blocked.some((b) => d.includes(b)));
if (offenders.length === 0) ok("No analytics or telemetry dependencies");
else fail(`Analytics/telemetry packages present: ${offenders.join(", ")}`);

// 4. Export code is client-side with no network calls.
const exportFiles = walk(path.join(ROOT, "src", "lib", "export")).filter(
  (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
);
const forbidden = /\bfetch\s*\(|axios|XMLHttpRequest|sendBeacon|next\/server|from\s+["']node:fs["']/;
const netOffenders = exportFiles.filter((f) => forbidden.test(readFileSync(f, "utf8")));
if (netOffenders.length === 0) ok("Export code runs client-side with no network calls");
else fail(`Export files with network/server usage: ${netOffenders.join(", ")}`);

// 5. Framework telemetry disabled.
const env = existsSync(path.join(ROOT, ".env")) ? readFileSync(path.join(ROOT, ".env"), "utf8") : "";
if (/NEXT_TELEMETRY_DISABLED\s*=\s*1/.test(env)) ok("Next.js telemetry disabled");
else fail("NEXT_TELEMETRY_DISABLED=1 missing from .env");

console.log("");
if (failures.length) {
  console.error(`Privacy verification FAILED (${failures.length} issue(s)).`);
  process.exit(1);
}
console.log("Privacy verification passed.");
