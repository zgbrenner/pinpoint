"use client";

import * as React from "react";
import { ScanLine, Info, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { runBrowserScan, type BrowserScan, type PermissionState } from "@/lib/scan";

function permissionBadge(state: PermissionState) {
  const variant =
    state === "granted"
      ? "success"
      : state === "denied"
        ? "danger"
        : state === "prompt"
          ? "warning"
          : "secondary";
  const label =
    state === "unsupported" ? "not queryable" : state;
  return <Badge variant={variant}>{label}</Badge>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

/**
 * Transparent local browser scan.
 *
 * PRIVACY: This component renders only coarse, non-unique capability hints and
 * computes them on demand. Nothing here is hashed into an identifier, persisted,
 * or transmitted. The scan is opt-in: it does not auto-run until the user asks.
 */
export function BrowserScanCard() {
  const [scan, setScan] = React.useState<BrowserScan | null>(null);
  const [loading, setLoading] = React.useState(false);

  const doScan = React.useCallback(async () => {
    setLoading(true);
    try {
      setScan(await runBrowserScan());
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-signal" />
          <CardTitle className="text-base">Local environment scan</CardTitle>
        </div>
        <CardDescription>
          An optional, on-device read of coarse browser capabilities to help
          tailor recommended controls. No unique identifier is created or stored.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scan ? (
          <div className="flex flex-col items-start gap-3">
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Reads only values your browser already exposes to every site (e.g.
              browser family, timezone, permission states). Results stay on this
              page and are never saved or sent.
            </p>
            <Button size="sm" onClick={doScan} disabled={loading}>
              <ScanLine className="h-4 w-4" />
              {loading ? "Scanning…" : "Run local scan"}
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <Row label="Browser family" value={scan.browserFamily} />
            <Row label="Platform" value={scan.platform} />
            <Row
              label="Logical CPU cores"
              value={scan.logicalCpu ?? "not exposed"}
            />
            <Row
              label="Approx. device memory"
              value={
                scan.approxDeviceMemoryGb != null
                  ? `${scan.approxDeviceMemoryGb} GB`
                  : "not exposed"
              }
            />
            <Row label="Screen size" value={scan.screenSizeCategory} />
            <Row label="Timezone" value={scan.timezone} />
            <Row label="Language" value={scan.language} />
            <Row
              label="Camera permission"
              value={permissionBadge(scan.permissions.camera)}
            />
            <Row
              label="Microphone permission"
              value={permissionBadge(scan.permissions.microphone)}
            />
            <Row
              label="Notifications permission"
              value={permissionBadge(scan.permissions.notifications)}
            />
            <Row
              label="Geolocation permission"
              value={permissionBadge(scan.permissions.geolocation)}
            />
            <Row
              label="Storage quota"
              value={
                scan.storage.quotaGb != null
                  ? `~${scan.storage.quotaGb} GB`
                  : "not exposed"
              }
            />

            <div className="mt-3 rounded-md border border-border bg-secondary/30 p-3">
              <p className="text-xs font-medium">Limitations of this scan</p>
              <ul className="mt-1 ml-4 list-disc space-y-0.5 text-xs text-muted-foreground">
                <li>Values are coarse and shared by many users — not a unique identifier.</li>
                <li>No fingerprint hash is computed; results are not stored or sent.</li>
                <li>It cannot see your files, other tabs, history, or installed apps.</li>
                <li>Permission states are read without prompting or activating any sensor.</li>
              </ul>
            </div>

            <div className="pt-3">
              <Button size="sm" variant="ghost" onClick={doScan} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
                Re-run scan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
