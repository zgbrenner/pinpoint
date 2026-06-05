import type { ToolCategory, ToolEntry } from "./types";

/**
 * Deterministic AI-tool classification.
 *
 * Given a free-text tool name, infer its category and whether it is likely a
 * free/public consumer tier (which carries different data-handling risk than an
 * enterprise/agreement-backed deployment). This is a transparent keyword model —
 * no network calls, no model inference.
 */

interface ToolSignature {
  category: ToolCategory;
  patterns: RegExp[];
}

const SIGNATURES: ToolSignature[] = [
  {
    category: "coding-assistant",
    patterns: [
      /copilot/i,
      /cursor/i,
      /codeium|windsurf/i,
      /tabnine/i,
      /codewhisperer/i,
      /\bcode\b|coding|developer/i,
      /replit/i,
    ],
  },
  {
    category: "meeting-transcription",
    patterns: [
      /otter/i,
      /fireflies/i,
      /\bfathom\b/i,
      /gong/i,
      /grain/i,
      /read\.?ai/i,
      /transcri|meeting (notes|bot)|notetaker|note.?taker/i,
      /zoom ai|teams (copilot|premium)/i,
    ],
  },
  {
    category: "browser-extension",
    patterns: [/extension/i, /sidebar/i, /\bplugin\b/i, /merlin|harpa|monica/i],
  },
  {
    category: "image-generation",
    patterns: [
      /midjourney/i,
      /dall.?e/i,
      /stable diffusion/i,
      /firefly/i,
      /image (gen|generation)/i,
      /\bimagen\b/i,
      /ideogram|leonardo/i,
    ],
  },
  {
    category: "search-research",
    patterns: [/perplexity/i, /\bsearch\b|research/i, /elicit|consensus/i],
  },
  {
    category: "internal-self-hosted",
    patterns: [
      /internal/i,
      /self.?hosted/i,
      /on.?prem/i,
      /private (llm|model)/i,
      /\bollama\b|\bvllm\b|\blm studio\b/i,
    ],
  },
  {
    category: "general-llm",
    patterns: [
      /chatgpt|openai/i,
      /claude|anthropic/i,
      /gemini|bard/i,
      /copilot/i, // Microsoft Copilot (chat) — coding-copilot already matched above
      /llama|mistral|grok/i,
      /notion ai|\bgpt\b/i,
    ],
  },
];

/** True when the tool name suggests a free/public consumer tier. */
export function looksFreePublic(name: string): boolean {
  const n = name.toLowerCase();
  if (/enterprise|business|teams? plan|edu|api|azure|bedrock|vertex/.test(n)) {
    return false;
  }
  // Bare consumer brands default to "public tier" unless an org plan is named.
  return /chatgpt|openai|gemini|bard|perplexity|midjourney|claude\.ai|free|public|personal/.test(
    n,
  );
}

/** Classify a single tool name into a category. */
export function classifyTool(name: string): ToolCategory {
  for (const sig of SIGNATURES) {
    if (sig.patterns.some((p) => p.test(name))) return sig.category;
  }
  return "other";
}

/** Build a normalized tool inventory entry from a raw tool string. */
export function toToolEntry(name: string): ToolEntry {
  return {
    name: name.trim(),
    category: classifyTool(name),
    freePublic: looksFreePublic(name),
  };
}

/** Default risk tier for the Approved/Restricted/Blocked matrix. */
export type ToolTier = "Approved" | "Restricted" | "Blocked";

/**
 * Deterministic default tiering. The organization can override by listing a
 * tool in `approvedTools` (handled by the caller).
 */
export function defaultTier(entry: ToolEntry): {
  tier: ToolTier;
  rationale: string;
} {
  if (entry.category === "internal-self-hosted") {
    return {
      tier: "Approved",
      rationale: "Self-hosted/internal deployment keeps data within your boundary.",
    };
  }
  if (entry.category === "browser-extension") {
    return {
      tier: "Blocked",
      rationale:
        "Browser extensions can read page content broadly; block pending security review.",
    };
  }
  if (entry.freePublic) {
    return {
      tier: "Restricted",
      rationale:
        "Free/public tier may use inputs for training; restrict to non-sensitive data.",
    };
  }
  return {
    tier: "Approved",
    rationale: "Enterprise/agreement-backed tier with standard data protections.",
  };
}
