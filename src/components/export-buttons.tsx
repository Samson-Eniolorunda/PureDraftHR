"use client";

import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  Pencil,
  Mail,
  Save,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import type { DocumentStyling } from "@/hooks/useDocumentStyling";
import { markdownToHtml, BULLET_SYMBOLS } from "@/lib/markdown-to-html";
import { EmailDocumentModal } from "@/components/email-document-modal";

/** Lazy-loaded docx module type */
type DocxModule = typeof import("docx");

/* ------------------------------------------------------------------ */
/*  Dynamic filename extraction from markdown content                  */
/* ------------------------------------------------------------------ */
function extractFilename(content: string, fallbackPrefix: string): string {
  // Try to find the first H1 heading
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1]
      .trim()
      .replace(/[^a-zA-Z0-9\s\-_]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 60);
  }

  // Fallback to timestamped name
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fallbackPrefix}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

/* ------------------------------------------------------------------ */
/*  ExportButtons — PDF, DOCX, Copy to Clipboard                       */
/* ------------------------------------------------------------------ */
interface ExportButtonsProps {
  /** The raw markdown/text content to export */
  content: string;
  /** Fallback filename prefix (without extension) */
  filename?: string;
  /** Document styling configuration */
  styling?: DocumentStyling;
  /** Which tool generated this document (for save) */
  tool?: string;
  /** Document type (for save) */
  docType?: string;
}

export function ExportButtons({
  content,
  filename = "HR_Document",
  styling,
  tool,
  docType,
}: ExportButtonsProps) {
  const { isSignedIn } = useAuth();
  const [copied, setCopied] = useState(false);
  const [exportFileName, setExportFileName] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const dynamicFilename = extractFilename(content, filename);

  // Initialize the editable filename from the smart default when content changes
  useEffect(() => {
    setExportFileName(dynamicFilename);
  }, [dynamicFilename]);

  /** The actual filename used for exports (user-edited or smart default) */
  const resolvedFilename =
    exportFileName.trim().replace(/\.[^.]+$/, "") || dynamicFilename;

  /* ── Copy to Clipboard ── */
  const handleCopy = useCallback(async () => {
    try {
      // Copy plain text (strip markdown syntax for cleaner paste)
      const plainText = content
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/^[-*]\s+/gm, "- ")
        .trim();
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  /* ── PDF Export via html2pdf.js (lazy loaded) ── */
  const handlePdfExport = useCallback(async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    const container = document.createElement("div");
    container.style.padding = "24px";
    container.style.fontFamily =
      styling?.fontFamily || "Arial, Helvetica, sans-serif";
    container.style.fontSize = styling ? `${styling.bodyTextSizePt}pt` : "12pt";
    container.style.lineHeight = styling?.lineSpacing || "1.6";
    container.style.color = "#1a1a1a";

    // Convert markdown to HTML with bullet injection for PDF
    container.innerHTML = markdownToHtml(content, styling);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${resolvedFilename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(container).save();
    toast.success("PDF downloaded!");
  }, [content, resolvedFilename, styling]);

  /* ── Excel Export via xlsx (lazy loaded) ── */
  const hasTable = /^\|.+\|$/m.test(content);

  const handleExcelExport = useCallback(async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    // Try to extract markdown tables
    const tableRegex = /^(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)*)/gm;
    let match: RegExpExecArray | null;
    let sheetIndex = 0;

    while ((match = tableRegex.exec(content)) !== null) {
      const headerRow = match[1]
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      const bodyRows = match[3]
        .trim()
        .split("\n")
        .map((r) =>
          r
            .split("|")
            .filter((c) => c.trim())
            .map((c) => c.trim()),
        );

      const data = [headerRow, ...bodyRows];
      const ws = XLSX.utils.aoa_to_sheet(data);
      // Auto-size columns
      ws["!cols"] = headerRow.map((_, i) => ({
        wch: Math.max(...data.map((row) => (row[i] ? row[i].length : 10)), 10),
      }));
      const sheetName = sheetIndex === 0 ? "Sheet1" : `Sheet${sheetIndex + 1}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      sheetIndex++;
    }

    // If no tables found, export the full text as a single-cell sheet
    if (sheetIndex === 0) {
      const plainText = content
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .trim();
      const ws = XLSX.utils.aoa_to_sheet([[plainText]]);
      ws["!cols"] = [{ wch: 80 }];
      XLSX.utils.book_append_sheet(wb, ws, "Document");
    }

    XLSX.writeFile(wb, `${resolvedFilename}.xlsx`);
    toast.success("Excel downloaded!");
  }, [content, resolvedFilename]);

  /* ── DOCX Export via the docx library (lazy-loaded) ── */
  const handleDocxExport = useCallback(async () => {
    try {
      // 1. Await the raw modules without destructuring
      const rawDocx = await import("docx");
      const rawFileSaver = await import("file-saver");

      // 2. Safely unwrap them (bypass TS strict mode to handle Webpack quirks)
      const docx: typeof import("docx") = (rawDocx as any).default || rawDocx;
      const saveAs =
        (rawFileSaver as any).saveAs ||
        ((rawFileSaver as any).default &&
          (rawFileSaver as any).default.saveAs) ||
        (rawFileSaver as any).default;

      if (!saveAs) {
        throw new Error("Could not load file-saver properly");
      }

      // 3. Generate the document
      const paragraphs = markdownToDocxParagraphs(docx, content, styling);

      const doc = new docx.Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      // 4. Pack and save
      const blob = await docx.Packer.toBlob(doc);
      saveAs(blob, `${resolvedFilename}.docx`);
      toast.success("Word document downloaded!");
    } catch (error) {
      console.error("Failed to generate DOCX:", error);
      toast.error("Failed to download Word document. Please try again.");
    }
  }, [content, resolvedFilename, styling]);

  if (!content) return null;

  return (
    <div className="space-y-3 mt-4">
      {/* Editable filename input */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
        <Label
          htmlFor="export-filename"
          className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1"
        >
          <Pencil className="h-3 w-3" />
          File Name
        </Label>
        <Input
          id="export-filename"
          type="text"
          value={exportFileName}
          onChange={(e) => setExportFileName(e.target.value)}
          placeholder={dynamicFilename}
          className="h-8 text-sm flex-1 max-w-full sm:max-w-xs"
        />
      </div>

      {/* Export buttons */}
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePdfExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDocxExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Word
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExcelExport}
          className="gap-2"
          title={
            hasTable ? "Export table data to Excel" : "Export text to Excel"
          }
        >
          <FileSpreadsheet className="h-4 w-4" />
          Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEmailModalOpen(true)}
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>
        {isSignedIn && tool && (
          <Button
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const res = await fetch("/api/documents", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: resolvedFilename,
                    content,
                    tool,
                    docType,
                  }),
                });
                if (!res.ok) {
                  const data = await res.json();
                  toast.error(data.error || "Failed to save document.");
                  return;
                }
                toast.success("Document saved!");
              } catch {
                toast.error("Failed to save document.");
              } finally {
                setSaving(false);
              }
            }}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
        )}
      </div>

      <EmailDocumentModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        content={content}
        defaultSubject={resolvedFilename}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers: markdown → DOCX nodes                                     */
/* ------------------------------------------------------------------ */

/**  Convert markdown to docx Paragraph/Table nodes with styling support */
function markdownToDocxParagraphs(
  docx: DocxModule,
  md: string,
  styling?: DocumentStyling,
): (
  | InstanceType<DocxModule["Paragraph"]>
  | InstanceType<DocxModule["Table"]>
)[] {
  const {
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
  } = docx;
  const lines = md.split("\n");
  const paragraphs: (
    | InstanceType<typeof Paragraph>
    | InstanceType<typeof Table>
  )[] = [];

  // Convert pt to half-points (docx uses half-points for font size)
  const h1Size = (styling?.h1SizePt || 24) * 2;
  const h2Size = (styling?.h2h3SizePt || 18) * 2;
  const h3Size = (styling?.h2h3SizePt || 18) * 2;
  const bodySize = (styling?.bodyTextSizePt || 12) * 2;
  const fontFamily = styling?.fontFamily || "Arial";
  const lineSpacing = getDocxLineSpacing(styling?.lineSpacing || "1.5");
  const bulletChar = styling
    ? BULLET_SYMBOLS[styling.bulletStyle] || ""
    : "\u2022";

  // Track if we're inside a table
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      const columnCount = tableHeaders.length;
      const cellWidth = Math.floor(9000 / columnCount);

      const borderConfig = {
        top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      };

      // Header row
      const headerRow = new TableRow({
        tableHeader: true,
        children: tableHeaders.map(
          (h) =>
            new TableCell({
              borders: borderConfig,
              width: { size: cellWidth, type: WidthType.DXA },
              shading: { fill: "E8E8E8" },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: h,
                      bold: true,
                      font: fontFamily,
                      size: bodySize,
                    }),
                  ],
                  spacing: lineSpacing,
                }),
              ],
            }),
        ),
      });

      // Body rows
      const bodyDocxRows = tableRows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell, idx) =>
                new TableCell({
                  borders: borderConfig,
                  width: {
                    size: idx < columnCount ? cellWidth : cellWidth,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: parseInlineFormatting(
                        TextRun,
                        cell,
                        fontFamily,
                        bodySize,
                      ),
                      spacing: lineSpacing,
                    }),
                  ],
                }),
            ),
          }),
      );

      paragraphs.push(
        new Table({
          rows: [headerRow, ...bodyDocxRows],
          width: { size: 9000, type: WidthType.DXA },
        }),
      );
    }
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Detect table rows
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      // Skip separator rows (|---|---|)
      if (cells.every((c) => /^[-:\s]+$/.test(c))) {
        inTable = true;
        continue;
      }
      if (!inTable && tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        inTable = true;
        tableRows.push(cells);
      }
      continue;
    } else if (inTable || tableHeaders.length > 0) {
      flushTable();
    }

    if (!trimmed) continue;

    // Headings
    const h1 = trimmed.match(/^# (.+)/);
    if (h1) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: h1[1],
              bold: true,
              size: h1Size,
              font: fontFamily,
            }),
          ],
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    const h2 = trimmed.match(/^## (.+)/);
    if (h2) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: h2[1],
              bold: true,
              size: h2Size,
              font: fontFamily,
            }),
          ],
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    const h3 = trimmed.match(/^### (.+)/);
    if (h3) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [
            new TextRun({
              text: h3[1],
              bold: true,
              size: h3Size,
              font: fontFamily,
            }),
          ],
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    // Bullet points — inject bullet character explicitly
    const bullet = trimmed.match(/^[-*] (.+)/);
    if (bullet) {
      const bulletText = bulletChar ? `${bulletChar} ${bullet[1]}` : bullet[1];
      paragraphs.push(
        new Paragraph({
          children: parseInlineFormatting(
            TextRun,
            bulletText,
            fontFamily,
            bodySize,
          ),
          indent: { left: 360 },
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    // Numbered list
    const numbered = trimmed.match(/^(\d+)\. (.+)/);
    if (numbered) {
      const numText = `${numbered[1]}. ${numbered[2]}`;
      paragraphs.push(
        new Paragraph({
          children: parseInlineFormatting(
            TextRun,
            numText,
            fontFamily,
            bodySize,
          ),
          indent: { left: 360 },
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    // Regular paragraph
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: parseInlineFormatting(TextRun, trimmed, fontFamily, bodySize),
        spacing: { ...lineSpacing, after: 240 },
      }),
    );
  }

  // Flush any remaining table
  if (inTable || tableHeaders.length > 0) flushTable();

  return paragraphs;
}

/** Parse **bold** and *italic* inline formatting into TextRun nodes */
function parseInlineFormatting(
  TextRun: DocxModule["TextRun"],
  text: string,
  fontFamily?: string,
  fontSize?: number,
): InstanceType<DocxModule["TextRun"]>[] {
  const runs: InstanceType<typeof TextRun>[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold + italic
      runs.push(
        new TextRun({
          text: match[2],
          bold: true,
          italics: true,
          font: fontFamily,
          size: fontSize,
        }),
      );
    } else if (match[3]) {
      // Bold
      runs.push(
        new TextRun({
          text: match[3],
          bold: true,
          font: fontFamily,
          size: fontSize,
        }),
      );
    } else if (match[4]) {
      // Italic
      runs.push(
        new TextRun({
          text: match[4],
          italics: true,
          font: fontFamily,
          size: fontSize,
        }),
      );
    } else if (match[5]) {
      // Plain text
      runs.push(
        new TextRun({
          text: match[5],
          font: fontFamily,
          size: fontSize,
        }),
      );
    }
  }

  return runs.length
    ? runs
    : [new TextRun({ text, font: fontFamily, size: fontSize })];
}

/** Convert line spacing string to docx spacing format */
function getDocxLineSpacing(lineSpacing: string) {
  const lineRules: Record<string, { line: number; lineRule: any }> = {
    "1.0": { line: 240, lineRule: "auto" },
    "1.15": { line: 276, lineRule: "auto" },
    "1.5": { line: 360, lineRule: "auto" },
    "2.0": { line: 480, lineRule: "auto" },
  };

  const rule = lineRules[lineSpacing] || lineRules["1.5"];
  return { line: rule.line, lineRule: rule.lineRule };
}
