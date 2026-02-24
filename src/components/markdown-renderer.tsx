"use client";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { DocumentStyling } from "@/hooks/useDocumentStyling";
import { getDocumentStylesCSS } from "@/lib/document-styling";

/* ------------------------------------------------------------------ */
/*  MarkdownRenderer — renders AI-streamed markdown with prose styles   */
/* ------------------------------------------------------------------ */
interface MarkdownRendererProps {
  content: string;
  styling?: DocumentStyling;
}

export function MarkdownRenderer({ content, styling }: MarkdownRendererProps) {
  useEffect(() => {
    if (styling) {
      // Inject styling CSS into document head
      const existingStyle = document.getElementById(
        "document-styling-injection",
      );
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = document.createElement("style");
      style.id = "document-styling-injection";
      style.textContent = getDocumentStylesCSS(styling);
      document.head.appendChild(style);

      return () => {
        // Cleanup on unmount
        const injected = document.getElementById("document-styling-injection");
        if (injected) {
          injected.remove();
        }
      };
    }
  }, [styling]);

  if (!content) return null;

  return (
    <div className="document-preview prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-card p-4 sm:p-6">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
