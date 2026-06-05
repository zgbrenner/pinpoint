"use client";

import * as React from "react";
import { FileText, FileType2, FileDown, FileJson, Lock, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PolicyPack } from "@/lib/policy/types";
import { downloadDocx, downloadPdf, downloadJson } from "@/lib/export";

type Job = "docx" | "pdf" | "json" | null;

/**
 * Export controls. PRIVACY: every format is generated in the browser from the
 * in-memory pack and downloaded directly — no upload, no remote renderer.
 */
export function ExportPanel({ pack }: { pack: PolicyPack }) {
  const [busy, setBusy] = React.useState<Job>(null);
  const [error, setError] = React.useState<string | null>(null);

  const run = async (job: Exclude<Job, null>, fn: () => void | Promise<void>) => {
    setBusy(job);
    setError(null);
    try {
      await fn();
    } catch {
      setError("Export failed in this browser. Try a different browser or format.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileDown className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Export policy pack</CardTitle>
        </div>
        <CardDescription>
          Built in your browser and downloaded directly — never via a server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          className="w-full justify-start"
          disabled={busy !== null}
          onClick={() => run("docx", () => downloadDocx(pack))}
        >
          {busy === "docx" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileType2 className="h-4 w-4" />
          )}
          Download DOCX
        </Button>
        <Button
          className="w-full justify-start"
          disabled={busy !== null}
          onClick={() => run("pdf", () => downloadPdf(pack))}
        >
          {busy === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Download PDF
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={busy !== null}
          onClick={() => run("json", () => downloadJson(pack))}
        >
          <FileJson className="h-4 w-4" />
          Download JSON
        </Button>

        {error && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}

        <p className="flex items-start gap-2 pt-1 text-xs text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          DOCX and PDF are rendered client-side from your local data. Closing the
          tab leaves nothing behind on any server.
        </p>
      </CardContent>
    </Card>
  );
}
