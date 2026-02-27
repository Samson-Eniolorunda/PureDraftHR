"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);
      setLoading(true);
      try {
        const text = await extractText(file);
        onTextExtracted(text);
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
        "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors min-h-[180px]",
        dragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf,.docx,.csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {loading ? (
        <div className="animate-pulse text-sm text-muted-foreground">
          Extracting text…
        </div>
      ) : fileName ? (
        <>
          <FileText className="h-8 w-8 text-primary" />
          <p className="text-sm font-medium">{fileName}</p>
          <p className="text-xs text-muted-foreground">
            Click or drop another file to replace
          </p>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drop a file here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: .txt, .pdf, .docx, .xlsx, .csv
          </p>
        </>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
