"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  DropZone — drag-and-drop + click-to-upload for .txt, .pdf, .docx   */
/* ------------------------------------------------------------------ */
interface DropZoneProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
}

/**
 * Extracts plain text from an uploaded file.
 * Supports: .txt (native), .pdf and .docx (via server extraction endpoint).
 */
async function extractText(file: File): Promise<string> {
  // Plain text — read directly
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return file.text();
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
      } catch {
        setError("Could not extract text. Try pasting instead.");
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
        accept=".txt,.pdf,.docx"
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
            Supported: .txt, .pdf, .docx
          </p>
        </>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
