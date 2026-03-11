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
  Plus,
  X,
  StopCircle,
  Bot,
  User,
  Sparkles,
  Mic,
  MicOff,
  FileText,
  FileSpreadsheet,
  File,
  Camera,
  Image as ImageIcon,
  FolderOpen,
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

/* ── File type icon helper ── */
function fileIcon(ext: string) {
  const cls = "h-5 w-5";
  switch (ext) {
    case "pdf":
      return <FileText className={`${cls} text-red-500`} />;
    case "docx":
    case "doc":
    case "txt":
      return <FileText className={`${cls} text-blue-500`} />;
    case "csv":
    case "xlsx":
    case "xls":
      return <FileSpreadsheet className={`${cls} text-green-600`} />;
    case "html":
    case "htm":
      return <FileText className={`${cls} text-orange-500`} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "heic":
      return <ImageIcon className={`${cls} text-purple-500`} />;
    default:
      return <File className={`${cls} text-muted-foreground`} />;
  }
}

/* ------------------------------------------------------------------ */
/* /assistant — ChatGPT / Gemini-style Chat UX                       */
/* ------------------------------------------------------------------ */
export default function AssistantPage() {
  const router = useRouter();

  const [userPrompt, setUserPrompt] = useState("");
  const { language, t } = useTranslation();
  const [streamError, setStreamError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; ext: string; text: string }[]
  >([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  /** Combined reference text from all uploaded files */
  const referenceText = uploadedFiles
    .map((f, i) => `--- File ${i + 1}: ${f.name} ---\n${f.text}`)
    .join("\n\n");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
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

  // Close upload menu on outside click
  useEffect(() => {
    if (!showUploadMenu) return;
    const handler = (e: MouseEvent) => {
      if (
        uploadMenuRef.current &&
        !uploadMenuRef.current.contains(e.target as Node)
      ) {
        setShowUploadMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUploadMenu]);

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

  const ALLOWED_DOC_EXTS = new Set(["pdf", "docx", "txt", "csv", "xlsx", "xls", "html", "htm"]);
  const ALLOWED_IMG_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "bmp", "svg"]);

  const handleDocumentUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsProcessingFile(true);
      try {
        const fileArray = Array.from(files)
          .filter((f) => {
            const ext = f.name.split(".").pop()?.toLowerCase() || "";
            return ALLOWED_DOC_EXTS.has(ext);
          })
          .slice(0, 10 - uploadedFiles.length);
        if (fileArray.length === 0) {
          toast.error("Unsupported file type");
          return;
        }
        const results: { name: string; ext: string; text: string }[] = [];

        for (const file of fileArray) {
          const name = file.name.toLowerCase();
          const ext = name.split(".").pop() || "file";
          const isSpreadsheet =
            name.endsWith(".csv") ||
            name.endsWith(".xlsx") ||
            name.endsWith(".xls") ||
            file.type === "text/csv" ||
            file.type ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel";

          let text: string;
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
          results.push({ name: file.name, ext, text });
        }

        setUploadedFiles((prev) => [...prev, ...results].slice(0, 10));
      } catch (error) {
        console.error("Document upload error:", error);
        setStreamError(t("error.uploadFailed"));
      } finally {
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [uploadedFiles.length],
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      setIsProcessingFile(true);
      try {
        const fileArray = Array.from(files)
          .filter((f) => {
            const ext = f.name.split(".").pop()?.toLowerCase() || "";
            return ALLOWED_IMG_EXTS.has(ext);
          })
          .slice(0, 10 - uploadedFiles.length);
        if (fileArray.length === 0) {
          toast.error("Unsupported image type");
          return;
        }
        const results: { name: string; ext: string; text: string }[] = [];
        for (const file of fileArray) {
          const ext = file.name.split(".").pop()?.toLowerCase() || "img";
          results.push({
            name: file.name,
            ext,
            text: `[Image: ${file.name}]`,
          });
        }
        setUploadedFiles((prev) => [...prev, ...results].slice(0, 10));
      } finally {
        setIsProcessingFile(false);
      }
    },
    [uploadedFiles.length],
  );

  const handleRemoveDocument = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveAllDocuments = useCallback(() => {
    setUploadedFiles([]);
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
    setUploadedFiles([]);
    hasSentRef.current = false;
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [setMessages]);

  // Push to Formatter Action
  const handleRouteToFormatter = (text: string) => {
    localStorage.setItem("puredraft_formatter_payload", text);
    router.push("/formatter");
  };

  // Voice-to-text toggle
  const toggleListening = useCallback(async () => {
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
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // Fallback: request permission via getUserMedia then retry
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        recognition.start();
        setIsListening(true);
      } catch {
        toast.error(t("assistant.micDenied"));
      }
    }
  }, [isListening, language]);

  return (
    <div className="flex flex-col h-[calc(100dvh-10.5rem-env(safe-area-inset-bottom,0px))] md:h-[calc(100dvh-3rem)] max-w-3xl mx-auto overflow-hidden">
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
        {/* Attached file cards */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {uploadedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="group relative flex flex-col items-center justify-center w-[72px] h-[72px] rounded-xl border border-border/60 bg-muted/50 hover:bg-muted transition-colors"
                title={file.name}
              >
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(idx)}
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label={t("assistant.removeDocument")}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
                {fileIcon(file.ext)}
                <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-primary/10 text-primary">
                  {file.ext}
                </span>
                <span className="mt-0.5 text-[8px] text-muted-foreground truncate max-w-[64px] leading-tight">
                  {file.name.replace(/\.[^.]+$/, "")}
                </span>
              </div>
            ))}
            {uploadedFiles.length > 1 && (
              <button
                type="button"
                onClick={handleRemoveAllDocuments}
                className="flex items-center justify-center w-[72px] h-[72px] rounded-xl border border-dashed border-destructive/40 text-destructive/60 hover:text-destructive hover:border-destructive transition-colors text-[10px] font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2">
          {/* Upload button with menu */}
          <div className="relative shrink-0" ref={uploadMenuRef}>
            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isProcessingFile || isLoading || uploadedFiles.length >= 10}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={isProcessingFile || isLoading || uploadedFiles.length >= 10}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,.html,.htm"
              className="hidden"
              onChange={handleDocumentUpload}
              disabled={isProcessingFile || isLoading || uploadedFiles.length >= 10}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowUploadMenu((p) => !p)}
              disabled={isProcessingFile || isLoading || uploadedFiles.length >= 10}
              className="h-10 w-10 rounded-xl cursor-pointer"
              aria-label="Add files"
            >
              {isProcessingFile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>

            {/* Dropdown menu */}
            {showUploadMenu && (
              <div className="absolute bottom-12 left-0 z-50 min-w-[160px] rounded-xl border border-border bg-popover shadow-lg py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button
                  type="button"
                  onClick={() => {
                    cameraInputRef.current?.click();
                    setShowUploadMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-accent transition-colors cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  Camera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    galleryInputRef.current?.click();
                    setShowUploadMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-accent transition-colors cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Gallery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowUploadMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-accent transition-colors cursor-pointer"
                >
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  Files
                </button>
              </div>
            )}
          </div>

          {/* Text input with Send + Mic inside */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              rows={1}
              value={userPrompt}
              onChange={handleTextareaChange}
              placeholder={
                uploadedFiles.length > 0
                  ? `${t("assistant.placeholder")} (${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""})...`
                  : t("assistant.placeholder")
              }
              disabled={isLoading}
              className="resize-none min-h-[44px] max-h-[200px] overflow-y-auto scrollbar-none pr-20 rounded-xl"
            />
            <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1">
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
              ) : userPrompt.trim() ? (
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSend}
                  className="h-8 w-8 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
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
                  className={`h-8 w-8 rounded-lg ${isListening ? "text-red-500 bg-red-500/10" : ""}`}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
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
