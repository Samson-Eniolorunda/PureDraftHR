"use client";

import React, { useCallback, useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  MultiFileDropZone — drag-and-drop for multiple documents           */
/* ------------------------------------------------------------------ */

interface FileEntry {
  id: string;
  file: File;
  status: "pending" | "extracting" | "done" | "error";
  text?: string;
  error?: string;
}

interface MultiFileDropZoneProps {
  onTextsExtracted: (texts: { name: string; text: string }[]) => void;
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

async function extractText(file: File): Promise<string> {
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return file.text();
  }

  if (isSpreadsheet(file)) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) throw new Error("Spreadsheet has no sheets");
    return XLSX.utils.sheet_to_csv(firstSheet);
  }

  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/extract", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to extract text from file");
  const data = await res.json();
  return data.text ?? "";
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 10;

export function MultiFileDropZone({
  onTextsExtracted,
  disabled,
}: MultiFileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (entry: FileEntry) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id ? { ...f, status: "extracting" } : f,
        ),
      );

      try {
        const text = await extractText(entry.file);
        setFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === entry.id ? { ...f, status: "done" as const, text } : f,
          );
          // Emit all completed texts
          const completed = updated
            .filter((f) => f.status === "done" && f.text)
            .map((f) => ({ name: f.file.name, text: f.text! }));
          onTextsExtracted(completed);
          return updated;
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Extraction failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "error" as const, error: msg }
              : f,
          ),
        );
      }
    },
    [onTextsExtracted],
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const currentCount = files.length;
      const accepted = newFiles.slice(0, MAX_FILES - currentCount);

      if (accepted.length < newFiles.length) {
        toast.error(`Maximum ${MAX_FILES} files allowed.`);
      }

      const entries: FileEntry[] = accepted
        .filter((f) => {
          if (f.size > MAX_FILE_SIZE) {
            toast.error(`${f.name} exceeds 25 MB limit.`);
            return false;
          }
          return true;
        })
        .map((f) => ({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          status: "pending" as const,
        }));

      if (entries.length === 0) return;

      setFiles((prev) => [...prev, ...entries]);
      entries.forEach((entry) => processFile(entry));
    },
    [files.length, processFile],
  );

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const updated = prev.filter((f) => f.id !== id);
        const completed = updated
          .filter((f) => f.status === "done" && f.text)
          .map((f) => ({ name: f.file.name, text: f.text! }));
        onTextsExtracted(completed);
        return updated;
      });
    },
    [onTextsExtracted],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 0) addFiles(dropped);
    },
    [addFiles],
  );

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all min-h-[140px]",
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          disabled && "opacity-50 pointer-events-none",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".txt,.pdf,.docx,.csv,.xlsx,.xls"
          aria-label="Upload multiple documents"
          className="hidden"
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            if (selected.length > 0) addFiles(selected);
            e.target.value = "";
          }}
        />

        <Upload className="h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-muted-foreground">
          Up to {MAX_FILES} files &middot; .txt, .pdf, .docx, .xlsx, .csv
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              {entry.status === "extracting" && (
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              )}
              {entry.status === "done" && (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              )}
              {entry.status === "error" && (
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              )}
              {entry.status === "pending" && (
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              )}

              <span className="truncate flex-1">{entry.file.name}</span>

              {entry.status === "error" && (
                <span className="text-xs text-destructive truncate max-w-[120px]">
                  {entry.error}
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(entry.id);
                }}
                aria-label={`Remove ${entry.file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
