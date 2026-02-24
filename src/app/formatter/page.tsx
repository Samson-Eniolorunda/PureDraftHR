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
import { DocumentFormFooter } from "@/components/document-form-footer";
import { DocumentStylingUI } from "@/components/document-styling-ui";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
import { useDocumentStyling } from "@/hooks/useDocumentStyling";
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
  { value: "daily-report", label: "Daily Report" },
  { value: "employee-handbook", label: "Employee Handbook" },
  { value: "termination-letter", label: "Termination Letter" },
  { value: "training-summary", label: "Training Summary" },
  { value: "disciplinary-notice", label: "Disciplinary Notice" },
] as const;

/* ------------------------------------------------------------------ */
/*  /formatter — AI-powered HR document formatter                      */
/*                                                                     */
/*  User picks a template, provides messy text → gets structured doc   */
/* ------------------------------------------------------------------ */
export default function FormatterPage() {
  const [inputText, setInputText] = useState("");
  const showSkeletonPreview = useDevSkeletonPreview();
  const {
    styling,
    googleFonts,
    webSafeFonts,
    updateFontFamily,
    updateH1Size,
    updateH2H3Size,
    updateBodyTextSize,
    updateLineSpacing,
    updateBulletStyle,
    resetToDefaults,
  } = useDocumentStyling();
  const [referenceText, setReferenceText] = useState("");
  const [isConsented, setIsConsented] = useState(false);
  const [template, setTemplate] = useState<(typeof TEMPLATES)[number]["value"]>(
    TEMPLATES[0].value,
  );
  const resultRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/chat",
    body: {
      tool: "formatter",
      template,
      referenceText: referenceText || undefined,
    },
  });

  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const resultContent = assistantMessage?.content ?? "";
  const displayLoading = isLoading || showSkeletonPreview;

  const handleSubmit = useCallback(() => {
    console.log("Formatter.handleSubmit", {
      template,
      inputLength: inputText.length,
      isConsented,
      isLoading,
    });
    if (!inputText.trim() || isLoading || !isConsented) return;

    setMessages([]);
    append({
      role: "user",
      content: `Template: ${template}\n\nRaw text to format:\n\n${inputText}`,
    });

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [inputText, isLoading, append, setMessages, template, isConsented]);

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

      {/* ── Main Layout: Form + Styling Sidebar ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* ── Left: Input & Results ── */}
        <div className="space-y-6">
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

              {/* Consent & Reference Template Footer */}
              <DocumentFormFooter
                isLoading={isLoading}
                isConsented={isConsented}
                onConsentChange={setIsConsented}
                onReferenceTextChange={setReferenceText}
                onSubmit={handleSubmit}
                submitLabel="Format Document"
              />
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
                  {displayLoading ? (
                    <ResultSkeleton />
                  ) : (
                    <>
                      <MarkdownRenderer content={resultContent} styling={styling} />
                      <ExportButtons
                        content={resultContent}
                        filename="hr-formatted-document"
                        styling={styling}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ── Right: Styling Sidebar (sticky on lg screens) ── */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          <DocumentStylingUI
            styling={styling}
            googleFonts={googleFonts}
            webSafeFonts={webSafeFonts}
            onFontFamilyChange={updateFontFamily}
            onH1SizeChange={updateH1Size}
            onH2H3SizeChange={updateH2H3Size}
            onBodyTextSizeChange={updateBodyTextSize}
            onLineSpacingChange={updateLineSpacing}
            onBulletStyleChange={updateBulletStyle}
            onResetDefaults={resetToDefaults}
          />
        </div>
      </div>
    </div>
  );
}
