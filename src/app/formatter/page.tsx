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
import { Textarea } from "@/components/ui/textarea";
import { DualInput } from "@/components/dual-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { DocumentFormFooter } from "@/components/document-form-footer";
import { DocumentStylingUI } from "@/components/document-styling-ui";
import { useTranslation } from "@/components/i18n-provider";
import { Modal } from "@/components/ui/modal";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
import { useDocumentStyling } from "@/hooks/useDocumentStyling";
import { Loader2, FileText, StopCircle, Send, Wand2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  /formatter — AI-powered HR document formatter                      */
/*                                                                     */
/*  User provides messy text → gets structured doc                     */
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
  const { language, t } = useTranslation();
  const [showStylingModal, setShowStylingModal] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Pick up content routed from other pages (e.g. Format button)
  const [prefillText, setPrefillText] = useState<string | undefined>();
  useEffect(() => {
    const payload = localStorage.getItem("puredraft_formatter_payload");
    if (payload) {
      setPrefillText(payload);
      localStorage.removeItem("puredraft_formatter_payload");
    }
  }, []);

  const { messages, isLoading, append, setMessages, stop } = useChat({
    api: "/api/chat",
    body: {
      tool: "formatter",
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
        setStreamError(t("error.rateLimit"));
      } else {
        setStreamError(msg || t("error.generic"));
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
      content: `Raw text to format:\n\n${inputText}`,
    });

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [inputText, append, setMessages]);

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
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("formatter.title")}
          </h1>
        </div>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto sm:mx-0">
          {t("formatter.subtitle")}
        </p>
      </div>

      {/* ── Form & Results ── */}
      <div className="space-y-6 max-w-3xl">
        {/* ── Input Section ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("formatter.input")}</CardTitle>
            <CardDescription>{t("formatter.inputDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dual input: upload or paste */}
            <DualInput
              onTextReady={setInputText}
              disabled={isLoading}
              placeholder={t("formatter.pastePlaceholder")}
              initialText={prefillText}
            />

            {/* Consent & Reference Template Footer */}
            <DocumentFormFooter
              isLoading={isLoading}
              isConsented={isConsented}
              onConsentChange={setIsConsented}
              onReferenceTextChange={setReferenceText}
              onSubmit={handleFormatClick}
              submitLabel={t("formatter.formatDoc")}
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
                <CardTitle className="text-lg">
                  {t("formatter.formattedDoc")}
                </CardTitle>
                {isLoading && (
                  <CardDescription className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("formatter.aiFormatting")}
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
                        {t("refine.stopGenerating")}
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
                          placeholder={t("refine.placeholder")}
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
        title={t("styling.title")}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowStylingModal(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleConfirmGenerate}>
              <Wand2 className="h-4 w-4 mr-2" />
              {t("styling.confirmGenerate")}
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
