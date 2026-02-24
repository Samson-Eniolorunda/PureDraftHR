"use client";

import { useState, useCallback, useRef } from "react";
import { useChat } from "ai/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DualInput } from "@/components/dual-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { DocumentFormFooter } from "@/components/document-form-footer";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
import { Loader2, Send } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  /summarizer — AI-powered HR document summarizer                    */
/*                                                                     */
/*  UI: Dual-input (upload or paste) → Submit → Streaming markdown     */
/*  Export: PDF + DOCX download buttons                                */
/* ------------------------------------------------------------------ */
export default function SummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [isConsented, setIsConsented] = useState(false);
  const showSkeletonPreview = useDevSkeletonPreview();
  const resultRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/chat",
    body: { tool: "summarizer", referenceText: referenceText || undefined },
  });

  // Extract the latest assistant message (the streamed summary)
  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const resultContent = assistantMessage?.content ?? "";
  const displayLoading = isLoading || showSkeletonPreview;

  /** Submit the user's text to the AI */
  const handleSubmit = useCallback(() => {
    console.log("Summarizer.handleSubmit", {
      inputLength: inputText.length,
      isConsented,
      isLoading,
    });
    if (!inputText.trim() || isLoading || !isConsented) return;

    // Reset previous conversation and send the new text
    setMessages([]);
    append({
      role: "user",
      content: `Please summarize the following HR document:\n\n${inputText}`,
    });

    // Scroll to result area after a short delay
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [inputText, isLoading, append, setMessages, isConsented]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Document Summarizer
        </h1>
        <p className="mt-1 text-muted-foreground">
          Paste or upload a lengthy HR document and get a clear, human-sounding
          summary in seconds.
        </p>
      </div>

      {/* ── Input Section ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Input</CardTitle>
          <CardDescription>
            Upload a file (.txt, .pdf, .docx) or paste your text directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DualInput
            onTextReady={setInputText}
            disabled={isLoading}
            placeholder="Paste the full text of the HR document you want summarized…"
          />

          {/* Consent & Reference Template Footer */}
          <DocumentFormFooter
            isLoading={isLoading}
            isConsented={isConsented}
            onConsentChange={setIsConsented}
            onReferenceTextChange={setReferenceText}
            onSubmit={handleSubmit}
            submitLabel="Summarize"
          />
        </CardContent>
      </Card>

      {/* ── Result Section ── */}
      <div ref={resultRef}>
        {(resultContent || isLoading) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
              {isLoading && (
                <CardDescription className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  AI is writing…
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ResultSkeleton />
              ) : (
                <>
                  <MarkdownRenderer content={resultContent} />
                  <ExportButtons
                    content={resultContent}
                    filename="hr-summary"
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
