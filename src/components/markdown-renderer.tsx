"use client";

import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { DocumentStyling } from "@/hooks/useDocumentStyling";
import { getDocumentStylesCSS } from "@/lib/document-styling";

/* ------------------------------------------------------------------ */
/*  MarkdownRenderer — renders AI-streamed markdown with prose styles   */
/* ------------------------------------------------------------------ */
interface MarkdownRendererProps {
  content: string;
  styling?: DocumentStyling;
}

export const MarkdownRenderer = React.memo(function MarkdownRenderer({
  content,
  styling,
}: MarkdownRendererProps) {
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
    <div className="document-preview prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-card p-4 sm:p-6 prose-table:border-collapse prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted prose-th:text-left prose-td:border prose-td:border-border prose-td:p-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          table: ({ children, ...props }) => (
            <table
              className="w-full border-collapse border border-border my-4"
              {...props}
            >
              {children}
            </table>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-muted" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th
              className="border border-border px-3 py-2 text-left font-semibold"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-3 py-2" {...props}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
