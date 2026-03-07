"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DropZone } from "@/components/drop-zone";
import { Upload, Type } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DualInput — Tabs component with "Upload File" & "Paste Text"       */
/*  Mobile: auto-scrolls textarea into view when focused               */
/* ------------------------------------------------------------------ */
interface DualInputProps {
  /** Called whenever the user provides text (from file or paste) */
  onTextReady: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Optional pre-filled text (e.g. from another page) */
  initialText?: string;
}

export function DualInput({
  onTextReady,
  disabled,
  placeholder = "Paste your text here…",
  initialText,
}: DualInputProps) {
  const [pastedText, setPastedText] = useState(initialText ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialApplied = useRef(false);

  // Auto-switch to paste tab and prefill when initialText is provided
  useEffect(() => {
    if (initialText && !initialApplied.current) {
      initialApplied.current = true;
      setPastedText(initialText);
      onTextReady(initialText);
    }
  }, [initialText, onTextReady]);

  const handlePasteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setPastedText(val);
      onTextReady(val);
    },
    [onTextReady],
  );

  const handleTextareaFocus = () => {
    // Scroll textarea into view after a small delay to ensure mobile keyboard adjusts
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);
  };

  const handleTextareaBlur = () => {
    // no-op — reserved for future use
  };

  return (
    <Tabs defaultValue={initialText ? "paste" : "upload"} className="w-full">
      <TabsList>
        <TabsTrigger value="upload" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </TabsTrigger>
        <TabsTrigger value="paste" className="gap-2">
          <Type className="h-4 w-4" />
          Paste Text
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <DropZone onTextExtracted={onTextReady} disabled={disabled} />
      </TabsContent>

      <TabsContent value="paste">
        <Textarea
          ref={textareaRef}
          rows={8}
          value={pastedText}
          onChange={handlePasteChange}
          onFocus={handleTextareaFocus}
          onBlur={handleTextareaBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="resize-y min-h-[180px]"
        />
      </TabsContent>
    </Tabs>
  );
}
