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

/* ------------------------------------------------------------------ */
/*  ExportButtons — PDF (html2pdf.js) & DOCX (docx) client-side export */
/* ------------------------------------------------------------------ */
interface ExportButtonsProps {
  /** The raw markdown/text content to export */
  content: string;
  /** Filename without extension */
  filename?: string;
}

export function ExportButtons({
  content,
  filename = "hr-document",
}: ExportButtonsProps) {
  /* ── PDF Export via html2pdf.js (lazy loaded) ── */
  const handlePdfExport = useCallback(async () => {
    // Dynamic import — html2pdf.js is client-only
    const html2pdf = (await import("html2pdf.js")).default;

    // Create a styled container for the PDF
    const container = document.createElement("div");
    container.style.padding = "24px";
    container.style.fontFamily = "Arial, Helvetica, sans-serif";
    container.style.fontSize = "12px";
    container.style.lineHeight = "1.6";
    container.style.color = "#1a1a1a";

    // Convert markdown to basic HTML for PDF rendering
    container.innerHTML = markdownToHtml(content);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(container).save();
  }, [content, filename]);

  /* ── DOCX Export via the docx library ── */
  const handleDocxExport = useCallback(async () => {
    const paragraphs = markdownToDocxParagraphs(content);

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
  }, [content, filename]);

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
function markdownToHtml(md: string): string {
  return (
    md
      // Headings
      .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // Bold & italic
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Unordered lists
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      // Numbered lists
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      // Line breaks → paragraphs
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br/>")
      // Wrap
      .replace(/^/, "<p>")
      .replace(/$/, "</p>")
      // Clean up list items
      .replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>")
      .replace(/<\/ul>\s*<ul>/g, "")
  );
}

/** Convert markdown to docx Paragraph nodes */
function markdownToDocxParagraphs(md: string): Paragraph[] {
  const lines = md.split("\n");
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Headings
    const h1 = trimmed.match(/^# (.+)/);
    if (h1) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: h1[1], bold: true, size: 32 })],
        }),
      );
      continue;
    }

    const h2 = trimmed.match(/^## (.+)/);
    if (h2) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: h2[1], bold: true, size: 28 })],
        }),
      );
      continue;
    }

    const h3 = trimmed.match(/^### (.+)/);
    if (h3) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: h3[1], bold: true, size: 24 })],
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
          children: parseInlineFormatting(bullet[1]),
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
          children: parseInlineFormatting(numbered[1]),
        }),
      );
      continue;
    }

    // Regular paragraph
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: parseInlineFormatting(trimmed),
        spacing: { after: 120 },
      }),
    );
  }

  return paragraphs;
}

/** Parse **bold** and *italic* inline formatting into TextRun nodes */
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold + italic
      runs.push(new TextRun({ text: match[2], bold: true, italics: true }));
    } else if (match[3]) {
      // Bold
      runs.push(new TextRun({ text: match[3], bold: true }));
    } else if (match[4]) {
      // Italic
      runs.push(new TextRun({ text: match[4], italics: true }));
    } else if (match[5]) {
      // Plain text
      runs.push(new TextRun({ text: match[5] }));
    }
  }

  return runs.length ? runs : [new TextRun({ text })];
}
