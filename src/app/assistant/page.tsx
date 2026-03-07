"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { useTranslation } from "@/components/i18n-provider";
import { toast } from "sonner";
import {
  MeetingCard,
  parseMeetingFromResponse,
} from "@/components/meeting-card";
import {
  Loader2,
  MessageCircle,
  Send,
  Upload,
  CheckCircle,
  X,
  StopCircle,
  Bot,
  User,
  Sparkles,
  Mic,
  MicOff,
} from "lucide-react";

/* ── Speech Recognition helper ── */
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: { readonly [index: number]: { transcript: string } };
}

function createSpeechRecognition() {
  const W = window as unknown as Record<string, unknown>;
  const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
  if (!SR) return null;
  return new (SR as new () => {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((e: { results: SpeechRecognitionResultList }) => void) | null;
    onend: (() => void) | null;
    onerror: ((e: { error: string }) => void) | null;
    start: () => void;
    stop: () => void;
  })();
}

/* ── Language → BCP-47 locale map (for speech recognition) ── */
const LANG_TO_LOCALE: Record<string, string> = {
  English: "en-US",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Mandarin: "zh-CN",
  Portuguese: "pt-BR",
  Arabic: "ar-SA",
  Hindi: "hi-IN",
};

/* ------------------------------------------------------------------ */
/* /assistant — ChatGPT / Gemini-style Chat UX                       */
/* ------------------------------------------------------------------ */
export default function AssistantPage() {
  const router = useRouter();

  const [userPrompt, setUserPrompt] = useState("");
  const { language, t } = useTranslation();
  const [streamError, setStreamError] = useState<string | null>(null);
  const [referenceText, setReferenceText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSentRef = useRef(false);
  const recognitionRef = useRef<ReturnType<
    typeof createSpeechRecognition
  > | null>(null);

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
        setStreamError(t("error.rateLimit"));
      } else {
        setStreamError(msg || t("error.generic"));
      }
    },
  });

  const hasMessages = messages.length > 0;
  const lastAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const latestResponse = lastAssistantMsg?.content ?? "";

  // Auto-scroll to bottom only after user has actually sent a message
  useEffect(() => {
    if (hasSentRef.current && (messages.length > 0 || isLoading)) {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setUserPrompt(e.target.value);
      const ta = e.target;
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    },
    [],
  );

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
        setStreamError(t("error.uploadFailed"));
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

    hasSentRef.current = true;
    append({
      role: "user",
      content: userPrompt,
    });

    setUserPrompt("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [userPrompt, isLoading, append]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setStreamError(null);
    setUserPrompt("");
    hasSentRef.current = false;
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [setMessages]);

  // Push to Formatter Action
  const handleRouteToFormatter = (text: string) => {
    localStorage.setItem("puredraft_formatter_payload", text);
    router.push("/formatter");
  };

  // Voice-to-text toggle
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = createSpeechRecognition();
    if (!recognition) {
      toast.error(t("assistant.micNotSupported"));
      return;
    }
    recognition.lang = LANG_TO_LOCALE[language] || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: {
      results: SpeechRecognitionResultList;
    }) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setUserPrompt((prev) => (prev ? prev + " " + transcript : transcript));
        textareaRef.current?.focus();
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: { error: string }) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error(t("assistant.micDenied"));
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        toast.error(t("assistant.voiceError") + ": " + event.error);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, language]);

  return (
    <div className="flex flex-col h-[calc(100dvh-9.5rem)] md:h-[calc(100dvh-3rem)] max-w-3xl mx-auto overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-1 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">
              {t("assistant.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("assistant.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="text-xs gap-1.5 h-8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t("assistant.newChat")}
            </Button>
          )}
        </div>
      </div>

      {/* ── Chat Messages Area ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-1 py-4 space-y-1 scrollbar-none md:scrollbar-thin"
      >
        {/* Empty state */}
        {!hasMessages && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {t("assistant.emptyTitle")}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mb-8">
              {t("assistant.emptyDesc")}
            </p>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {[
                t("assistant.chip1"),
                t("assistant.chip2"),
                t("assistant.chip3"),
                t("assistant.chip4"),
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setUserPrompt(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const meetingData = !isUser
            ? parseMeetingFromResponse(msg.content)
            : null;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 py-4 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar - assistant */}
              {!isUser && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              {/* Message content */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5"
                    : "flex-1 min-w-0"
                }`}
              >
                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                ) : meetingData ? (
                  <div className="space-y-3">
                    <MeetingCard meeting={meetingData.meeting} />
                    {meetingData.remainingText && (
                      <>
                        <MarkdownRenderer content={meetingData.remainingText} />
                        {!isLoading && (
                          <ExportButtons
                            content={meetingData.remainingText}
                            filename="hr-assistant"
                            tool="assistant"
                            onFormat={handleRouteToFormatter}
                          />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <MarkdownRenderer content={msg.content} />
                    {!isLoading && msg.id === lastAssistantMsg?.id && (
                      <ExportButtons
                        content={msg.content}
                        filename="hr-assistant"
                        tool="assistant"
                        onFormat={handleRouteToFormatter}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Avatar - user */}
              {isUser && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && !latestResponse && (
          <div className="flex gap-3 py-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-1.5 py-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Error */}
        {streamError && (
          <div className="mx-auto max-w-md rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 flex items-center justify-between">
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

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area (pinned to bottom) ── */}
      <div className="shrink-0 border-t border-border/50 bg-background pt-3 pb-2 px-1">
        {/* Attached document pill */}
        {uploadedFileName && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 mb-2 max-w-sm">
            <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400 truncate flex-1">
              {uploadedFileName}
            </span>
            <button
              type="button"
              onClick={handleRemoveDocument}
              className="text-muted-foreground hover:text-destructive"
              aria-label={t("assistant.removeDocument")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2">
          {/* Upload button */}
          <div className="relative shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.csv,.xlsx,.xls"
              aria-label="Upload a document"
              onChange={handleDocumentUpload}
              disabled={isProcessingFile || isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isProcessingFile || isLoading}
              className="h-10 w-10 rounded-xl"
            >
              {isProcessingFile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Text input with Send + Mic inside */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              rows={1}
              value={userPrompt}
              onChange={handleTextareaChange}
              placeholder={
                uploadedFileName
                  ? `${t("assistant.placeholder")} "${uploadedFileName}"...`
                  : t("assistant.placeholder")
              }
              disabled={isLoading}
              className="resize-none min-h-[44px] max-h-[200px] overflow-y-auto scrollbar-none pr-20 rounded-xl"
            />
            <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title={
                  isListening
                    ? t("assistant.stopListening")
                    : t("assistant.voiceInput")
                }
                onClick={toggleListening}
                disabled={isLoading}
                className={`h-8 w-8 rounded-lg ${isListening ? "text-red-500 bg-red-500/10" : ""}`}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  onClick={() => stop()}
                  className="h-8 w-8 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  title={t("assistant.stopGenerating")}
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon"
                  disabled={!userPrompt.trim()}
                  onClick={handleSend}
                  className="h-8 w-8 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer — always visible */}
        <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
          {t("assistant.disclaimer")}
        </p>
      </div>
    </div>
  );
}
