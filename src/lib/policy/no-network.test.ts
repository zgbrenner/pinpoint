import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createEmptyAssessment } from "@/lib/schemas";
import { generatePolicyPack } from "./index";

/**
 * Guards Pinpoint's core privacy promise: the policy engine is fully local and
 * never depends on a server, network, or storage I/O.
 */
describe("policy engine has no server/API dependency", () => {
  const spies: Array<ReturnType<typeof vi.spyOn>> = [];

  beforeEach(() => {
    // Any network attempt should throw loudly.
    const fail = (label: string) =>
      vi.fn(() => {
        throw new Error(`Unexpected network call via ${label}`);
      });
    globalThis.fetch = fail("fetch") as unknown as typeof fetch;
    if (typeof XMLHttpRequest !== "undefined") {
      spies.push(
        vi.spyOn(XMLHttpRequest.prototype, "open").mockImplementation(() => {
          throw new Error("Unexpected XMLHttpRequest");
        }),
      );
    }
  });

  afterEach(() => {
    spies.forEach((s) => s.mockRestore());
    vi.restoreAllMocks();
  });

  it("generates a full pack without any network access", () => {
    const a = createEmptyAssessment();
    a.aiTools.aiTools = ["ChatGPT / OpenAI"];
    a.jurisdictions.jurisdictions = ["EU"];
    expect(() => generatePolicyPack(a)).not.toThrow();
    const pack = generatePolicyPack(a);
    expect(pack.documents.length).toBeGreaterThan(0);
  });

  it("contains no fetch/axios/XHR/import-url calls in policy source", () => {
    const dir = path.resolve(__dirname);
    const files = readdirSync(dir).filter(
      (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
    );
    const forbidden = /\bfetch\s*\(|axios|XMLHttpRequest|navigator\.sendBeacon|import\s*\(\s*["'`]https?:/;
    for (const file of files) {
      const src = readFileSync(path.join(dir, file), "utf8");
      expect(forbidden.test(src), `${file} should contain no network calls`).toBe(
        false,
      );
    }
  });
});
