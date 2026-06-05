import type { PolicyPack } from "@/lib/policy/types";
import { buildExportModel, type ExportModel, type ExportSection } from "./model";

/**
 * Client-side PDF builder.
 *
 * PRIVACY: runs entirely in the browser. `jspdf` and `jspdf-autotable` are
 * dynamically imported and the PDF is assembled from local state in memory —
 * no server, no remote rendering service.
 */

const MARGIN = 56; // ~0.78in at 72dpi
const LINE = 15;

interface Cursor {
  y: number;
}

/** Build a PDF Blob from a policy pack (browser-only). */
export async function exportPdf(pack: PolicyPack): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const model = buildExportModel(pack);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  const bottom = pageHeight - MARGIN;
  const cur: Cursor = { y: MARGIN };

  const ensureSpace = (needed: number) => {
    if (cur.y + needed > bottom) {
      doc.addPage();
      cur.y = MARGIN;
    }
  };

  const text = (
    str: string,
    opts: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number } = {},
  ) => {
    const size = opts.size ?? 10.5;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? [20, 20, 20]));
    const lines = doc.splitTextToSize(str, contentWidth) as string[];
    lines.forEach((ln) => {
      ensureSpace(LINE);
      doc.text(ln, MARGIN, cur.y);
      cur.y += size + 4;
    });
    cur.y += opts.gap ?? 4;
  };

  const bullets = (items: string[]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    items.forEach((item) => {
      const lines = doc.splitTextToSize(item, contentWidth - 16) as string[];
      lines.forEach((ln, idx) => {
        ensureSpace(LINE);
        if (idx === 0) doc.text("•", MARGIN, cur.y);
        doc.text(ln, MARGIN + 14, cur.y);
        cur.y += 14;
      });
      cur.y += 2;
    });
    cur.y += 2;
  };

  const table = (columns: string[], rows: string[][]) => {
    ensureSpace(60);
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: cur.y,
      margin: { left: MARGIN, right: MARGIN },
      styles: { fontSize: 9, cellPadding: 4, overflow: "linebreak", valign: "top" },
      headStyles: { fillColor: [34, 47, 62], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      tableWidth: contentWidth,
    });
    const after = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    cur.y = (after?.finalY ?? cur.y) + 12;
  };

  /* -------------------------- Cover page -------------------------- */
  cur.y = MARGIN + 80;
  text(model.title, { size: 30, bold: true, color: [25, 35, 55], gap: 6 });
  text(model.companyName, { size: 18, color: [60, 60, 60], gap: 16 });

  const metaLine = (label: string, value: string) => {
    ensureSpace(LINE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(`${label}: `, MARGIN, cur.y);
    const labelW = doc.getTextWidth(`${label}: `);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value, contentWidth - labelW) as string[];
    doc.text(lines[0] ?? "", MARGIN + labelW, cur.y);
    cur.y += 16;
    for (let i = 1; i < lines.length; i++) {
      ensureSpace(LINE);
      doc.text(lines[i], MARGIN + labelW, cur.y);
      cur.y += 16;
    }
  };
  metaLine("Generated", model.generatedDate);
  metaLine("Company", model.companyName);
  metaLine("Jurisdictions", model.jurisdictionsLabel);
  metaLine("Policy owner", model.owner);
  metaLine("Reviewer", model.reviewer);
  metaLine("Effective date", model.effectiveDate);
  metaLine("Version", model.version);
  cur.y += 10;
  text("Important notice", { size: 12, bold: true, color: [25, 35, 55] });
  text(model.disclaimer, { size: 9.5, color: [90, 90, 90], gap: 8 });
  text("Privacy & data retention", { size: 12, bold: true, color: [25, 35, 55] });
  text(model.privacyStatement, { size: 9.5, color: [90, 90, 90] });

  /* ------------------------ Table of contents ------------------------ */
  doc.addPage();
  cur.y = MARGIN;
  text("Table of Contents", { size: 18, bold: true, color: [25, 35, 55], gap: 8 });
  model.toc.forEach((t) => {
    ensureSpace(LINE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(`${t.number}.  ${t.title}`, MARGIN, cur.y);
    cur.y += 18;
  });

  /* --------------------------- Sections --------------------------- */
  const renderSection = (section: ExportSection) => {
    doc.addPage();
    cur.y = MARGIN;
    text(`${section.number}. ${section.title}`, {
      size: 16,
      bold: true,
      color: [25, 35, 55],
      gap: 4,
    });
    if (section.summary) {
      text(section.summary, { size: 10, color: [110, 110, 110], gap: 8 });
    }
    for (const block of section.blocks) {
      if (block.type === "heading") {
        text(block.text, { size: 12, bold: true, color: [30, 40, 60], gap: 2 });
      } else if (block.type === "paragraph") {
        text(block.text, { gap: 6 });
      } else if (block.type === "bullets") {
        bullets(block.items);
      } else if (block.type === "table") {
        table(block.columns, block.rows);
      }
    }
  };
  model.sections.forEach(renderSection);

  /* ------------------------- Page numbers ------------------------- */
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Page ${i} of ${pageCount}  —  Generated by Pinpoint (local-only)`,
      pageWidth / 2,
      pageHeight - 24,
      { align: "center" },
    );
  }

  return doc.output("blob");
}

export type { ExportModel };
