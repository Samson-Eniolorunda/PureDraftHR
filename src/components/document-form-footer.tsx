"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

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

  const handleReferenceUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingRef(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to extract reference");

      const { text } = await response.json();
      onReferenceTextChange(text);
    } catch (error) {
      console.error("Reference upload error:", error);
      alert("Failed to process reference template");
    } finally {
      setIsProcessingRef(false);
    }
  };

  return (
    <div className="space-y-4 mt-6 pb-4">
      {/* Reference Template Upload (Optional) */}
      <Card className="p-4 bg-muted/50 border-dashed">
        <div className="space-y-2">
          <Label htmlFor="reference-file" className="text-sm font-medium">
            Upload a Reference Template (Optional)
          </Label>
          <p className="text-xs text-muted-foreground">
            Upload an existing document to mimic its structure, tone, and
            formatting style
          </p>
          <div className="relative">
            <input
              id="reference-file"
              type="file"
              accept=".pdf,.docx,.txt"
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
        </div>
      </Card>

      {/* Consent Checkbox */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={isConsented}
            onCheckedChange={onConsentChange}
            disabled={isLoading}
          />
          <Label
            htmlFor="consent"
            className="text-sm cursor-pointer font-normal leading-relaxed"
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
            , and understand this tool temporarily processes data via AI.
          </Label>
        </div>
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
