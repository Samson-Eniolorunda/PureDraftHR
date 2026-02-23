"use client";

import { useState, useCallback, useRef } from "react";
import { useChat } from "ai/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { Loader2, Wand2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Configuration options for the Builder wizard                       */
/* ------------------------------------------------------------------ */
const DOC_TYPES = [
  "Offer Letter",
  "Termination Letter",
  "Warning Notice",
  "Employee Handbook Section",
  "Job Description",
  "Onboarding Checklist",
  "Leave Policy",
  "Code of Conduct",
  "Non-Disclosure Agreement",
  "Promotion Announcement",
] as const;

const TONES = [
  "Formal",
  "Friendly",
  "Neutral",
  "Empathetic",
  "Authoritative",
  "Encouraging",
] as const;

/* ------------------------------------------------------------------ */
/*  /builder — AI-powered HR document builder (from scratch)           */
/*                                                                     */
/*  Wizard UI: Doc Type + Key Details + Tone → complete draft          */
/* ------------------------------------------------------------------ */
export default function BuilderPage() {
  const [docType, setDocType] = useState<string>(DOC_TYPES[0]);
  const [keyDetails, setKeyDetails] = useState("");
  const [tone, setTone] = useState<string>(TONES[0]);
  const [step, setStep] = useState(1); // Wizard step 1-3
  const resultRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/chat",
    body: { tool: "builder" },
  });

  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const resultContent = assistantMessage?.content ?? "";

  /** Submit the builder form to the AI */
  const handleGenerate = useCallback(() => {
    if (!keyDetails.trim() || isLoading) return;

    setMessages([]);
    append({
      role: "user",
      content: `Please create the following HR document from scratch:

Document Type: ${docType}
Tone: ${tone}
Key Details: ${keyDetails}`,
    });

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [keyDetails, isLoading, append, setMessages, docType, tone]);

  /** Can the user proceed to the next step? */
  const canProceed =
    step === 1 ? true : step === 2 ? keyDetails.trim().length > 0 : true;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Document Builder
        </h1>
        <p className="mt-1 text-muted-foreground">
          Build a complete HR document from scratch. Fill in the details and let
          AI draft it for you.
        </p>
      </div>

      {/* ── Wizard Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Step {step} of 3 —{" "}
            {step === 1
              ? "Document Type"
              : step === 2
                ? "Key Details"
                : "Tone & Generate"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "What kind of HR document do you need?"}
            {step === 2 &&
              "Provide the key information to include in the document."}
            {step === 3 &&
              "Choose the writing tone and generate your document."}
          </CardDescription>

          {/* Step indicator */}
          <div className="flex gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step 1: Document Type */}
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                {DOC_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Step 2: Key Details */}
          {step === 2 && (
            <div className="space-y-2">
              <Label htmlFor="key-details">Key Details</Label>
              <Textarea
                id="key-details"
                rows={6}
                value={keyDetails}
                onChange={(e) => setKeyDetails(e.target.value)}
                placeholder={`Example for "${docType}":\n- Employee name: Jane Smith\n- Position: Senior Developer\n- Start date: March 1, 2026\n- Salary: $120,000/year\n- Any other relevant details…`}
                className="resize-y min-h-[150px]"
              />
            </div>
          )}

          {/* Step 3: Tone */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tone-select">Writing Tone</Label>
                <Select
                  id="tone-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Review summary */}
              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
                <p>
                  <span className="font-medium">Type:</span> {docType}
                </p>
                <p>
                  <span className="font-medium">Details:</span>{" "}
                  {keyDetails.slice(0, 120)}
                  {keyDetails.length > 120 ? "…" : ""}
                </p>
                <p>
                  <span className="font-medium">Tone:</span> {tone}
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Back
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                disabled={!canProceed}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!keyDetails.trim() || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate Document
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Result Section ── */}
      <div ref={resultRef}>
        {(resultContent || isLoading) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Document</CardTitle>
              {isLoading && (
                <CardDescription className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  AI is drafting…
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={resultContent} />
              <ExportButtons
                content={resultContent}
                filename={`hr-${docType.toLowerCase().replace(/\s+/g, "-")}`}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
