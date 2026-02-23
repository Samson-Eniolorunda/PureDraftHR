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
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DualInput } from "@/components/dual-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { Loader2, Send } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Template options for the formatter                                 */
/* ------------------------------------------------------------------ */
const TEMPLATES = [
  { value: "incident-report", label: "Incident Report" },
  { value: "interview-notes", label: "Interview Notes" },
  { value: "meeting-minutes", label: "Meeting Minutes" },
  { value: "performance-review", label: "Performance Review" },
  { value: "policy-draft", label: "Policy Draft" },
] as const;

/* ------------------------------------------------------------------ */
/*  /formatter — AI-powered HR document formatter                      */
/*                                                                     */
/*  User picks a template, provides messy text → gets structured doc   */
/* ------------------------------------------------------------------ */
export default function FormatterPage() {
  const [inputText, setInputText] = useState("");
  const [template, setTemplate] = useState<(typeof TEMPLATES)[number]["value"]>(
    TEMPLATES[0].value,
  );
  const resultRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/chat",
    body: { tool: "formatter", template },
  });

  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const resultContent = assistantMessage?.content ?? "";

  const handleSubmit = useCallback(() => {
    if (!inputText.trim() || isLoading) return;

    setMessages([]);
    append({
      role: "user",
      content: `Template: ${template}\n\nRaw text to format:\n\n${inputText}`,
    });

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [inputText, isLoading, append, setMessages, template]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Document Formatter
        </h1>
        <p className="mt-1 text-muted-foreground">
          Turn messy notes into perfectly structured HR documents. Pick a
          template, provide your text, and let AI do the formatting.
        </p>
      </div>

      {/* ── Input Section ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Input</CardTitle>
          <CardDescription>
            Select a template and upload or paste your unstructured text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template selector */}
          <div className="space-y-2">
            <Label htmlFor="template-select">Document Template</Label>
            <Select
              id="template-select"
              value={template}
              onChange={(e) =>
                setTemplate(
                  e.target.value as (typeof TEMPLATES)[number]["value"],
                )
              }
              disabled={isLoading}
            >
              {TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Dual input: upload or paste */}
          <DualInput
            onTextReady={setInputText}
            disabled={isLoading}
            placeholder="Paste the messy/unstructured text you want formatted…"
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
                  Formatting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Format Document
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
              <CardTitle className="text-lg">Formatted Document</CardTitle>
              {isLoading && (
                <CardDescription className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  AI is formatting…
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={resultContent} />
              <ExportButtons
                content={resultContent}
                filename="hr-formatted-document"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
