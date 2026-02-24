"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
/*  ExportButtons — PDF (html2pdf.js) & DOCX (docx) client-side export */
/* ------------------------------------------------------------------ */
interface ExportButtonsProps {
  /** The raw markdown/text content to export */
  content: string;
  /** Filename without extension */
  filename?: string;
  /** Document styling configuration */
  styling?: DocumentStyling;
}

export function ExportButtons({
  content,
  filename = "hr-document",
  styling,
}: ExportButtonsProps) {
  /* ── PDF Export via html2pdf.js (lazy loaded) ── */
  const handlePdfExport = useCallback(async () => {
    // Dynamic import — html2pdf.js is client-only
    const html2pdf = (await import("html2pdf.js")).default;

    // Create a styled container for the PDF
    const container = document.createElement("div");
    container.style.padding = "24px";
    container.style.fontFamily =
      styling?.fontFamily || "Arial, Helvetica, sans-serif";
    container.style.fontSize = styling ? `${styling.bodyTextSizePt}pt` : "12pt";
    container.style.lineHeight = styling?.lineSpacing || "1.6";
    container.style.color = "#1a1a1a";

    // Convert markdown to basic HTML for PDF rendering
    container.innerHTML = markdownToHtml(content, styling);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(container).save();
  }, [content, filename, styling]);

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
    saveAs(blob, `${filename}.docx`);
  }, [content, filename, styling]);

  if (!content) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mt-4 sm:flex sm:flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePdfExport}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Download as PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDocxExport}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Download as Word
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers: lightweight markdown → HTML and markdown → DOCX nodes     */
/* ------------------------------------------------------------------ */

/** Simple markdown → HTML converter for PDF rendering */
function markdownToHtml(md: string, styling?: DocumentStyling): string {
  const bodySize = styling?.bodyTextSizePt || 12;
  const h1Size = styling?.h1SizePt || 24;
  const h2h3Size = styling?.h2h3SizePt || 14;
  const fontFamily = styling?.fontFamily || "Arial, sans-serif";
  const lineSpacing = styling?.lineSpacing || "1.6";

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
      // Unordered lists
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      // Numbered lists
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      // Line breaks → paragraphs
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
      .replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>")
      .replace(/<\/ul>\s*<ul>/g, "")
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
  const h2Size = (styling?.h2h3SizePt || 14) * 2;
  const h3Size = (styling?.h2h3SizePt || 14) * 2;
  const bodySize = (styling?.bodyTextSizePt || 12) * 2;
  const fontFamily = styling?.fontFamily || "Arial";
  const lineSpacing = getDocxLineSpacing(styling?.lineSpacing || "1.5");

  for (const line of lines) {
    const trimmed = line.trim();
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

    // Bullet points
    const bullet = trimmed.match(/^[-*] (.+)/);
    if (bullet) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseInlineFormatting(bullet[1], fontFamily, bodySize),
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    // Numbered list
    const numbered = trimmed.match(/^\d+\. (.+)/);
    if (numbered) {
      paragraphs.push(
        new Paragraph({
          numbering: { reference: "default-numbering", level: 0 },
          children: parseInlineFormatting(numbered[1], fontFamily, bodySize),
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
