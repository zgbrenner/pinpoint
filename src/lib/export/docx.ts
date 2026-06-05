import type { PolicyPack } from "@/lib/policy/types";
import { buildExportModel, type ExportModel, type ExportSection } from "./model";

/**
 * Client-side DOCX builder.
 *
 * PRIVACY: this runs entirely in the browser. The `docx` library is dynamically
 * imported and the resulting file is assembled from local state in memory — no
 * server, no remote rendering service.
 */

// Keep these loose so we don't pin to docx's internal types at module scope
// (the library is dynamically imported inside the function).
type DocxModule = typeof import("docx");

function buildSection(docx: DocxModule, section: ExportSection) {
  const {
    Paragraph,
    HeadingLevel,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
  } = docx;

  const children: InstanceType<typeof Paragraph | typeof Table>[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: `${section.number}. ${section.title}` })],
    }),
  );
  if (section.summary) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.summary, italics: true, color: "555555" })],
      }),
    );
  }

  for (const block of section.blocks) {
    if (block.type === "heading") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: block.text })],
        }),
      );
    } else if (block.type === "paragraph") {
      children.push(new Paragraph({ children: [new TextRun({ text: block.text })] }));
    } else if (block.type === "bullets") {
      for (const item of block.items) {
        children.push(
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: item })] }),
        );
      }
    } else if (block.type === "table") {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: block.columns.map(
                (col) =>
                  new TableCell({
                    shading: { fill: "EFF1F5" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [new TextRun({ text: col, bold: true })],
                      }),
                    ],
                  }),
              ),
            }),
            ...block.rows.map(
              (row) =>
                new TableRow({
                  children: row.map(
                    (cell) =>
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: cell })] })],
                      }),
                  ),
                }),
            ),
          ],
        }),
      );
      // Spacer after a table.
      children.push(new Paragraph({ children: [] }));
    }
  }

  return children;
}

function coverChildren(docx: DocxModule, model: ExportModel) {
  const { Paragraph, HeadingLevel, TextRun, AlignmentType } = docx;
  const line = (label: string, value: string) =>
    new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true }),
        new TextRun({ text: value }),
      ],
    });

  return [
    new Paragraph({ children: [] }),
    new Paragraph({ children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: model.title })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: model.companyName, size: 32, color: "333333" })],
    }),
    new Paragraph({ children: [] }),
    line("Generated", model.generatedDate),
    line("Company", model.companyName),
    line("Jurisdictions", model.jurisdictionsLabel),
    line("Policy owner", model.owner),
    line("Reviewer", model.reviewer),
    line("Effective date", model.effectiveDate),
    line("Version", model.version),
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: "Important notice" })],
    }),
    new Paragraph({ children: [new TextRun({ text: model.disclaimer, italics: true })] }),
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: "Privacy & data retention" })],
    }),
    new Paragraph({ children: [new TextRun({ text: model.privacyStatement })] }),
  ];
}

function tocChildren(docx: DocxModule, model: ExportModel) {
  const { Paragraph, HeadingLevel, TextRun } = docx;
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "Table of Contents" })],
    }),
    ...model.toc.map(
      (t) =>
        new Paragraph({
          children: [new TextRun({ text: `${t.number}. ${t.title}` })],
        }),
    ),
  ];
}

/** Build a DOCX Blob from a policy pack (browser-only). */
export async function exportDocx(pack: PolicyPack): Promise<Blob> {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, PageBreak, AlignmentType, Footer, TextRun, PageNumber } =
    docx;
  const model = buildExportModel(pack);

  const body: InstanceType<typeof Paragraph | typeof docx.Table>[] = [];
  body.push(...coverChildren(docx, model));
  body.push(new Paragraph({ children: [new PageBreak()] }));
  body.push(...tocChildren(docx, model));
  body.push(new Paragraph({ children: [new PageBreak()] }));
  model.sections.forEach((section, i) => {
    body.push(...buildSection(docx, section));
    if (i < model.sections.length - 1) {
      body.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  const doc = new Document({
    creator: "Pinpoint",
    title: `${model.title} — ${model.companyName}`,
    description: "AI policy pack generated locally by Pinpoint.",
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Page ", size: 16, color: "888888" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "888888" }),
                  new TextRun({ text: " — Generated by Pinpoint (local-only)", size: 16, color: "888888" }),
                ],
              }),
            ],
          }),
        },
        children: body,
      },
    ],
  });

  return Packer.toBlob(doc);
}
