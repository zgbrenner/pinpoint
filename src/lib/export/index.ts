import type { PolicyPack } from "@/lib/policy/types";
import { exportBaseName } from "./model";

/**
 * Export entry points. Every export is produced from local state in the
 * browser and downloaded directly from memory — there is no upload step and no
 * remote rendering service involved.
 */

/** Trigger a browser download for an in-memory Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Release the object URL on the next tick so the download can start.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Serialize the full PolicyPack as a pretty-printed JSON Blob. */
export function buildJsonBlob(pack: PolicyPack): Blob {
  return new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
}

export async function downloadDocx(pack: PolicyPack): Promise<void> {
  const { exportDocx } = await import("./docx");
  downloadBlob(await exportDocx(pack), `${exportBaseName(pack)}.docx`);
}

export async function downloadPdf(pack: PolicyPack): Promise<void> {
  const { exportPdf } = await import("./pdf");
  downloadBlob(await exportPdf(pack), `${exportBaseName(pack)}.pdf`);
}

export function downloadJson(pack: PolicyPack): void {
  downloadBlob(buildJsonBlob(pack), `${exportBaseName(pack)}.json`);
}

export { buildExportModel, exportBaseName } from "./model";
export type { ExportModel, ExportSection, ExportBlock } from "./model";
