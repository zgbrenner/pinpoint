import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Automated privacy verification.
 *
 * These checks defend Pinpoint's core promises in CI: no API routes that accept
 * assessment data, no analytics/telemetry dependencies, and exports that run
 * client-side. They are intentionally simple and fast.
 */

const ROOT = process.cwd();

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

describe("privacy verification", () => {
  it("has no API route handlers that could receive assessment data", () => {
    const appFiles = walk(path.join(ROOT, "src", "app"));
    const routeHandlers = appFiles.filter((f) => /[/\\]route\.(t|j)sx?$/.test(f));
    expect(routeHandlers).toEqual([]);
    // Classic Next API folders must not exist either.
    expect(existsSync(path.join(ROOT, "src", "app", "api"))).toBe(false);
    expect(existsSync(path.join(ROOT, "pages", "api"))).toBe(false);
    expect(existsSync(path.join(ROOT, "src", "pages", "api"))).toBe(false);
  });

  it("declares no analytics or telemetry dependencies", () => {
    const pkg = JSON.parse(
      readFileSync(path.join(ROOT, "package.json"), "utf8"),
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

    const blocked = [
      "google-analytics",
      "gtag",
      "react-ga",
      "@vercel/analytics",
      "@segment",
      "analytics-node",
      "mixpanel",
      "amplitude",
      "posthog",
      "plausible",
      "@sentry",
      "datadog",
      "dd-trace",
      "newrelic",
      "bugsnag",
      "logrocket",
      "hotjar",
      "fullstory",
    ];
    const offenders = deps.filter((d) =>
      blocked.some((b) => d === b || d.startsWith(`${b}/`) || d.includes(b)),
    );
    expect(offenders).toEqual([]);
  });

  it("ships export code that runs client-side with no network calls", () => {
    const exportDir = path.join(ROOT, "src", "lib", "export");
    const files = walk(exportDir).filter(
      (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
    );
    expect(files.length).toBeGreaterThan(0);

    const forbidden = /\bfetch\s*\(|axios|XMLHttpRequest|sendBeacon|next\/server|from\s+["']node:fs["']/;
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      expect(forbidden.test(src), `${path.basename(file)} must stay client-side`).toBe(
        false,
      );
    }

    // The heavy renderers are dynamically imported (client-only) and the
    // download path uses browser APIs.
    const docx = readFileSync(path.join(exportDir, "docx.ts"), "utf8");
    const pdf = readFileSync(path.join(exportDir, "pdf.ts"), "utf8");
    const index = readFileSync(path.join(exportDir, "index.ts"), "utf8");
    expect(docx).toMatch(/await import\(["']docx["']\)/);
    expect(pdf).toMatch(/await import\(["']jspdf["']\)/);
    expect(index).toMatch(/URL\.createObjectURL/);
  });

  it("disables framework telemetry in the environment", () => {
    const env = readFileSync(path.join(ROOT, ".env"), "utf8");
    expect(env).toMatch(/NEXT_TELEMETRY_DISABLED\s*=\s*1/);
  });
});
