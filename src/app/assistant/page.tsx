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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { DocumentStylingUI } from "@/components/document-styling-ui";
import {
  LanguageSelector,
  type LanguageValue,
} from "@/components/language-selector";
import { Modal } from "@/components/ui/modal";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
import { useDocumentStyling } from "@/hooks/useDocumentStyling";
import {
  MeetingCard,
  parseMeetingFromResponse,
} from "@/components/meeting-card";
import {
  Loader2,
  Wand2,
  MessageCircle,
  Send,
  Upload,
  CheckCircle,
  X,
  FileText,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  /assistant — Freeform HR Copilot                                   */
/*                                                                     */
/*  Ask HR questions, draft emails, or chat with uploaded documents     */
/* ------------------------------------------------------------------ */
export default function AssistantPage() {
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

  const [userPrompt, setUserPrompt] = useState("");
  const [language, setLanguage] = useState<LanguageValue>("English");
  const [showStylingModal, setShowStylingModal] = useState(false);
  const [referenceText, setReferenceText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/chat",
    body: {
      tool: "assistant",
      referenceText: referenceText || undefined,
      language: language !== "English" ? language : undefined,
    },
  });

  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const latestResponse =
    assistantMessages[assistantMessages.length - 1]?.content ?? "";
  const displayLoading = isLoading || showSkeletonPreview;

  // Detect structured meeting JSON in the response
  const meetingData = latestResponse
    ? parseMeetingFromResponse(latestResponse)
    : null;

  /** Upload a document to chat with */
  const handleDocumentUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessingFile(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to extract text");

        const { text } = await response.json();
        setUploadedFileName(file.name);
        setReferenceText(text);
      } catch (error) {
        console.error("Document upload error:", error);
        alert("Failed to process document");
      } finally {
        setIsProcessingFile(false);
      }
    },
    [],
  );

  const handleRemoveDocument = useCallback(() => {
    setUploadedFileName(null);
    setReferenceText("");
  }, []);

  /** Open styling modal before sending */
  const handleSendClick = useCallback(() => {
    if (!userPrompt.trim() || isLoading) return;
    setShowStylingModal(true);
  }, [userPrompt, isLoading]);

  /** Quick send without styling modal */
  const handleQuickSend = useCallback(() => {
    if (!userPrompt.trim() || isLoading) return;

    setMessages([]);
    append({
      role: "user",
      content: userPrompt,
    });

    setUserPrompt("");

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [userPrompt, isLoading, append, setMessages]);

  /** Confirm styling and send */
  const handleConfirmSend = useCallback(() => {
    setShowStylingModal(false);

    setMessages([]);
    append({
      role: "user",
      content: userPrompt,
    });

    setUserPrompt("");

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [userPrompt, append, setMessages]);

  /** Handle Enter key (Shift+Enter for newline) */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleQuickSend();
      }
    },
    [handleQuickSend],
  );

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            HR Assistant
          </h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Ask HR questions, draft workplace emails, or chat with an uploaded
          document. Your personal HR copilot.
        </p>
      </div>

      {/* ── Chat Interface ── */}
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How can I help you?</CardTitle>
            <CardDescription>
              Ask a question or request a draft. Press Enter to send, or use the
              styling button for formatted output.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document Upload for "Chat with Document" */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Chat with a Document (Optional)
              </Label>
              <p className="text-xs text-muted-foreground">
                Upload a PDF, DOCX, or TXT file to ask questions about its
                content.
              </p>

              {uploadedFileName ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400 truncate flex-1">
                    {uploadedFileName} loaded
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={handleRemoveDocument}
                    title="Remove document"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    title="Upload a document to chat with"
                    onChange={handleDocumentUpload}
                    disabled={isProcessingFile || isLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isProcessingFile || isLoading}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isProcessingFile
                      ? "Processing..."
                      : "Upload Document (PDF, DOCX, TXT)"}
                  </Button>
                </div>
              )}
            </div>

            {/* Language selector */}
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={isLoading}
            />

            {/* Main prompt textarea */}
            <div className="space-y-2">
              <Label htmlFor="assistant-prompt">Your Message</Label>
              <Textarea
                ref={textareaRef}
                id="assistant-prompt"
                rows={4}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  uploadedFileName
                    ? `Ask a question about "${uploadedFileName}" (e.g., "What is the bereavement policy?")...`
                    : 'Ask an HR question or request a draft (e.g., "Write a sick leave email to my boss for tomorrow")...'
                }
                disabled={isLoading}
                className="resize-y min-h-[100px]"
                onFocus={(e) =>
                  setTimeout(
                    () =>
                      (e.target as HTMLElement).scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      }),
                    300,
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Press Enter to send quickly, or use the styled button below for
                formatted output.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleQuickSend}
                disabled={!userPrompt.trim() || isLoading}
                className="flex-1 gap-2"
              >
                <Send className="h-4 w-4" />
                {isLoading ? "Thinking..." : "Send"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSendClick}
                disabled={!userPrompt.trim() || isLoading}
                className="gap-2"
                title="Apply document styling before generating"
              >
                <Wand2 className="h-4 w-4" />
                Styled
              </Button>
            </div>

            {/* AI Disclaimer */}
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50">
              <p>
                Note: Gemini AI is used to generate responses. Always review the
                output for accuracy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Response Section ── */}
        <div ref={resultRef}>
          {(latestResponse || isLoading) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response</CardTitle>
                {isLoading && (
                  <CardDescription className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    AI is thinking…
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {displayLoading && !latestResponse ? (
                  <ResultSkeleton />
                ) : meetingData ? (
                  <>
                    {/* Meeting detected — render the card instead of raw JSON */}
                    <MeetingCard meeting={meetingData.meeting} />
                    {meetingData.remainingText && (
                      <>
                        <MarkdownRenderer
                          content={meetingData.remainingText}
                          styling={styling}
                        />
                        <ExportButtons
                          content={meetingData.remainingText}
                          filename="hr-assistant"
                          styling={styling}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <MarkdownRenderer
                      content={latestResponse}
                      styling={styling}
                    />
                    <ExportButtons
                      content={latestResponse}
                      filename="hr-assistant"
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
            <Button onClick={handleConfirmSend}>
              <Wand2 className="h-4 w-4 mr-2" />
              Confirm &amp; Send
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
