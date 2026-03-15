"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { useTranslation } from "@/components/i18n-provider";
import { toast } from "sonner";
import {
  getChats,
  getChat,
  saveChat,
  deleteChat,
  renameChat,
  togglePin,
  type ChatSession,
  type ChatMessage,
} from "@/lib/chat-store";
import {
  MeetingCard,
  parseMeetingFromResponse,
} from "@/components/meeting-card";
import { useAIMemory, parseMemoryCommands } from "@/hooks/useAIMemory";
import {
  Loader2,
  MessageCircle,
  Send,
  Plus,
  X,
  StopCircle,
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
  ChevronDown,
  MoreVertical,
  Pin,
  Pencil,
  Trash2,
  Share2,
  History,
  Zap,
  Brain,
  Globe,
  Crown,
  Search,
  Menu,
  Mail,
  ScrollText,
  CalendarCheck,
  Star,
  ClipboardCheck,
  RefreshCw,
  Copy,
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
  const { user } = useUser();

  const [userPrompt, setUserPrompt] = useState("");
  const { language, t } = useTranslation();
  const [streamError, setStreamError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; ext: string; text: string }[]
  >([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [responseMode, setResponseMode] = useState<
    "fast" | "thinking" | "research" | "pro"
  >("fast");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showChatsPanel, setShowChatsPanel] = useState(false);
  const [chatList, setChatList] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>(() =>
    crypto.randomUUID(),
  );
  const [chatMenuId, setChatMenuId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const chatsPanelRef = useRef<HTMLDivElement>(null);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [msgMenuId, setMsgMenuId] = useState<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── AI Persistent Memory ── */
  const { memories, addMemory, removeMemory, clearMemories, getMemoryContext } =
    useAIMemory();

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
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const hasSentRef = useRef(false);
  const recognitionRef = useRef<ReturnType<
    typeof createSpeechRecognition
  > | null>(null);

  const { messages, isLoading, append, setMessages, stop } = useChat({
    api: "/api/chat",
    body: {
      tool: "assistant",
      referenceText: referenceText || undefined,
      responseMode,
      language: language !== "English" ? language : undefined,
      memoryContext: getMemoryContext() || undefined,
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

  // Track whether the AI is currently generating a NEW response (not just has a past one)
  const prevMsgCountRef = useRef(0);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState(0);

  useEffect(() => {
    const assistantMsgs = messages.filter((m) => m.role === "assistant");
    if (isLoading && assistantMsgs.length === prevMsgCountRef.current) {
      // Loading but no new assistant message yet = waiting for response
      setIsWaitingForResponse(true);
    } else {
      setIsWaitingForResponse(false);
      setThinkingPhase(0);
      prevMsgCountRef.current = assistantMsgs.length;
    }
  }, [messages, isLoading]);

  // Cycle through thinking phases while waiting
  useEffect(() => {
    if (!isWaitingForResponse) return;
    setThinkingPhase(0);
    const interval = setInterval(() => {
      setThinkingPhase((p) => p + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, [isWaitingForResponse]);

  // Parse memory-save commands from completed AI responses
  const lastParsedIdxRef = useRef(0);
  useEffect(() => {
    if (isLoading) return; // only parse when streaming is done
    const assistantMsgs = messages.filter((m) => m.role === "assistant");
    for (let i = lastParsedIdxRef.current; i < assistantMsgs.length; i++) {
      const { cleanText, commands } = parseMemoryCommands(
        assistantMsgs[i].content,
      );
      if (commands.length > 0) {
        commands.forEach((c) => addMemory(c.key, c.value));
        // Strip the [MEMORY_SAVE] tags from the displayed message
        const msgIdx = messages.findIndex(
          (m) => m === assistantMsgs[i] || m.id === assistantMsgs[i].id,
        );
        if (msgIdx >= 0 && cleanText !== assistantMsgs[i].content) {
          const updated = [...messages];
          updated[msgIdx] = { ...updated[msgIdx], content: cleanText };
          setMessages(updated);
        }
      }
    }
    lastParsedIdxRef.current = assistantMsgs.length;
  }, [messages, isLoading, addMemory, setMessages]);

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

  // Close mode menu on outside click
  useEffect(() => {
    if (!showModeMenu) return;
    const handler = (e: MouseEvent) => {
      if (
        modeMenuRef.current &&
        !modeMenuRef.current.contains(e.target as Node)
      ) {
        setShowModeMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showModeMenu]);

  // Close chats panel on outside click
  useEffect(() => {
    if (!showChatsPanel) return;
    const handler = (e: MouseEvent) => {
      // Don't close if clicking inside the bottom sheet (z-[70]/z-[71])
      const target = e.target as HTMLElement;
      if (target.closest("[data-chat-bottom-sheet]")) return;
      if (
        chatsPanelRef.current &&
        !chatsPanelRef.current.contains(e.target as Node)
      ) {
        setShowChatsPanel(false);
        setChatMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showChatsPanel]);

  // Load chat list on mount and when panel opens
  useEffect(() => {
    if (showChatsPanel) setChatList(getChats());
  }, [showChatsPanel]);

  // Auto-save chat whenever messages change (only if AI has responded)
  useEffect(() => {
    if (messages.length > 0 && messages.some((m) => m.role === "assistant")) {
      const mapped: ChatMessage[] = messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      const existing = getChat(activeChatId);
      saveChat(activeChatId, mapped, existing?.title);
    }
  }, [messages, activeChatId]);

  // Load a saved chat
  const handleLoadChat = useCallback(
    (session: ChatSession) => {
      setActiveChatId(session.id);
      setMessages(
        session.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      );
      setStreamError(null);
      setUserPrompt("");
      setUploadedFiles([]);
      hasSentRef.current = true;
      setShowChatsPanel(false);
      setChatMenuId(null);
    },
    [setMessages],
  );

  const handleDeleteChat = useCallback(
    (id: string) => {
      deleteChat(id);
      setChatList(getChats());
      if (id === activeChatId) {
        setActiveChatId(crypto.randomUUID());
        setMessages([]);
        setStreamError(null);
        setUserPrompt("");
        setUploadedFiles([]);
        hasSentRef.current = false;
      }
      setChatMenuId(null);
    },
    [activeChatId, setMessages],
  );

  const handleRenameChat = useCallback((id: string, title: string) => {
    if (title.trim()) {
      renameChat(id, title.trim());
      setChatList(getChats());
    }
    setRenamingId(null);
    setChatMenuId(null);
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    togglePin(id);
    setChatList(getChats());
    setChatMenuId(null);
  }, []);

  const handleShareChat = useCallback(async (session: ChatSession) => {
    setSharingId(session.id);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: session.title,
          messages: session.messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!data.success || !data.shareUrl) {
        toast.error("Failed to create share link");
        return;
      }

      const shareUrl = data.shareUrl;

      if (navigator.share) {
        navigator
          .share({
            title: `PureDraft HR: ${session.title}`,
            url: shareUrl,
          })
          .catch(() => {});
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard");
      }
    } catch {
      toast.error("Failed to create share link");
    } finally {
      setSharingId(null);
      setChatMenuId(null);
    }
  }, []);

  // Filtered chat list for search
  const filteredChats = useMemo(() => {
    if (!chatSearch.trim()) return chatList;
    const q = chatSearch.toLowerCase();
    return chatList.filter((s) => s.title.toLowerCase().includes(q));
  }, [chatList, chatSearch]);

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

  const ALLOWED_DOC_EXTS = new Set([
    "pdf",
    "docx",
    "txt",
    "csv",
    "xlsx",
    "xls",
    "html",
    "htm",
  ]);
  const ALLOWED_IMG_EXTS = new Set([
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "heic",
    "heif",
    "bmp",
    "svg",
  ]);

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
          setIsProcessingFile(false);
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
          setIsProcessingFile(false);
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

    // Include file names in the visible message if files are attached
    let visibleContent = userPrompt;
    if (uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map((f) => f.name).join(", ");
      visibleContent = `📎 ${fileNames}\n\n${userPrompt}`;
    }

    append({
      role: "user",
      content: visibleContent,
    });

    setUserPrompt("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [userPrompt, isLoading, append, uploadedFiles]);

  const handleNewChat = useCallback(() => {
    setActiveChatId(crypto.randomUUID());
    setMessages([]);
    setStreamError(null);
    setUserPrompt("");
    setUploadedFiles([]);
    hasSentRef.current = false;
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [setMessages]);

  /* ── User message copy / edit ── */
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success("Copied to clipboard");
    });
    setMsgMenuId(null);
  }, []);

  const handleEditMessage = useCallback(
    (msgId: string, content: string) => {
      setMsgMenuId(null);
      // Strip the 📎 file prefix if present
      const cleaned = content.replace(/^📎[^\n]*\n\n/, "");
      setUserPrompt(cleaned);
      // Remove this message and everything after it
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === msgId);
        return idx > 0 ? prev.slice(0, idx) : [];
      });
      setTimeout(() => textareaRef.current?.focus(), 50);
    },
    [setMessages],
  );

  const handleLongPressStart = useCallback((msgId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setMsgMenuId(msgId);
    }, 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

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
    <div className="assistant-chat-root relative flex flex-col max-w-3xl mx-auto overflow-hidden overscroll-none h-[calc(100dvh-8.5rem)] md:h-[calc(100dvh-3rem)]">
      {/* ── Sidebar Overlay Backdrop ── */}
      {showChatsPanel && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
          onClick={() => {
            setShowChatsPanel(false);
            setChatMenuId(null);
          }}
        />
      )}

      {/* ── Sidebar (Gemini-style slide-in) ── */}
      <div
        ref={chatsPanelRef}
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          showChatsPanel ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="px-3 py-3 border-b border-border/50 shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              id="chat-search"
              name="chat-search"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search chats"
              className="w-full h-10 pl-8 pr-3 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
              style={{ fontSize: "16px", WebkitAppearance: "none" }}
            />
          </div>
        </div>

        {/* New chat button */}
        <button
          type="button"
          onClick={() => {
            handleNewChat();
            setShowChatsPanel(false);
          }}
          className="mx-3 mt-3 mb-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("assistant.newChat")}</span>
        </button>

        {/* Chats header */}
        <div className="px-3 pt-4 pb-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Chats
          </h3>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-1">
          {filteredChats.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              {chatSearch ? "No matching chats" : "No conversations yet"}
            </p>
          ) : (
            filteredChats.map((session) => (
              <div
                key={session.id}
                className={`group relative flex items-center gap-2 px-3 py-2.5 hover:bg-accent/50 transition-colors cursor-pointer ${
                  session.id === activeChatId ? "bg-accent/30" : ""
                }`}
                onClick={() => handleLoadChat(session)}
              >
                {session.pinned && (
                  <Pin className="h-3 w-3 text-primary shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {renamingId === session.id ? (
                    <input
                      type="text"
                      id="chat-rename"
                      name="chat-rename"
                      aria-label="Rename conversation"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameChat(session.id, renameValue)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleRenameChat(session.id, renameValue);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent border-b border-primary text-xs outline-none py-0.5"
                      autoFocus
                    />
                  ) : (
                    <p className="text-xs font-medium truncate">
                      {session.title}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {/* 3-dot menu */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatMenuId(
                      chatMenuId === session.id ? null : session.id,
                    );
                  }}
                  className="h-8 w-8 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-md opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-accent active:bg-accent transition-all shrink-0"
                  aria-label="Chat options"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
                {/* Context menu — desktop dropdown */}
                {chatMenuId === session.id && (
                  <div
                    className="hidden md:block absolute right-2 top-full z-50 min-w-[170px] rounded-xl border border-border bg-popover shadow-lg py-1 animate-in fade-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                      onClick={() => handleShareChat(session)}
                    >
                      <Share2 className="h-3 w-3" />
                      {sharingId === session.id
                        ? "Creating public link..."
                        : "Share conversation"}
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                      onClick={() => handleTogglePin(session.id)}
                    >
                      <Pin className="h-3 w-3" />{" "}
                      {session.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                      onClick={() => {
                        setRenamingId(session.id);
                        setRenameValue(session.title);
                        setChatMenuId(null);
                      }}
                    >
                      <Pencil className="h-3 w-3" /> Rename
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-destructive hover:bg-accent transition-colors"
                      onClick={() => {
                        setDeleteConfirmId(session.id);
                        setChatMenuId(null);
                      }}
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sidebar footer — Theme, Language, Links (md:hidden only, matching More panel) */}
        <div className="md:hidden shrink-0 border-t border-border/50 px-3 py-3 space-y-3">
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground flex-wrap">
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              {t("common.privacy")}
            </a>
            <a
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              {t("common.terms")}
            </a>
            <a href="/faq" className="hover:text-foreground transition-colors">
              {t("common.faq")}
            </a>
            <a
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              {t("common.contact")}
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            {t("common.poweredByGemini")}
          </p>
        </div>
      </div>

      {/* ── Mobile Bottom Sheet for chat actions (Gemini-style) ── */}
      {chatMenuId && (
        <>
          <div
            data-chat-bottom-sheet
            className="md:hidden fixed inset-0 z-[70] bg-black/40 animate-in fade-in duration-200"
            onClick={() => {
              setChatMenuId(null);
              setSharingId(null);
            }}
          />
          <div
            data-chat-bottom-sheet
            className="md:hidden fixed bottom-0 left-0 right-0 z-[71] bg-card border-t border-border/50 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="px-4 pb-6 space-y-1">
              <button
                type="button"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => {
                  const session = chatList.find((s) => s.id === chatMenuId);
                  if (session) handleShareChat(session);
                }}
              >
                <Share2 className="h-5 w-5" />
                <span>
                  {sharingId === chatMenuId
                    ? "Creating public link..."
                    : "Share conversation"}
                </span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => {
                  if (chatMenuId) handleTogglePin(chatMenuId);
                }}
              >
                <Pin className="h-5 w-5" />
                <span>
                  {chatList.find((s) => s.id === chatMenuId)?.pinned
                    ? "Unpin"
                    : "Pin"}
                </span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => {
                  const session = chatList.find((s) => s.id === chatMenuId);
                  if (session) {
                    setRenamingId(session.id);
                    setRenameValue(session.title);
                    setChatMenuId(null);
                  }
                }}
              >
                <Pencil className="h-5 w-5" />
                <span>Rename</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm text-destructive hover:bg-accent rounded-lg transition-colors"
                onClick={() => {
                  setDeleteConfirmId(chatMenuId);
                  setChatMenuId(null);
                }}
              >
                <Trash2 className="h-5 w-5" />
                <span>Delete</span>
              </button>
              {/* Creating public link indicator */}
              {sharingId === chatMenuId && (
                <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50 mt-2">
                  Creating public link...
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deleteConfirmId && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-150"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 fade-in duration-200">
              <h3 className="text-lg font-semibold mb-2">Delete chat?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You&apos;ll no longer see this chat here. This will also delete
                all messages in this conversation.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-accent rounded-lg transition-colors"
                  onClick={() => setDeleteConfirmId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-accent rounded-lg transition-colors"
                  onClick={() => {
                    handleDeleteChat(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Memory Panel Overlay Backdrop ── */}
      {showMemoryPanel && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
          onClick={() => setShowMemoryPanel(false)}
        />
      )}

      {/* ── Memory Panel (slide-in from right) ── */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          showMemoryPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-3 py-3 border-b border-border/50 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">AI Memory</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowMemoryPanel(false)}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {memories.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No memories yet. The AI will automatically remember important
              details you share — like your name, company, or preferences.
            </p>
          ) : (
            <div className="space-y-2">
              {memories.map((m) => (
                <div
                  key={m.key}
                  className="group flex items-start gap-2 p-2 rounded-lg bg-muted/50 border border-border/50 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground">{m.key}</span>
                    <p className="text-muted-foreground mt-0.5 break-words">
                      {m.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMemory(m.key)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 shrink-0 rounded flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all"
                    aria-label={`Remove memory: ${m.key}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {memories.length > 0 && (
          <div className="px-3 py-2 border-t border-border/50 shrink-0">
            <button
              type="button"
              onClick={() => {
                clearMemories();
                toast.success("AI memory cleared");
              }}
              className="w-full text-xs text-destructive hover:bg-destructive/10 rounded-lg py-2 transition-colors"
            >
              Clear all memories
            </button>
          </div>
        )}
      </div>

      {/* ── Top Bar (Gemini-style) ── */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowChatsPanel((p) => !p)}
            className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent/60 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <h1 className="text-base font-semibold">{t("assistant.title")}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="text-xs gap-1.5 h-8"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("assistant.newChat")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Chat Messages Area ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-1 py-4 space-y-1 scrollbar-none"
      >
        {/* Empty state — Gemini-inspired welcome */}
        {!hasMessages && !isLoading && (
          <div className="flex flex-col items-start px-4 sm:px-8 max-w-xl mx-auto pt-8 sm:pt-16">
            {/* Greeting */}
            <p className="text-lg text-muted-foreground mb-1">
              {t("assistant.greeting")}
              {user?.firstName ? `, ${user.firstName}` : ""}
            </p>
            {/* Bold headline */}
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent whitespace-pre-line">
              {t("assistant.emptyTitle")}
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
              {t("assistant.emptyDesc")}
            </p>
            {/* Suggestion chips — 2-column grid with icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {[
                { text: t("assistant.chip1"), icon: FileText },
                { text: t("assistant.chip2"), icon: Mail },
                { text: t("assistant.chip3"), icon: ScrollText },
                { text: t("assistant.chip4"), icon: CalendarCheck },
                { text: t("assistant.chip5"), icon: Star },
                { text: t("assistant.chip6"), icon: ClipboardCheck },
              ].map((chip) => (
                <button
                  key={chip.text}
                  type="button"
                  onClick={() => {
                    setUserPrompt(chip.text);
                    textareaRef.current?.focus();
                  }}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-left"
                >
                  <chip.icon className="h-4 w-4 shrink-0 text-primary/60" />
                  {chip.text}
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
              className={`flex gap-3 py-4 ${isUser ? "justify-end group" : "justify-start"}`}
            >
              {/* Avatar - assistant */}
              {!isUser && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5 text-primary-foreground text-[10px] font-bold">
                  PD
                </div>
              )}

              {/* Desktop: copy/edit icons for user messages */}
              {isUser && (
                <div className="hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.content)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditMessage(msg.id, msg.content)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Message content */}
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5"
                    : "flex-1 min-w-0"
                }`}
                {...(isUser
                  ? {
                      onTouchStart: () => handleLongPressStart(msg.id),
                      onTouchEnd: handleLongPressEnd,
                      onTouchMove: handleLongPressEnd,
                    }
                  : {})}
              >
                {isUser ? (
                  <>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed select-text">
                      {msg.content}
                    </p>
                    {/* Mobile: long-press popup menu */}
                    {msgMenuId === msg.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setMsgMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg py-1 min-w-[140px] sm:hidden">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.content)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleEditMessage(msg.id, msg.content)
                            }
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                        </div>
                      </>
                    )}
                  </>
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

        {/* Thinking / typing indicator */}
        {isLoading && isWaitingForResponse && (
          <div className="flex gap-3 py-4">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-foreground text-[10px] font-bold">
              PD
            </div>
            <div className="flex flex-col gap-2 py-1">
              {/* Multi-phase thinking indicator */}
              <div className="flex flex-col gap-1.5 py-0.5">
                {(() => {
                  const hasFiles = uploadedFiles.length > 0;
                  const phases = hasFiles
                    ? [
                        { icon: "📄", text: "Reading your documents..." },
                        { icon: "🔍", text: "Analyzing content..." },
                        {
                          icon: "🧠",
                          text:
                            responseMode === "thinking"
                              ? "Thinking step by step..."
                              : responseMode === "research"
                                ? "Deep searching..."
                                : responseMode === "pro"
                                  ? "Applying expert knowledge..."
                                  : "Processing your request...",
                        },
                        { icon: "✍️", text: "Composing response..." },
                      ]
                    : [
                        { icon: "🔍", text: "Understanding your request..." },
                        {
                          icon: "🧠",
                          text:
                            responseMode === "thinking"
                              ? "Thinking step by step..."
                              : responseMode === "research"
                                ? "Researching in depth..."
                                : responseMode === "pro"
                                  ? "Applying expert knowledge..."
                                  : "Processing...",
                        },
                        { icon: "✍️", text: "Composing response..." },
                      ];
                  const currentIdx = Math.min(thinkingPhase, phases.length - 1);
                  return phases.map((phase, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                        i < currentIdx
                          ? "text-muted-foreground/50"
                          : i === currentIdx
                            ? "text-foreground"
                            : "text-transparent"
                      }`}
                    >
                      {i < currentIdx ? (
                        <svg
                          className="h-3.5 w-3.5 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : i === currentIdx ? (
                        <svg
                          className="h-3.5 w-3.5 animate-spin text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <span className="h-3.5 w-3.5" />
                      )}
                      <span className={i === currentIdx ? "animate-pulse" : ""}>
                        {phase.icon} {phase.text}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {streamError && (
          <div className="flex gap-3 py-4 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="h-8 w-8 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg
                className="h-4 w-4 text-destructive"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-sm text-foreground/80 leading-relaxed">
                {streamError}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const lastUserMsg = [...messages]
                      .reverse()
                      .find((m) => m.role === "user");
                    if (lastUserMsg) {
                      setStreamError(null);
                      setMessages(
                        messages.filter((m) => m.id !== lastUserMsg.id),
                      );
                      setTimeout(() => {
                        append({ role: "user", content: lastUserMsg.content });
                      }, 100);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => setStreamError(null)}
                  className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area (Gemini-style card) ── */}
      <div className="shrink-0 bg-background px-2 pb-2 pt-3">
        {/* Attached file cards */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 px-1">
            {uploadedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="group relative flex flex-col items-center justify-center w-[72px] h-[72px] rounded-xl border border-border/60 bg-muted/50 hover:bg-muted transition-colors"
                title={file.name}
              >
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(idx)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-foreground/70 text-background flex items-center justify-center hover:bg-destructive transition-colors z-10"
                  aria-label={t("assistant.removeDocument")}
                >
                  <X className="h-3 w-3" />
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

        {/* Input card container */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id="chat-input"
              name="chat-input"
              aria-label="Chat message"
              rows={1}
              value={userPrompt}
              onChange={handleTextareaChange}
              placeholder={
                uploadedFiles.length > 0
                  ? `${t("assistant.placeholder")} (${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""})...`
                  : t("assistant.placeholder")
              }
              disabled={isLoading}
              className="resize-none min-h-[44px] max-h-[200px] overflow-y-auto overflow-x-hidden scrollbar-none border-none bg-transparent shadow-none focus-visible:ring-0 focus:ring-0 focus:outline-none focus-visible:outline-none focus-visible:border-transparent rounded-none px-4 py-3 text-base"
            />
          </div>

          {/* Bottom toolbar row */}
          <div className="flex items-center justify-between px-2 pb-2">
            {/* Left: upload button */}
            <div className="relative shrink-0" ref={uploadMenuRef}>
              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                id="camera-upload"
                name="camera-upload"
                type="file"
                accept="image/*"
                capture="environment"
                aria-label="Take a photo"
                className="hidden"
                onChange={handleImageUpload}
                disabled={
                  isProcessingFile || isLoading || uploadedFiles.length >= 10
                }
              />
              <input
                ref={galleryInputRef}
                id="gallery-upload"
                name="gallery-upload"
                type="file"
                accept="image/*"
                multiple
                aria-label="Upload images from gallery"
                className="hidden"
                onChange={handleImageUpload}
                disabled={
                  isProcessingFile || isLoading || uploadedFiles.length >= 10
                }
              />
              <input
                ref={fileInputRef}
                id="document-upload"
                name="document-upload"
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,.html,.htm"
                aria-label="Upload documents"
                className="hidden"
                onChange={handleDocumentUpload}
                disabled={
                  isProcessingFile || isLoading || uploadedFiles.length >= 10
                }
              />

              {/* Desktop: plus icon */}
              <div className="hidden md:block">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    isProcessingFile || isLoading || uploadedFiles.length >= 10
                  }
                  className="h-9 w-9 rounded-xl cursor-pointer"
                  title="Add files"
                >
                  {isProcessingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Mobile: plus icon opens Camera / Gallery / Files menu */}
              <div className="md:hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUploadMenu((p) => !p)}
                  disabled={
                    isProcessingFile || isLoading || uploadedFiles.length >= 10
                  }
                  className="h-9 w-9 rounded-xl cursor-pointer"
                  aria-label="Add files"
                >
                  {isProcessingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>

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
            </div>

            {/* Right: mode selector + send/mic */}
            <div className="flex items-center gap-1">
              {/* Response mode selector */}
              <div ref={modeMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowModeMenu((p) => !p)}
                  className="flex items-center gap-1 h-8 px-2 rounded-lg text-[11px] font-medium hover:bg-accent/60 transition-colors cursor-pointer"
                >
                  {responseMode === "fast" ? (
                    <Zap className="h-3.5 w-3.5 text-green-500" />
                  ) : responseMode === "thinking" ? (
                    <Brain className="h-3.5 w-3.5 text-blue-500" />
                  ) : responseMode === "research" ? (
                    <Globe className="h-3.5 w-3.5 text-purple-500" />
                  ) : (
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  {responseMode === "fast"
                    ? "Fast"
                    : responseMode === "thinking"
                      ? "Think"
                      : responseMode === "research"
                        ? "Deep"
                        : "Pro"}
                  <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                </button>
                {showModeMenu && (
                  <div className="absolute bottom-10 right-0 z-50 min-w-[170px] rounded-xl border border-border bg-popover shadow-lg py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {[
                      {
                        key: "fast" as const,
                        label: "Fast",
                        desc: "Quick responses",
                        icon: Zap,
                        iconColor: "text-green-500",
                      },
                      {
                        key: "thinking" as const,
                        label: "Thinking",
                        desc: "Step-by-step reasoning",
                        icon: Brain,
                        iconColor: "text-blue-500",
                      },
                      {
                        key: "research" as const,
                        label: "Deep Research",
                        desc: "Thorough analysis",
                        icon: Globe,
                        iconColor: "text-purple-500",
                      },
                      {
                        key: "pro" as const,
                        label: "Pro",
                        desc: "Maximum quality",
                        icon: Crown,
                        iconColor: "text-amber-500",
                      },
                    ].map((mode) => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => {
                          setResponseMode(mode.key);
                          setShowModeMenu(false);
                        }}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer ${
                          responseMode === mode.key ? "bg-accent/50" : ""
                        }`}
                      >
                        <mode.icon className={`h-4 w-4 ${mode.iconColor}`} />
                        <div className="text-left">
                          <div className="font-medium text-xs">
                            {mode.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {mode.desc}
                          </div>
                        </div>
                        {responseMode === mode.key && (
                          <span className="ml-auto text-primary text-xs">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
        <p className="text-[10px] text-muted-foreground/60 text-center mt-1 pb-0.5">
          {t("assistant.disclaimer")}
        </p>
      </div>
    </div>
  );
}
