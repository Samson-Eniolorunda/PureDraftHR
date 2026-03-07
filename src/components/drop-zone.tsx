"use client";

import React, { useCallback, useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/i18n-provider";

/* ------------------------------------------------------------------ */
/*  DropZone — drag-and-drop + click-to-upload for documents & sheets  */
/* ------------------------------------------------------------------ */
interface DropZoneProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
}

const SPREADSHEET_EXTENSIONS = [".csv", ".xlsx", ".xls"];
const SPREADSHEET_MIME_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

function isSpreadsheet(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    SPREADSHEET_EXTENSIONS.some((ext) => name.endsWith(ext)) ||
    SPREADSHEET_MIME_TYPES.includes(file.type)
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const lower = name.toLowerCase();
  if (
    lower.endsWith(".csv") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls")
  ) {
    return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
  }
  if (lower.endsWith(".pdf")) {
    return <File className="h-8 w-8 text-red-500" />;
  }
  return <FileText className="h-8 w-8 text-primary" />;
}

/**
 * Extracts plain text from an uploaded file.
 * Supports: .txt (native), .csv/.xlsx/.xls (via xlsx lib), .pdf and .docx (via server extraction endpoint).
 */
async function extractText(file: File): Promise<string> {
  // Plain text — read directly
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return file.text();
  }

  // Spreadsheets — parse client-side with xlsx
  if (isSpreadsheet(file)) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) throw new Error("Spreadsheet has no sheets");
    return XLSX.utils.sheet_to_csv(firstSheet);
  }

  // For PDF/DOCX, send to our lightweight extraction API
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/extract", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to extract text from file");
  const data = await res.json();
  return data.text ?? "";
}

export function DropZone({ onTextExtracted, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_FILE_SIZE) {
        setError(t("dropzone.fileTooLarge"));
        return;
      }
      setFileName(file.name);
      setFileSize(file.size);
      setLoading(true);
      try {
        const text = await extractText(file);
        onTextExtracted(text);
        toast.success(`${file.name} extracted successfully`);
      } catch (err) {
        const msg =
          err instanceof Error && err.message
            ? err.message
            : "Could not extract text. Try pasting instead.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [onTextExtracted],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 sm:p-8 cursor-pointer transition-all duration-200 min-h-[160px] sm:min-h-[180px]",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01] shadow-md"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf,.docx,.csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        aria-label="Upload a document (PDF, DOCX, TXT, XLSX, CSV)"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            {t("dropzone.extracting")}
          </span>
        </div>
      ) : fileName ? (
        <>
          {getFileIcon(fileName)}
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">
              {fileName}
            </p>
            {fileSize !== null && (
              <p className="text-xs text-muted-foreground">
                {formatFileSize(fileSize)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {t("dropzone.replaceFile")}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
                setFileSize(null);
                onTextExtracted("");
              }}
              aria-label={t("dropzone.removeFile")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <Upload
            className={cn(
              "h-8 w-8 transition-transform duration-200",
              dragging ? "text-primary scale-110" : "text-muted-foreground",
            )}
          />
          <p className="text-sm font-medium">{t("dropzone.dropOrClick")}</p>
          <p className="text-xs text-muted-foreground text-center whitespace-nowrap">
            {t("dropzone.supported")}
          </p>
        </>
      )}

      {error && (
        <p className="text-xs text-destructive mt-1 break-words">{error}</p>
      )}
    </div>
  );
}
