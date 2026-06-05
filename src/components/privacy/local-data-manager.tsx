"use client";

import * as React from "react";
import { Save, FolderOpen, Trash2, HardDriveDownload, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAssessment } from "@/components/assessment/assessment-context";

function formatTime(ts: number | null) {
  if (!ts) return "Not saved locally yet";
  try {
    return `Saved locally ${new Date(ts).toLocaleString()}`;
  } catch {
    return "Saved locally";
  }
}

/**
 * Local data controls: save draft, load draft, and the required
 * "Delete local data" button. Also renders the privacy status card.
 */
export function LocalDataManager() {
  const { saveLocal, loadLocal, deleteLocal, lastSavedAt } = useAssessment();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    setMessage(null);
    try {
      const result = await fn();
      if (label === "load" && result === false) {
        setMessage("No saved draft found in this browser.");
      } else if (label === "save") {
        setMessage("Draft saved to this browser only.");
      } else if (label === "delete") {
        setMessage("All local Pinpoint data was deleted from this browser.");
      }
    } catch {
      setMessage("Local storage is unavailable in this browser session.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-signal" />
          <CardTitle className="text-base">Local data</CardTitle>
        </div>
        <CardDescription>
          {/* PRIVACY: this is the user's at-a-glance assurance of where data lives. */}
          <Badge variant="success" className="mt-1">
            Stored locally in this browser only
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{formatTime(lastSavedAt)}</p>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => run("save", saveLocal)}
          >
            <Save className="h-4 w-4" />
            Save draft
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => run("load", loadLocal)}
          >
            <FolderOpen className="h-4 w-4" />
            Load draft
          </Button>

          {!confirmingDelete ? (
            <Button
              size="sm"
              variant="destructive"
              disabled={busy !== null}
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete local data
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1">
              <span className="text-xs">Delete everything stored locally?</span>
              <Button
                size="sm"
                variant="destructive"
                disabled={busy !== null}
                onClick={async () => {
                  await run("delete", deleteLocal);
                  setConfirmingDelete(false);
                }}
              >
                Confirm delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <HardDriveDownload className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Drafts are written to this browser&apos;s IndexedDB. They are never
          uploaded. Clearing site data or using Delete local data removes them
          completely.
        </p>

        {message && (
          <p className="text-xs font-medium text-foreground" role="status">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
