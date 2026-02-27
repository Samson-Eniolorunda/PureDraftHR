import type { DocumentStyling } from "@/hooks/useDocumentStyling";

/**
 * Sanitize a font family string for safe CSS injection.
 * Wraps multi-word fonts in quotes and strips dangerous chars.
 */
function sanitizeFontFamily(font: string): string {
  // Strip anything that could break a CSS rule
  const clean = font.replace(/[;{}\\<>]/g, "").trim();
  // If it contains spaces / special chars, wrap in quotes
  if (/\s/.test(clean) && !clean.startsWith('"') && !clean.startsWith("'")) {
    return `"${clean}"`;
  }
  return clean;
}

/**
 * Generate CSS for document styling using CSS variables
 * This is used in the markdown renderer to style the output dynamically
 */
export function getDocumentStylesCSS(styling: DocumentStyling): string {
  const bulletSymbols: Record<string, string> = {
    none: "''",
    dot: "'•'",
    circle: "'○'",
    square: "'■'",
    diamond: "'❖'",
    arrow: "'➤'",
    checkmark: "'✓'",
  };

  const bulletContent = bulletSymbols[styling.bulletStyle] || "'•'";
  const safeFont = sanitizeFontFamily(styling.fontFamily);

  return `
    :root {
      --font-family: ${safeFont};
      --h1-size-pt: ${styling.h1SizePt}pt;
      --h2-h3-size-pt: ${styling.h2h3SizePt}pt;
      --body-text-size-pt: ${styling.bodyTextSizePt}pt;
      --line-spacing: ${styling.lineSpacing};
      --bullet-content: ${bulletContent};
    }

    .document-preview {
      font-family: var(--font-family);
      line-height: var(--line-spacing);
    }

    .document-preview h1 {
      font-size: var(--h1-size-pt);
      margin-top: 1em;
      margin-bottom: 0.5em;
    }

    .document-preview h2,
    .document-preview h3 {
      font-size: var(--h2-h3-size-pt);
      margin-top: 0.75em;
      margin-bottom: 0.5em;
    }

    .document-preview p {
      font-size: var(--body-text-size-pt);
      margin-bottom: 1em;
      line-height: var(--line-spacing);
    }

    .document-preview ul,
    .document-preview ol {
      font-size: var(--body-text-size-pt);
      line-height: var(--line-spacing);
      margin-bottom: 1em;
    }

    .document-preview li {
      margin-bottom: 0.5em;
    }

    /* Custom bullet points */
    .document-preview ul li::before {
      content: var(--bullet-content);
      margin-right: 0.5em;
    }

    .document-preview ul {
      list-style: none;
      padding-left: 1.5em;
    }

    .document-preview ol {
      list-style-position: outside;
      padding-left: 1.5em;
    }

    .document-preview table {
      font-size: var(--body-text-size-pt);
      line-height: var(--line-spacing);
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1em;
    }

    .document-preview table td,
    .document-preview table th {
      border: 1px solid #ccc;
      padding: 0.5em;
      text-align: left;
    }

    .document-preview table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }

    .document-preview blockquote {
      border-left: 4px solid #ccc;
      padding-left: 1em;
      margin-left: 0;
      margin-bottom: 1em;
      color: #666;
    }

    .document-preview code {
      background-color: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .document-preview pre {
      background-color: #f5f5f5;
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
      margin-bottom: 1em;
    }

    .document-preview pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
    }

    .document-preview strong {
      font-weight: 700;
    }

    .document-preview em {
      font-style: italic;
    }

    .document-preview a {
      color: #0066cc;
      text-decoration: underline;
    }

    .document-preview a:hover {
      text-decoration: none;
    }

    .document-preview hr {
      border: none;
      border-top: 1px solid #ccc;
      margin: 1.5em 0;
    }
  `;
}

/**
 * Create a style tag and inject CSS into the document
 */
export function injectDocumentStyles(styling: DocumentStyling): void {
  // Remove existing styles
  const existingStyle = document.getElementById("document-styling-injection");
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject new styles
  const style = document.createElement("style");
  style.id = "document-styling-injection";
  style.textContent = getDocumentStylesCSS(styling);
  document.head.appendChild(style);
}
