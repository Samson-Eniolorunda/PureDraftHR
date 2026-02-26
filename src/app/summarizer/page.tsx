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
import { DocumentStylingUI } from "@/components/document-styling-ui";
import {
  LanguageSelector,
  type LanguageValue,
} from "@/components/language-selector";
import { Modal } from "@/components/ui/modal";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
import { useDocumentStyling } from "@/hooks/useDocumentStyling";
import { Loader2, Wand2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  /summarizer — AI-powered HR document summarizer                    */
/*                                                                     */
/*  UI: Dual-input (upload or paste) → Submit → Styling Modal →        */
/*      Confirm & Generate → Streaming markdown                        */
/*  Export: PDF + DOCX download + Copy to clipboard                    */
/* ------------------------------------------------------------------ */
export default function SummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [isConsented, setIsConsented] = useState(false);
  const [language, setLanguage] = useState<LanguageValue>("English");
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
  const [showStylingModal, setShowStylingModal] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/chat",
    body: {
      tool: "summarizer",
      referenceText: referenceText || undefined,
      language: language !== "English" ? language : undefined,
    },
  });

  // Extract the latest assistant message (the streamed summary)
  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const resultContent = assistantMessage?.content ?? "";
  const displayLoading = isLoading || showSkeletonPreview;

  /** Open the styling modal before generating */
  const handleSummarizeClick = useCallback(() => {
    if (!inputText.trim() || isLoading || !isConsented) return;
    setShowStylingModal(true);
  }, [inputText, isLoading, isConsented]);

  /** Confirm styling and trigger the AI stream */
  const handleConfirmGenerate = useCallback(() => {
    setShowStylingModal(false);

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
  }, [inputText, append, setMessages]);

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

      {/* ── Form & Results ── */}
      <div className="space-y-6 max-w-3xl">
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

            {/* Language selector */}
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={isLoading}
            />

            {/* Consent & Reference Template Footer */}
            <DocumentFormFooter
              isLoading={isLoading}
              isConsented={isConsented}
              onConsentChange={setIsConsented}
              onReferenceTextChange={setReferenceText}
              onSubmit={handleSummarizeClick}
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
                {displayLoading ? (
                  <ResultSkeleton />
                ) : (
                  <>
                    <MarkdownRenderer
                      content={resultContent}
                      styling={styling}
                    />
                    <ExportButtons
                      content={resultContent}
                      filename="hr-summary"
                      styling={styling}
                    />
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
