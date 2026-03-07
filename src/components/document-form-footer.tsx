"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, CheckCircle, X } from "lucide-react";
import { TemplateLibrary } from "@/components/template-library";

interface DocumentFormFooterProps {
  isLoading: boolean;
  isConsented: boolean;
  onConsentChange: (checked: boolean) => void;
  onReferenceTextChange: (text: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
}

export function DocumentFormFooter({
  isLoading,
  isConsented,
  onConsentChange,
  onReferenceTextChange,
  onSubmit,
  submitLabel = "Generate",
}: DocumentFormFooterProps) {
  const [isProcessingRef, setIsProcessingRef] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileText, setUploadedFileText] = useState<string>("");
  const [pastedRefText, setPastedRefText] = useState<string>("");
  const [refUploadError, setRefUploadError] = useState<string | null>(null);

  /** Combine file + pasted reference: pasted text takes priority, or combine */
  const updateCombinedReference = (fileText: string, pastedText: string) => {
    if (pastedText.trim() && fileText.trim()) {
      onReferenceTextChange(
        pastedText.trim() + "\n\n---\n\n" + fileText.trim(),
      );
    } else if (pastedText.trim()) {
      onReferenceTextChange(pastedText.trim());
    } else if (fileText.trim()) {
      onReferenceTextChange(fileText.trim());
    } else {
      onReferenceTextChange("");
    }
  };

  const handleReferenceUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingRef(true);
    setRefUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to extract reference");

      const { text } = await response.json();
      setUploadedFileName(file.name);
      setUploadedFileText(text);
      updateCombinedReference(text, pastedRefText);
    } catch (error) {
      console.error("Reference upload error:", error);
      setRefUploadError(
        "Failed to process reference template. Please try a different file.",
      );
    } finally {
      setIsProcessingRef(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName(null);
    setUploadedFileText("");
    updateCombinedReference("", pastedRefText);
  };

  const handlePastedRefChange = (val: string) => {
    setPastedRefText(val);
    updateCombinedReference(uploadedFileText, val);
  };

  return (
    <div className="space-y-4 mt-6 pb-4">
      {/* Reference Template Upload (Optional) */}
      <Card className="p-4 bg-muted/50 border-dashed">
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Reference Template (Optional)
          </Label>
          <p className="text-xs text-muted-foreground">
            Upload a document or paste text to mimic its structure, tone, and
            formatting style
          </p>

          {/* File Upload */}
          {uploadedFileName ? (
            /* Success state — show uploaded file */
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400 truncate flex-1">
                {uploadedFileName} uploaded successfully
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={handleRemoveFile}
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            /* Upload button */
            <div className="relative">
              <input
                id="reference-file"
                type="file"
                accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                title="Upload a reference template"
                onChange={handleReferenceUpload}
                disabled={isProcessingRef || isLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isProcessingRef || isLoading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isProcessingRef ? "Processing..." : "Choose Reference File"}
              </Button>
            </div>
          )}

          {/* Reference upload error */}
          {refUploadError && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded-md">
              {refUploadError}
            </p>
          )}

          {/* Plain Text Reference Textarea */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reference-paste"
              className="text-xs text-muted-foreground"
            >
              Or paste reference template text:
            </Label>
            <Textarea
              id="reference-paste"
              rows={3}
              value={pastedRefText}
              onChange={(e) => handlePastedRefChange(e.target.value)}
              placeholder="Paste a reference format or template text here..."
              disabled={isLoading}
              className="resize-y min-h-[70px] text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Template Library — save/select reusable templates */}
      <TemplateLibrary
        onTemplateSelect={(text) => {
          setPastedRefText(text);
          updateCombinedReference(uploadedFileText, text);
        }}
        currentReferenceText={pastedRefText || uploadedFileText}
        disabled={isLoading}
      />

      {/* Consent Checkbox */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Checkbox
            id="consent"
            checked={isConsented}
            onCheckedChange={onConsentChange}
            disabled={isLoading}
            className="mt-0.5 shrink-0"
          />
          <Label
            htmlFor="consent"
            className="text-xs sm:text-sm cursor-pointer font-normal leading-relaxed"
          >
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Privacy Policy
            </a>
            , and understand this tool uses PureDraft AI which can make
            mistakes.
          </Label>
        </div>
      </div>

      {/* AI Disclaimer */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50">
        <p>
          Note: PureDraft AI is used to generate documents. Always review the
          output for accuracy before using.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={!isConsented || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? "Processing..." : submitLabel}
      </Button>
    </div>
  );
}
