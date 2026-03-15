"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  Pencil,
  Mail,
  Save,
  MoreVertical,
  Share2,
  Volume2,
  VolumeX,
  Paintbrush,
  Loader2,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import type { DocumentStyling } from "@/hooks/useDocumentStyling";
import { markdownToHtml, BULLET_SYMBOLS } from "@/lib/markdown-to-html";
import { EmailDocumentModal } from "@/components/email-document-modal";
import { useTranslation } from "@/components/i18n-provider";

/** Lazy-loaded docx module type */
type DocxModule = typeof import("docx");

/* ------------------------------------------------------------------ */
/*  Dynamic filename extraction from markdown content                  */
/* ------------------------------------------------------------------ */
function extractFilename(content: string, fallbackPrefix: string): string {
  // Try to find the first H1 heading for the document type/title
  const h1Match = content.match(/^#\s+(.+)$/m);
  let title = "";
  if (h1Match) {
    title = h1Match[1].trim();
  }

  // Try to detect a person's name from common patterns:
  // "Dear John Doe", "Employee: John Doe", "Name: John Doe", "To: John Doe"
  // "Re: John Doe", "Candidate: John Doe", "Mr./Mrs./Ms. John Doe"
  let personName = "";
  const namePatterns = [
    /(?:Dear|To|Attn|Attention|Employee|Candidate|Applicant|Name|Re|Subject)[:\s]+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/m,
    /(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/m,
  ];
  for (const pattern of namePatterns) {
    const nameMatch = content.match(pattern);
    if (nameMatch) {
      personName = nameMatch[1].trim();
      break;
    }
  }

  // Skip AI filler preamble lines (Certainly, Sure, Here is, Of course, etc.)
  const AI_FILLER_RE =
    /^(certainly|sure|of course|here\s+(is|are)|absolutely|i('d|\s+would)\s+be\s+happy|great|no\s+problem|i('ve|\s+have)\s+(drafted|created|prepared|written))/i;

  if (title) {
    // If the H1 looks like AI filler, skip it and try the second H1
    if (AI_FILLER_RE.test(title)) {
      const secondH1 = content.match(/^#\s+(.+)$/gm);
      if (secondH1 && secondH1.length > 1) {
        title = secondH1[1].replace(/^#\s+/, "").trim();
      } else {
        title = "";
      }
    }
  }

  if (title && !AI_FILLER_RE.test(title)) {
    // Clean up the title
    let cleanTitle = title
      .replace(/[^a-zA-Z0-9\s\-_]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 50);

    // Append person name if found and not already in the title
    if (
      personName &&
      !cleanTitle.toLowerCase().includes(personName.toLowerCase())
    ) {
      cleanTitle = `${cleanTitle} - ${personName}`.substring(0, 70);
    }

    return cleanTitle.replace(/\s+/g, "_");
  }

  // If no H1, try to build name from first meaningful non-filler line
  const meaningfulLine = content.split("\n").find((l) => {
    const stripped = l
      .replace(/^[#\-*>\s]+/, "")
      .replace(/\*\*/g, "")
      .trim();
    return (
      stripped.length > 5 &&
      !l.startsWith("```") &&
      !AI_FILLER_RE.test(stripped)
    );
  });
  if (meaningfulLine) {
    let cleanLine = meaningfulLine
      .replace(/^[#\-*>\s]+/, "")
      .replace(/\*\*/g, "")
      .replace(/[^a-zA-Z0-9\s\-_]/g, "")
      .trim()
      .substring(0, 50);
    if (
      personName &&
      !cleanLine.toLowerCase().includes(personName.toLowerCase())
    ) {
      cleanLine = `${cleanLine} - ${personName}`.substring(0, 70);
    }
    if (cleanLine.length > 5) {
      return cleanLine.replace(/\s+/g, "_");
    }
  }

  // Ultimate fallback to timestamped name
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fallbackPrefix}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

/* ------------------------------------------------------------------ */
/*  ExportButtons — PDF, DOCX, Copy to Clipboard                       */
/* ------------------------------------------------------------------ */
interface ExportButtonsProps {
  /** The raw markdown/text content to export */
  content: string;
  /** Fallback filename prefix (without extension) */
  filename?: string;
  /** Document styling configuration */
  styling?: DocumentStyling;
  /** Which tool generated this document (for save) */
  tool?: string;
  /** Document type (for save) */
  docType?: string;
  /** Optional callback to route content to the Formatter */
  onFormat?: (content: string) => void;
}

export function ExportButtons({
  content,
  filename = "HR_Document",
  styling,
  tool,
  docType,
  onFormat,
}: ExportButtonsProps) {
  const { isSignedIn } = useAuth();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [exportFileName, setExportFileName] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const dynamicFilename = extractFilename(content, filename);

  // Initialize the editable filename from the smart default when content changes
  useEffect(() => {
    setExportFileName(dynamicFilename);
  }, [dynamicFilename]);

  /** The actual filename used for exports (user-edited or smart default) */
  const resolvedFilename =
    exportFileName.trim().replace(/\.[^.]+$/, "") || dynamicFilename;

  /* ── Copy to Clipboard (rich-text HTML + plain text fallback) ── */
  const handleCopy = useCallback(async () => {
    try {
      // Convert markdown to styled HTML for rich-text paste (Word, Docs, etc.)
      const html = markdownToHtml(content, styling);
      // Also prepare a clean plain text version for plain-text editors
      const plainText = content
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/^[-*]\s+/gm, "- ")
        .trim();

      // Use ClipboardItem API for rich-text (HTML) copying when available
      if (typeof ClipboardItem !== "undefined") {
        const htmlBlob = new Blob([html], { type: "text/html" });
        const textBlob = new Blob([plainText], { type: "text/plain" });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": htmlBlob,
            "text/plain": textBlob,
          }),
        ]);
      } else {
        // Fallback: just copy plain text
        await navigator.clipboard.writeText(plainText);
      }
      setCopied(true);
      toast.success(t("export.copiedFormatting"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content, styling]);

  /* ── PDF Export via html2pdf.js (lazy loaded) ── */
  const handlePdfExport = useCallback(async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    const container = document.createElement("div");
    container.style.padding = "24px";
    container.style.fontFamily =
      styling?.fontFamily || "Arial, Helvetica, sans-serif";
    container.style.fontSize = styling ? `${styling.bodyTextSizePt}pt` : "12pt";
    container.style.lineHeight = styling?.lineSpacing || "1.6";
    container.style.color = "#1a1a1a";

    // Convert markdown to HTML with bullet injection for PDF
    container.innerHTML = markdownToHtml(content, styling);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${resolvedFilename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(container).save();
    toast.success(t("export.pdfDownloaded"));
  }, [content, resolvedFilename, styling]);

  /* ── Excel Export via xlsx (lazy loaded) ── */
  const hasTable = /^\|.+\|$/m.test(content);

  const handleExcelExport = useCallback(async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    // Try to extract markdown tables
    const tableRegex = /^(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)*)/gm;
    let match: RegExpExecArray | null;
    let sheetIndex = 0;

    while ((match = tableRegex.exec(content)) !== null) {
      const headerRow = match[1]
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      const bodyRows = match[3]
        .trim()
        .split("\n")
        .map((r) =>
          r
            .split("|")
            .filter((c) => c.trim())
            .map((c) => c.trim()),
        );

      const data = [headerRow, ...bodyRows];
      const ws = XLSX.utils.aoa_to_sheet(data);
      // Auto-size columns
      ws["!cols"] = headerRow.map((_, i) => ({
        wch: Math.max(...data.map((row) => (row[i] ? row[i].length : 10)), 10),
      }));
      const sheetName = sheetIndex === 0 ? "Sheet1" : `Sheet${sheetIndex + 1}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      sheetIndex++;
    }

    // If no tables found, export the full text as a single-cell sheet
    if (sheetIndex === 0) {
      const plainText = content
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .trim();
      const ws = XLSX.utils.aoa_to_sheet([[plainText]]);
      ws["!cols"] = [{ wch: 80 }];
      XLSX.utils.book_append_sheet(wb, ws, "Document");
    }

    XLSX.writeFile(wb, `${resolvedFilename}.xlsx`);
    toast.success(t("export.excelDownloaded"));
  }, [content, resolvedFilename]);

  /* ── DOCX Export via the docx library (lazy-loaded) ── */
  const handleDocxExport = useCallback(async () => {
    try {
      // 1. Await the raw modules without destructuring
      const rawDocx = await import("docx");
      const rawFileSaver = await import("file-saver");

      // 2. Safely unwrap them (bypass TS strict mode to handle Webpack quirks)
      const docx: typeof import("docx") = (rawDocx as any).default || rawDocx;
      const saveAs =
        (rawFileSaver as any).saveAs ||
        ((rawFileSaver as any).default &&
          (rawFileSaver as any).default.saveAs) ||
        (rawFileSaver as any).default;

      if (!saveAs) {
        throw new Error("Could not load file-saver properly");
      }

      // 3. Generate the document
      const paragraphs = markdownToDocxParagraphs(docx, content, styling);

      const doc = new docx.Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      // 4. Pack and save
      const blob = await docx.Packer.toBlob(doc);
      saveAs(blob, `${resolvedFilename}.docx`);
      toast.success(t("export.wordDownloaded"));
    } catch (error) {
      console.error("Failed to generate DOCX:", error);
      toast.error(t("export.docxError"));
    }
  }, [content, resolvedFilename, styling]);

  const [speaking, setSpeaking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [pendingDownload, setPendingDownloadState] = useState<
    "pdf" | "docx" | "excel" | null
  >(null);
  const pendingDownloadRef = useRef(pendingDownload);
  pendingDownloadRef.current = pendingDownload;
  // Grace period ref: ignore scroll events briefly after switching to rename mode
  const scrollGraceRef = useRef(false);

  /** Update pendingDownload state AND ref synchronously to prevent race conditions */
  const setPendingDownload = useCallback(
    (val: "pdf" | "docx" | "excel" | null) => {
      pendingDownloadRef.current = val;
      if (val) {
        scrollGraceRef.current = true;
        setTimeout(() => {
          scrollGraceRef.current = false;
        }, 600);
      }
      setPendingDownloadState(val);
    },
    [],
  );

  // Compute fixed position when menu opens
  useEffect(() => {
    if (!menuOpen || !triggerRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.top,
      left: rect.right,
    });
  }, [menuOpen]);

  // Close menu on outside click or parent scroll
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setMenuOpen(false);
        setPendingDownload(null);
      }
    };
    const scrollHandler = (e: Event) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      if (pendingDownloadRef.current || scrollGraceRef.current) return;
      setMenuOpen(false);
      setPendingDownload(null);
    };
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", scrollHandler, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, [menuOpen]);

  /* ── Text-to-Speech ── */
  const handleTextToSpeech = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const plainText = content
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/^[-*]\s+/gm, "- ")
      .replace(/\|[^|]*\|/g, "")
      .trim();
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [content, speaking]);

  /* ── Share via persistent link (like conversation share) ── */
  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "document",
          title: resolvedFilename,
          content,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.shareUrl) {
        toast.error("Failed to create share link");
        return;
      }
      const shareUrl = data.shareUrl;
      if (navigator.share) {
        await navigator
          .share({ title: resolvedFilename, url: shareUrl })
          .catch(() => {});
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard");
      }
    } catch {
      toast.error("Failed to create share link");
    } finally {
      setSharing(false);
    }
  }, [content, resolvedFilename]);

  if (!content) return null;

  return (
    <div className="mt-2">
      {/* Action row: Copy icon + Share + TTS + Format (if provided) + 3-dot menu */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title={copied ? t("export.copied") : t("export.copy")}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title={sharing ? "Creating public link..." : t("export.share")}
          onClick={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title={speaking ? t("export.stopReading") : t("export.readAloud")}
          onClick={handleTextToSpeech}
        >
          {speaking ? (
            <VolumeX className="h-4 w-4 text-primary" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        {onFormat && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={t("export.format")}
            onClick={() => onFormat(content)}
          >
            <Paintbrush className="h-4 w-4" />
          </Button>
        )}

        {/* 3-dot dropdown menu */}
        <div ref={menuRef}>
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={t("export.moreOptions")}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {menuOpen &&
            menuPos &&
            createPortal(
              <div
                ref={dropdownRef}
                className="fixed bg-popover border border-border rounded-xl shadow-lg py-1 z-[9999] max-h-[70vh] overflow-y-auto scrollbar-none min-w-[180px] sm:min-w-[200px]"
                style={
                  pendingDownload && window.innerWidth < 640
                    ? {
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "240px",
                      }
                    : {
                        bottom: `${window.innerHeight - menuPos.top + 4}px`,
                        right: `${Math.max(8, window.innerWidth - menuPos.left)}px`,
                      }
                }
              >
                {/* Filename rename step — shown only after picking a download type */}
                {pendingDownload ? (
                  <div className="px-3 py-2.5 space-y-2">
                    <label
                      htmlFor="export-filename"
                      className="text-[10px] text-muted-foreground flex items-center gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      {t("export.fileName")}
                    </label>
                    <Input
                      id="export-filename"
                      name="export-filename"
                      type="text"
                      value={exportFileName}
                      onChange={(e) => setExportFileName(e.target.value)}
                      placeholder={dynamicFilename}
                      className="h-7 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (pendingDownload === "pdf") handlePdfExport();
                          else if (pendingDownload === "docx")
                            handleDocxExport();
                          else if (pendingDownload === "excel")
                            handleExcelExport();
                          setPendingDownload(null);
                          setMenuOpen(false);
                        }
                      }}
                    />
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => setPendingDownload(null)}
                      >
                        Back
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs gap-1"
                        onClick={() => {
                          if (pendingDownload === "pdf") handlePdfExport();
                          else if (pendingDownload === "docx")
                            handleDocxExport();
                          else if (pendingDownload === "excel")
                            handleExcelExport();
                          setPendingDownload(null);
                          setMenuOpen(false);
                        }}
                      >
                        <Download className="h-3 w-3" />
                        {t(
                          pendingDownload === "docx"
                            ? "export.downloadWord"
                            : pendingDownload === "excel"
                              ? "export.downloadExcel"
                              : "export.downloadPdf",
                        )
                          .split(" ")
                          .slice(-1)[0] || "Download"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => setPendingDownload("pdf")}
                    >
                      <Download className="h-4 w-4" />
                      {t("export.downloadPdf")}
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => setPendingDownload("docx")}
                    >
                      <Download className="h-4 w-4" />
                      {t("export.downloadWord")}
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => setPendingDownload("excel")}
                      title={
                        hasTable
                          ? "Export table data to Excel"
                          : "Export text to Excel"
                      }
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      {t("export.downloadExcel")}
                    </button>
                    <div className="my-1 border-t border-border/50" />
                    {onFormat && (
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => {
                          onFormat(content);
                          setMenuOpen(false);
                        }}
                      >
                        <Paintbrush className="h-4 w-4" />
                        {t("export.format")}
                      </button>
                    )}
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => {
                        setEmailModalOpen(true);
                        setMenuOpen(false);
                      }}
                    >
                      <Mail className="h-4 w-4" />
                      {t("export.email")}
                    </button>
                    {isSignedIn && tool && (
                      <button
                        type="button"
                        disabled={saving}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
                        onClick={async () => {
                          setSaving(true);
                          try {
                            const res = await fetch("/api/documents", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                title: resolvedFilename,
                                content,
                                tool,
                                docType,
                              }),
                            });
                            if (!res.ok) {
                              const data = await res.json();
                              toast.error(data.error || t("export.saveError"));
                              return;
                            }
                            toast.success(t("export.savedSuccess"));
                          } catch {
                            toast.error(t("export.saveError"));
                          } finally {
                            setSaving(false);
                            setMenuOpen(false);
                          }
                        }}
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "…" : t("export.save")}
                      </button>
                    )}
                  </>
                )}
              </div>,
              document.body,
            )}
        </div>
      </div>

      <EmailDocumentModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        content={content}
        defaultSubject={resolvedFilename}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers: markdown → DOCX nodes                                     */
/* ------------------------------------------------------------------ */

/**  Convert markdown to docx Paragraph/Table nodes with styling support */
function markdownToDocxParagraphs(
  docx: DocxModule,
  md: string,
  styling?: DocumentStyling,
): (
  | InstanceType<DocxModule["Paragraph"]>
  | InstanceType<DocxModule["Table"]>
)[] {
  const {
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
  } = docx;
  const lines = md.split("\n");
  const paragraphs: (
    | InstanceType<typeof Paragraph>
    | InstanceType<typeof Table>
  )[] = [];

  // Convert pt to half-points (docx uses half-points for font size)
  const h1Size = (styling?.h1SizePt || 24) * 2;
  const h2Size = (styling?.h2h3SizePt || 18) * 2;
  const h3Size = (styling?.h2h3SizePt || 18) * 2;
  const bodySize = (styling?.bodyTextSizePt || 12) * 2;
  const fontFamily = styling?.fontFamily || "Arial";
  const lineSpacing = getDocxLineSpacing(styling?.lineSpacing || "1.5");
  const bulletChar = styling
    ? BULLET_SYMBOLS[styling.bulletStyle] || ""
    : "\u2022";

  // Track if we're inside a table
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      const columnCount = tableHeaders.length;
      const cellWidth = Math.floor(9000 / columnCount);

      const borderConfig = {
        top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      };

      // Header row
      const headerRow = new TableRow({
        tableHeader: true,
        children: tableHeaders.map(
          (h) =>
            new TableCell({
              borders: borderConfig,
              width: { size: cellWidth, type: WidthType.DXA },
              shading: { fill: "E8E8E8" },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: h,
                      bold: true,
                      font: fontFamily,
                      size: bodySize,
                    }),
                  ],
                  spacing: lineSpacing,
                }),
              ],
            }),
        ),
      });

      // Body rows
      const bodyDocxRows = tableRows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell, idx) =>
                new TableCell({
                  borders: borderConfig,
                  width: {
                    size: idx < columnCount ? cellWidth : cellWidth,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: parseInlineFormatting(
                        TextRun,
                        cell,
                        fontFamily,
                        bodySize,
                      ),
                      spacing: lineSpacing,
                    }),
                  ],
                }),
            ),
          }),
      );

      paragraphs.push(
        new Table({
          rows: [headerRow, ...bodyDocxRows],
          width: { size: 9000, type: WidthType.DXA },
        }),
      );
    }
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Detect table rows
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      // Skip separator rows (|---|---|)
      if (cells.every((c) => /^[-:\s]+$/.test(c))) {
        inTable = true;
        continue;
      }
      if (!inTable && tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        inTable = true;
        tableRows.push(cells);
      }
      continue;
    } else if (inTable || tableHeaders.length > 0) {
      flushTable();
    }

    if (!trimmed) continue;

    // Headings
    const h1 = trimmed.match(/^# (.+)/);
    if (h1) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: h1[1],
              bold: true,
              size: h1Size,
              font: fontFamily,
            }),
          ],
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    const h2 = trimmed.match(/^## (.+)/);
    if (h2) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: h2[1],
              bold: true,
              size: h2Size,
              font: fontFamily,
            }),
          ],
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    const h3 = trimmed.match(/^### (.+)/);
    if (h3) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [
            new TextRun({
              text: h3[1],
              bold: true,
              size: h3Size,
              font: fontFamily,
            }),
          ],
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    // Bullet points — inject bullet character explicitly
    const bullet = trimmed.match(/^[-*] (.+)/);
    if (bullet) {
      const bulletText = bulletChar ? `${bulletChar} ${bullet[1]}` : bullet[1];
      paragraphs.push(
        new Paragraph({
          children: parseInlineFormatting(
            TextRun,
            bulletText,
            fontFamily,
            bodySize,
          ),
          indent: { left: 360 },
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    // Numbered list
    const numbered = trimmed.match(/^(\d+)\. (.+)/);
    if (numbered) {
      const numText = `${numbered[1]}. ${numbered[2]}`;
      paragraphs.push(
        new Paragraph({
          children: parseInlineFormatting(
            TextRun,
            numText,
            fontFamily,
            bodySize,
          ),
          indent: { left: 360 },
          spacing: lineSpacing,
        }),
      );
      continue;
    }

    // Regular paragraph
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: parseInlineFormatting(TextRun, trimmed, fontFamily, bodySize),
        spacing: { ...lineSpacing, after: 240 },
      }),
    );
  }

  // Flush any remaining table
  if (inTable || tableHeaders.length > 0) flushTable();

  return paragraphs;
}

/** Parse **bold** and *italic* inline formatting into TextRun nodes */
function parseInlineFormatting(
  TextRun: DocxModule["TextRun"],
  text: string,
  fontFamily?: string,
  fontSize?: number,
): InstanceType<DocxModule["TextRun"]>[] {
  const runs: InstanceType<typeof TextRun>[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold + italic
      runs.push(
        new TextRun({
          text: match[2],
          bold: true,
          italics: true,
          font: fontFamily,
          size: fontSize,
        }),
      );
    } else if (match[3]) {
      // Bold
      runs.push(
        new TextRun({
          text: match[3],
          bold: true,
          font: fontFamily,
          size: fontSize,
        }),
      );
    } else if (match[4]) {
      // Italic
      runs.push(
        new TextRun({
          text: match[4],
          italics: true,
          font: fontFamily,
          size: fontSize,
        }),
      );
    } else if (match[5]) {
      // Plain text
      runs.push(
        new TextRun({
          text: match[5],
          font: fontFamily,
          size: fontSize,
        }),
      );
    }
  }

  return runs.length
    ? runs
    : [new TextRun({ text, font: fontFamily, size: fontSize })];
}

/** Convert line spacing string to docx spacing format */
function getDocxLineSpacing(lineSpacing: string) {
  const lineRules: Record<string, { line: number; lineRule: any }> = {
    "1.0": { line: 240, lineRule: "auto" },
    "1.15": { line: 276, lineRule: "auto" },
    "1.5": { line: 360, lineRule: "auto" },
    "2.0": { line: 480, lineRule: "auto" },
  };

  const rule = lineRules[lineSpacing] || lineRules["1.5"];
  return { line: rule.line, lineRule: rule.lineRule };
}
