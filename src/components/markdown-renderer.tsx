"use client";

import ReactMarkdown from "react-markdown";

/* ------------------------------------------------------------------ */
/*  MarkdownRenderer — renders AI-streamed markdown with prose styles   */
/* ------------------------------------------------------------------ */
interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-card p-4 sm:p-6">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
