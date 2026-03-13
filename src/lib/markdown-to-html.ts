import type { DocumentStyling } from "@/hooks/useDocumentStyling";

/* ------------------------------------------------------------------ */
/*  Bullet symbol mapping (shared across PDF, DOCX, and email)         */
/* ------------------------------------------------------------------ */
export const BULLET_SYMBOLS: Record<string, string> = {
  none: "",
  dot: "\u2022",
  circle: "\u25CB",
  square: "\u25A0",
  diamond: "\u2756",
  arrow: "\u27A4",
  checkmark: "\u2713",
  number: "1.",
  roman: "I.",
};

/* ------------------------------------------------------------------ */
/*  markdownToHtml — lightweight markdown → styled HTML converter      */
/* ------------------------------------------------------------------ */

/** Convert a number to roman numerals */
function toRoman(num: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I",
  ];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}

/** Convert markdown to styled HTML (used by PDF export and email sending) */
export function markdownToHtml(md: string, styling?: DocumentStyling): string {
  const bodySize = styling?.bodyTextSizePt || 12;
  const h1Size = styling?.h1SizePt || 24;
  const h2h3Size = styling?.h2h3SizePt || 18;
  const fontFamily = styling?.fontFamily || "Arial, sans-serif";
  const lineSpacing = styling?.lineSpacing || "1.6";
  const bulletStyle = styling?.bulletStyle || "dot";
  const bulletChar = BULLET_SYMBOLS[bulletStyle] || "";
  const isNumbered = bulletStyle === "number";
  const isRoman = bulletStyle === "roman";

  // Build bullet prefix for <li> items (only for symbol-based styles)
  const bulletPrefix =
    !isNumbered && !isRoman && bulletChar ? `${bulletChar} ` : "";

  // Counter for numbered/roman bullet styles
  let listItemCounter = 0;

  return (
    md
      // Pre-process: normalize asterisk bullets to dash bullets before inline formatting
      .replace(/^\* /gm, "- ")
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
      // Unordered lists — inject bullet character or numbered prefix directly into text
      .replace(/^- (.+)$/gm, (_match, content) => {
        let prefix = bulletPrefix;
        if (isNumbered) {
          listItemCounter++;
          prefix = `${listItemCounter}. `;
        } else if (isRoman) {
          listItemCounter++;
          prefix = `${toRoman(listItemCounter)}. `;
        }
        return `<li style="list-style: none; font-family: ${fontFamily}; font-size: ${bodySize}pt; line-height: ${lineSpacing}; margin-bottom: 4px;">${prefix}${content}</li>`;
      })
      // Numbered lists (from original markdown)
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
