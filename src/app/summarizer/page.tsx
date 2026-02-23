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
import { Loader2, Send } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  /summarizer — AI-powered HR document summarizer                    */
/*                                                                     */
/*  UI: Dual-input (upload or paste) → Submit → Streaming markdown     */
/*  Export: PDF + DOCX download buttons                                */
/* ------------------------------------------------------------------ */
export default function SummarizerPage() {
  const [inputText, setInputText] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  // Vercel AI SDK chat hook — sends to /api/chat with tool="summarizer"
  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/chat",
    body: { tool: "summarizer" },
  });

  // Extract the latest assistant message (the streamed summary)
  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const resultContent = assistantMessage?.content ?? "";

  /** Submit the user's text to the AI */
  const handleSubmit = useCallback(() => {
    if (!inputText.trim() || isLoading) return;

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
  }, [inputText, isLoading, append, setMessages]);

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

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Summarizing…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Summarize
                </>
              )}
            </Button>
          </div>
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
              <MarkdownRenderer content={resultContent} />
              <ExportButtons content={resultContent} filename="hr-summary" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
