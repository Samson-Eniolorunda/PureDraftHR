"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DualInput } from "@/components/dual-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { DocumentFormFooter } from "@/components/document-form-footer";
import { DocumentStylingUI } from "@/components/document-styling-ui";
import { type LanguageValue } from "@/components/language-selector";
import { Modal } from "@/components/ui/modal";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
import { useDocumentStyling } from "@/hooks/useDocumentStyling";
import { Loader2, Wand2, StopCircle, Send } from "lucide-react";

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
  { value: "other-custom", label: "Other (Custom)" },
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
  const [template, setTemplate] = useState<string>(TEMPLATES[0].value);
  const [customTemplate, setCustomTemplate] = useState("");
  const [language, setLanguage] = useState<LanguageValue>("English");
  const [showStylingModal, setShowStylingModal] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Sync language from sidebar via custom event + localStorage
  useEffect(() => {
    const saved = localStorage.getItem("puredraft_language");
    if (saved) setLanguage(saved as LanguageValue);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as LanguageValue;
      if (detail) setLanguage(detail);
    };
    window.addEventListener("puredraft-language-change", handler);
    return () => window.removeEventListener("puredraft-language-change", handler);
  }, []);

  /** Resolved template — custom string or dropdown value */
  const resolvedTemplate =
    template === "other-custom" && customTemplate.trim()
      ? customTemplate.trim()
      : template;

  const { messages, isLoading, append, setMessages, stop } = useChat({
    api: "/api/chat",
    body: {
      tool: "formatter",
      template: resolvedTemplate,
      referenceText: referenceText || undefined,
      language: language !== "English" ? language : undefined,
    },
    onError(err) {
      console.error("[Formatter] Stream error:", err);
      const msg = err.message || "";
      if (
        msg.includes("429") ||
        msg.includes("rate") ||
        msg.includes("slow down")
      ) {
        setStreamError(
          "Our AI is currently processing a high volume of documents. Please wait just a few seconds and try again! \u23f3",
        );
      } else {
        setStreamError(
          msg || "An error occurred. The document may be too large.",
        );
      }
    },
  });

  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const resultContent = assistantMessage?.content ?? "";
  const displayLoading = (isLoading || showSkeletonPreview) && !resultContent;

  /** Open the styling modal before generating */
  const handleFormatClick = useCallback(() => {
    if (!inputText.trim() || isLoading || !isConsented) return;
    setShowStylingModal(true);
  }, [inputText, isLoading, isConsented]);

  /** Confirm styling and trigger the AI stream */
  const handleConfirmGenerate = useCallback(() => {
    setShowStylingModal(false);

    setMessages([]);
    append({
      role: "user",
      content: `Template: ${resolvedTemplate}\n\nRaw text to format:\n\n${inputText}`,
    });

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [inputText, append, setMessages, resolvedTemplate]);

  /** Send a refinement follow-up */
  const handleRefine = useCallback(() => {
    if (!refineText.trim() || isLoading) return;
    append({
      role: "user",
      content: refineText.trim(),
    });
    setRefineText("");
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [refineText, isLoading, append]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="text-center sm:text-left">
        <div className="flex items-center gap-2.5 justify-center sm:justify-start">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Document Formatter
          </h1>
        </div>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto sm:mx-0">
          Turn messy notes into perfectly structured HR documents. Pick a
          template, provide your text, and let AI do the formatting.
        </p>
      </div>

      {/* ── Form & Results ── */}
      <div className="space-y-6 max-w-3xl">
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
                onChange={(e) => {
                  setTemplate(e.target.value);
                  if (e.target.value !== "other-custom") setCustomTemplate("");
                }}
                disabled={isLoading}
              >
                {TEMPLATES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Custom template input */}
            {template === "other-custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-template">Custom Template Title</Label>
                <Input
                  id="custom-template"
                  type="text"
                  value={customTemplate}
                  onChange={(e) => setCustomTemplate(e.target.value)}
                  placeholder="Enter custom document template name (e.g., Weekly Status Report)..."
                  className="text-sm"
                />
              </div>
            )}

            {/* Language selector removed — controlled globally from sidebar */}

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
              onSubmit={handleFormatClick}
              submitLabel="Format Document"
            />
          </CardContent>
        </Card>

        {/* ── Result Section ── */}
        <div ref={resultRef}>
          {/* Error banner */}
          {streamError && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {streamError}
              </p>
              <button
                onClick={() => setStreamError(null)}
                aria-label="Dismiss error"
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300 ml-2"
              >
                &times;
              </button>
            </div>
          )}
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
                    <MarkdownRenderer
                      content={resultContent}
                      styling={styling}
                    />
                    {isLoading && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3 gap-2"
                        onClick={() => stop()}
                      >
                        <StopCircle className="h-4 w-4" />
                        Stop Generating
                      </Button>
                    )}
                    <ExportButtons
                      content={resultContent}
                      filename="hr-formatted-document"
                      styling={styling}
                      tool="formatter"
                    />

                    {/* Refine Document — chat-style input */}
                    {!isLoading && resultContent && (
                      <div className="mt-4 relative">
                        <Textarea
                          rows={1}
                          value={refineText}
                          onChange={(e) => setRefineText(e.target.value)}
                          placeholder="Ask to refine this document…"
                          className="resize-none min-h-[42px] max-h-[120px] pr-11 rounded-xl text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleRefine();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={!refineText.trim()}
                          onClick={handleRefine}
                          className="absolute right-1.5 bottom-1.5 h-7 w-7 rounded-lg"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Document Styling Modal ── */}
      <Modal
        open={showStylingModal}
        onClose={() => setShowStylingModal(false)}
        title="Document Styling"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowStylingModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmGenerate}>
              <Wand2 className="h-4 w-4 mr-2" />
              Confirm &amp; Generate
            </Button>
          </>
        }
      >
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
      </Modal>
    </div>
  );
}
