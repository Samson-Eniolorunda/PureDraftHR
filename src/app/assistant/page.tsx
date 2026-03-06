"use client";

import { useState, useCallback, useRef } from "react";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
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
import {
  LanguageSelector,
  type LanguageValue,
} from "@/components/language-selector";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
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
  StopCircle,
  Paintbrush,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* /assistant — Freeform HR Copilot                                  */
/* ------------------------------------------------------------------ */
export default function AssistantPage() {
  const router = useRouter();
  const showSkeletonPreview = useDevSkeletonPreview();

  const [userPrompt, setUserPrompt] = useState("");
  const [language, setLanguage] = useState<LanguageValue>("English");
  const [refineText, setRefineText] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [referenceText, setReferenceText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, append, setMessages, stop } = useChat({
    api: "/api/chat",
    body: {
      tool: "assistant",
      referenceText: referenceText || undefined,
      language: language !== "English" ? language : undefined,
    },
    onError(err) {
      console.error("[Assistant] Stream error:", err);
      const msg = err.message || "";
      if (
        msg.includes("429") ||
        msg.includes("rate") ||
        msg.includes("slow down")
      ) {
        setStreamError(
          "Our AI is currently processing a high volume of documents. Please wait just a few seconds and try again! ⏳",
        );
      } else {
        setStreamError(
          msg || "An error occurred. The document may be too large.",
        );
      }
    },
  });

  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const latestResponse =
    assistantMessages[assistantMessages.length - 1]?.content ?? "";
  const displayLoading = isLoading || showSkeletonPreview;

  const meetingData = latestResponse
    ? parseMeetingFromResponse(latestResponse)
    : null;

  const handleDocumentUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessingFile(true);
      try {
        let text: string;
        const name = file.name.toLowerCase();
        const isSpreadsheet =
          name.endsWith(".csv") ||
          name.endsWith(".xlsx") ||
          name.endsWith(".xls") ||
          file.type === "text/csv" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/vnd.ms-excel";

        if (isSpreadsheet) {
          const XLSX = await import("xlsx");
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          if (!firstSheet) throw new Error("Spreadsheet has no sheets");
          text = XLSX.utils.sheet_to_csv(firstSheet);
        } else {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/extract", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Failed to extract text");
          const data = await response.json();
          text = data.text ?? "";
        }

        setUploadedFileName(file.name);
        setReferenceText(text);
      } catch (error) {
        console.error("Document upload error:", error);
        setStreamError(
          "Failed to process document. Please try a different file.",
        );
      } finally {
        setIsProcessingFile(false);
      }
    },
    [],
  );

  const handleRemoveDocument = useCallback(() => {
    setUploadedFileName(null);
    setReferenceText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSend = useCallback(() => {
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

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

  // Push to Formatter Action
  const handleRouteToFormatter = (text: string) => {
    localStorage.setItem("puredraft_formatter_payload", text);
    router.push("/formatter"); // Navigates to your formatter page
  };

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
          document.
        </p>
      </div>

      {/* ── Chat Interface ── */}
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How can I help you?</CardTitle>
            <CardDescription>
              Ask a question or request a draft. Press Enter to send.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Chat with a Document (Optional)
              </Label>

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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.csv,.xlsx,.xls"
                    aria-label="Upload a document"
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
                    {isProcessingFile ? "Processing..." : "Upload Document"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, TXT, XLSX, CSV
                  </p>
                </div>
              )}
            </div>

            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={isLoading}
            />

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
                    ? `Ask a question about "${uploadedFileName}"...`
                    : "Ask an HR question or request a draft..."
                }
                disabled={isLoading}
                className="resize-y min-h-[100px]"
              />
            </div>

            {/* Action buttons */}
            <Button
              onClick={handleSend}
              disabled={!userPrompt.trim() || isLoading}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {isLoading ? "Thinking..." : "Send"}
            </Button>
          </CardContent>
        </Card>

        {/* ── Response Section ── */}
        <div ref={resultRef}>
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
                    <MeetingCard meeting={meetingData.meeting} />
                    {meetingData.remainingText && (
                      <>
                        <MarkdownRenderer content={meetingData.remainingText} />
                        {!isLoading && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
                            <ExportButtons
                              content={meetingData.remainingText}
                              filename="hr-assistant"
                              tool="assistant"
                            />
                            <Button
                              variant="secondary"
                              onClick={() =>
                                handleRouteToFormatter(
                                  meetingData.remainingText,
                                )
                              }
                              className="gap-2"
                            >
                              <Paintbrush className="h-4 w-4" />
                              Format Document
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <MarkdownRenderer content={latestResponse} />
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
                    {!isLoading && latestResponse && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
                        <ExportButtons
                          content={latestResponse}
                          filename="hr-assistant"
                          tool="assistant"
                        />
                        <Button
                          variant="secondary"
                          onClick={() => handleRouteToFormatter(latestResponse)}
                          className="gap-2"
                        >
                          <Paintbrush className="h-4 w-4" />
                          Format Document
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* Refine Response */}
                {!isLoading && latestResponse && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <Label className="text-sm font-medium">
                      Refine Response
                    </Label>
                    <Textarea
                      rows={2}
                      value={refineText}
                      onChange={(e) => setRefineText(e.target.value)}
                      placeholder='e.g. "Make it shorter"…'
                      className="resize-y min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleRefine();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleRefine}
                      disabled={!refineText.trim()}
                      className="gap-2"
                    >
                      <Wand2 className="h-4 w-4" />
                      Refine
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
