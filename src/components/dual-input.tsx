"use client";

import React, { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DropZone } from "@/components/drop-zone";
import { Upload, Type } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DualInput — Tabs component with "Upload File" & "Paste Text"       */
/* ------------------------------------------------------------------ */
interface DualInputProps {
  /** Called whenever the user provides text (from file or paste) */
  onTextReady: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DualInput({
  onTextReady,
  disabled,
  placeholder = "Paste your text here…",
}: DualInputProps) {
  const [pastedText, setPastedText] = useState("");

  const handlePasteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setPastedText(val);
      onTextReady(val);
    },
    [onTextReady],
  );

  return (
    <Tabs defaultValue="upload" className="w-full">
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
          rows={8}
          value={pastedText}
          onChange={handlePasteChange}
          placeholder={placeholder}
          disabled={disabled}
          className="resize-y min-h-[180px]"
        />
      </TabsContent>
    </Tabs>
  );
}
