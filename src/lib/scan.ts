/**
 * Local browser environment scan.
 *
 * PRIVACY DESIGN — please keep this honest:
 * - We read ONLY coarse, non-unique capability hints that the browser already
 *   exposes to any page. The goal is to tailor *recommended controls*, not to
 *   identify the visitor.
 * - We deliberately bucket values (e.g. screen size category, memory rounded)
 *   to avoid building anything that resembles a fingerprint.
 * - We NEVER hash these values together, never combine them into an id, never
 *   persist them, and never transmit them. The result is computed on demand and
 *   lives in React state for the length of the visit only.
 * - Permission *states* are read with the Permissions API in a way that does
 *   NOT prompt the user and does NOT activate any sensor.
 */

export type PermissionState = "granted" | "denied" | "prompt" | "unsupported";

export interface BrowserScan {
  browserFamily: string;
  platform: string;
  /** navigator.hardwareConcurrency, if exposed. */
  logicalCpu: number | null;
  /** navigator.deviceMemory in GB (coarse, browser-rounded), if exposed. */
  approxDeviceMemoryGb: number | null;
  /** Bucketed screen size, never raw pixel dimensions. */
  screenSizeCategory: "small" | "medium" | "large" | "unknown";
  timezone: string;
  language: string;
  permissions: {
    camera: PermissionState;
    microphone: PermissionState;
    notifications: PermissionState;
    geolocation: PermissionState;
  };
  storage: {
    /** Rounded to GB to avoid precise, identifying values. */
    quotaGb: number | null;
    usageGb: number | null;
  };
}

/** Best-effort, non-unique browser family from UA / UA-Client-Hints. */
function detectBrowserFamily(): string {
  if (typeof navigator === "undefined") return "unknown";
  // Prefer the privacy-friendlier UA-CH brands list where available.
  const uaData = (navigator as Navigator & {
    userAgentData?: { brands?: { brand: string }[] };
  }).userAgentData;
  if (uaData?.brands?.length) {
    const known = uaData.brands
      .map((b) => b.brand)
      .find((b) => !/not.?a.?brand/i.test(b));
    if (known) return known;
  }
  const ua = navigator.userAgent || "";
  if (/edg\//i.test(ua)) return "Edge";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function detectPlatform(): string {
  if (typeof navigator === "undefined") return "unknown";
  const uaData = (navigator as Navigator & {
    userAgentData?: { platform?: string };
  }).userAgentData;
  if (uaData?.platform) return uaData.platform;
  // navigator.platform is deprecated but still a coarse, non-unique hint.
  return (navigator as Navigator & { platform?: string }).platform || "unknown";
}

function bucketScreenSize(): BrowserScan["screenSizeCategory"] {
  if (typeof window === "undefined" || !window.screen) return "unknown";
  // Use the larger edge so orientation does not matter. Bucketed on purpose.
  const longEdge = Math.max(window.screen.width, window.screen.height);
  if (longEdge <= 820) return "small";
  if (longEdge <= 1600) return "medium";
  return "large";
}

async function queryPermission(
  name: PermissionName,
): Promise<PermissionState> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unsupported";
  }
  try {
    // This does not prompt and does not start the device — it only reports state.
    const status = await navigator.permissions.query({ name });
    return status.state as PermissionState;
  } catch {
    return "unsupported";
  }
}

async function readStorageEstimate(): Promise<BrowserScan["storage"]> {
  if (
    typeof navigator === "undefined" ||
    !navigator.storage?.estimate
  ) {
    return { quotaGb: null, usageGb: null };
  }
  try {
    const est = await navigator.storage.estimate();
    const toGb = (n?: number) =>
      typeof n === "number" ? Math.round((n / 1024 ** 3) * 10) / 10 : null;
    return { quotaGb: toGb(est.quota), usageGb: toGb(est.usage) };
  } catch {
    return { quotaGb: null, usageGb: null };
  }
}

/** Run the local scan. Safe to call client-side only. */
export async function runBrowserScan(): Promise<BrowserScan> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;

  const [camera, microphone, notifications, geolocation, storage] =
    await Promise.all([
      queryPermission("camera" as PermissionName),
      queryPermission("microphone" as PermissionName),
      queryPermission("notifications" as PermissionName),
      queryPermission("geolocation" as PermissionName),
      readStorageEstimate(),
    ]);

  const deviceMemory = (nav as Navigator & { deviceMemory?: number })
    ?.deviceMemory;

  return {
    browserFamily: detectBrowserFamily(),
    platform: detectPlatform(),
    logicalCpu: nav?.hardwareConcurrency ?? null,
    // deviceMemory is already coarsely rounded by the browser (0.25..8).
    approxDeviceMemoryGb: typeof deviceMemory === "number" ? deviceMemory : null,
    screenSizeCategory: bucketScreenSize(),
    timezone:
      Intl?.DateTimeFormat?.().resolvedOptions().timeZone ?? "unknown",
    language: nav?.language ?? "unknown",
    permissions: { camera, microphone, notifications, geolocation },
    storage,
  };
}
