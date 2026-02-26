"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";
import type { DocumentStyling } from "@/hooks/useDocumentStyling";

/* ------------------------------------------------------------------ */
/*  Bullet symbol mapping (shared across PDF and DOCX)                 */
/* ------------------------------------------------------------------ */
const BULLET_SYMBOLS: Record<string, string> = {
  none: "",
  dot: "\u2022",
  circle: "\u25CB",
  square: "\u25A0",
  diamond: "\u2756",
  arrow: "\u27A4",
  checkmark: "\u2713",
};

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
}

export function ExportButtons({
  content,
  filename = "HR_Document",
  styling,
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  const dynamicFilename = extractFilename(content, filename);

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
      filename: `${dynamicFilename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(container).save();
  }, [content, dynamicFilename, styling]);

  /* ── DOCX Export via the docx library ── */
  const handleDocxExport = useCallback(async () => {
    const paragraphs = markdownToDocxParagraphs(content, styling);

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${dynamicFilename}.docx`);
  }, [content, dynamicFilename, styling]);

  if (!content) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mt-4 sm:flex sm:flex-wrap">
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers: lightweight markdown → HTML and markdown → DOCX nodes     */
/* ------------------------------------------------------------------ */

/** Simple markdown to HTML converter for PDF — injects bullet characters directly */
function markdownToHtml(md: string, styling?: DocumentStyling): string {
  const bodySize = styling?.bodyTextSizePt || 12;
  const h1Size = styling?.h1SizePt || 24;
  const h2h3Size = styling?.h2h3SizePt || 18;
  const fontFamily = styling?.fontFamily || "Arial, sans-serif";
  const lineSpacing = styling?.lineSpacing || "1.6";
  const bulletChar = styling
    ? BULLET_SYMBOLS[styling.bulletStyle] || ""
    : "\u2022";

  // Build bullet prefix for <li> items
  const bulletPrefix = bulletChar ? `${bulletChar} ` : "";

  return (
    md
      // Headings with styling
      .replace(
        /^#### (.+)$/gm,
        `<h4 style="font-family: ${fontFamily}; font-size: ${h2h3Size * 0.9}pt; line-height: ${lineSpacing};">$1</h4>`,
      )
      .replace(
        /^### (.+)$/gm,
        `<h3 style="font-family: ${fontFamily}; font-size: ${h2h3Size}pt; line-height: ${lineSpacing};">$1</h3>`,
      )
      .replace(
        /^## (.+)$/gm,
        `<h2 style="font-family: ${fontFamily}; font-size: ${h2h3Size}pt; line-height: ${lineSpacing};">$1</h2>`,
      )
      .replace(
        /^# (.+)$/gm,
        `<h1 style="font-family: ${fontFamily}; font-size: ${h1Size}pt; line-height: ${lineSpacing};">$1</h1>`,
      )
      // Bold & italic
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Tables: convert markdown tables to HTML tables
      .replace(
        /^(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)*)/gm,
        (_match, headerRow, _separator, bodyRows) => {
          const headers = (headerRow as string)
            .split("|")
            .filter((c: string) => c.trim());
          const rows = (bodyRows as string)
            .trim()
            .split("\n")
            .map((r: string) => r.split("|").filter((c: string) => c.trim()));

          let table = `<table style="font-family: ${fontFamily}; font-size: ${bodySize}pt; border-collapse: collapse; width: 100%; margin-bottom: 1em;">`;
          table += "<thead><tr>";
          headers.forEach((h: string) => {
            table += `<th style="border: 1px solid #ccc; padding: 6px 8px; background: #f5f5f5; font-weight: bold; text-align: left;">${h.trim()}</th>`;
          });
          table += "</tr></thead><tbody>";
          rows.forEach((row: string[]) => {
            table += "<tr>";
            row.forEach((cell: string) => {
              table += `<td style="border: 1px solid #ccc; padding: 6px 8px;">${cell.trim()}</td>`;
            });
            table += "</tr>";
          });
          table += "</tbody></table>";
          return table;
        },
      )
      // Unordered lists — inject bullet character directly into text
      .replace(
        /^- (.+)$/gm,
        `<li style="list-style: none; font-family: ${fontFamily}; font-size: ${bodySize}pt; line-height: ${lineSpacing}; margin-bottom: 4px;">${bulletPrefix}$1</li>`,
      )
      // Numbered lists
      .replace(
        /^\d+\. (.+)$/gm,
        `<li style="font-family: ${fontFamily}; font-size: ${bodySize}pt; line-height: ${lineSpacing}; margin-bottom: 4px;">$1</li>`,
      )
      // Line breaks to paragraphs
      .replace(
        /\n{2,}/g,
        `</p><p style="font-family: ${fontFamily}; font-size: ${bodySize}pt; line-height: ${lineSpacing};">`,
      )
      .replace(/\n/g, "<br/>")
      // Wrap
      .replace(
        /^/,
        `<p style="font-family: ${fontFamily}; font-size: ${bodySize}pt; line-height: ${lineSpacing};">`,
      )
      .replace(/$/, "</p>")
      // Clean up list items
      .replace(
        /(<li[^>]*>.*<\/li>)/g,
        "<ul style='list-style: none; padding-left: 1.5em;'>$1</ul>",
      )
      .replace(/<\/ul>\s*<ul[^>]*>/g, "")
  );
}

/**  Convert markdown to docx Paragraph nodes with styling support */
function markdownToDocxParagraphs(
  md: string,
  styling?: DocumentStyling,
): Paragraph[] {
  const lines = md.split("\n");
  const paragraphs: Paragraph[] = [];

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
      // Header row
      const headerCells = tableHeaders.map(
        (h) =>
          new TextRun({
            text: h,
            bold: true,
            font: fontFamily,
            size: bodySize,
          }),
      );
      paragraphs.push(
        new Paragraph({
          children: headerCells.flatMap((cell, i) =>
            i < headerCells.length - 1
              ? [
                  cell,
                  new TextRun({
                    text: "  |  ",
                    font: fontFamily,
                    size: bodySize,
                  }),
                ]
              : [cell],
          ),
          spacing: lineSpacing,
        }),
      );
      // Body rows
      for (const row of tableRows) {
        const cells = row.map(
          (c) => new TextRun({ text: c, font: fontFamily, size: bodySize }),
        );
        paragraphs.push(
          new Paragraph({
            children: cells.flatMap((cell, i) =>
              i < cells.length - 1
                ? [
                    cell,
                    new TextRun({
                      text: "  |  ",
                      font: fontFamily,
                      size: bodySize,
                    }),
                  ]
                : [cell],
            ),
            spacing: lineSpacing,
          }),
        );
      }
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
          children: parseInlineFormatting(bulletText, fontFamily, bodySize),
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
          children: parseInlineFormatting(numText, fontFamily, bodySize),
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
        children: parseInlineFormatting(trimmed, fontFamily, bodySize),
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
  text: string,
  fontFamily?: string,
  fontSize?: number,
): TextRun[] {
  const runs: TextRun[] = [];
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
