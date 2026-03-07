"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { DocumentFormFooter } from "@/components/document-form-footer";
import { DocumentStylingUI } from "@/components/document-styling-ui";
import { type LanguageValue } from "@/components/language-selector";
import { Modal } from "@/components/ui/modal";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
import { useDocumentStyling } from "@/hooks/useDocumentStyling";
import {
  Loader2,
  Wand2,
  Upload,
  FileSpreadsheet,
  StopCircle,
  Send,
} from "lucide-react";

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
  "Sick Leave Policy",
  "Code of Conduct",
  "Non-Disclosure Agreement",
  "Promotion Announcement",
  "Performance Review",
  "Incident Report",
  "Interview Notes",
  "Meeting Minutes",
  "Policy Draft",
  "Daily Report",
  "Training Plan",
  "Training Summary",
  "Resignation Letter",
  "Attendance Policy",
  "Confidentiality Agreement",
  "Disciplinary Notice",
  "FMLA Notice",
  "Exit Interview Form",
  "Salary Review Memo",
  "Succession Plan",
  "Onboarding Policy",
  "Learning, Development & Capability Policy",
  "Performance Management and Review Policy",
  "Other (Custom)",
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
/*  Placeholder examples for each document type                       */
/* ------------------------------------------------------------------ */
const DOC_TYPE_PLACEHOLDERS: Record<string, string> = {
  "Offer Letter":
    "- Candidate name: Jane Smith\n- Position: Senior Developer\n- Start date: March 1, 2026\n- Salary: $120,000/year\n- Benefits: Health insurance, 401(k), 20 PTO days",
  "Termination Letter":
    "- Employee name: John Doe\n- Position: Marketing Manager\n- Last day: February 28, 2026\n- Reason: Layoff\n- Final paycheck details and benefits information",
  "Warning Notice":
    "- Employee name: Alice Johnson\n- Position: Sales Associate\n- Issue: Excessive absences\n- Date of incidents: Jan 15, Feb 5, 2026\n- Expected improvements",
  "Employee Handbook Section":
    "- Section topic: Remote Work Policy\n- Key rules: 2 days office minimum, flexibility on timing\n- Exception handling and escalation process",
  "Job Description":
    "- Job title: Product Manager\n- Department: Product\n- Reports to: VP of Product\n- Key responsibilities and required skills\n- Salary range: $100k - $130k",
  "Onboarding Checklist":
    "- Position: Software Engineer\n- First week tasks: system setup, team introductions\n- First month milestones: project assignment, code review\n- Relevant trainings and compliance requirements",
  "Leave Policy":
    "- Policy name: Annual Leave Policy\n- Entitlement: 20 days per year\n- Accrual rate and carryover rules\n- Approval process and documentation",
  "Sick Leave Policy":
    "- Amount: 10 days per year\n- Medical certificate requirements: after 3 consecutive days\n- Pay structure during sick leave\n- Remote work option approval",
  "Code of Conduct":
    "- Core values: integrity, respect, teamwork\n- Key standards: professionalism, confidentiality, anti-discrimination\n- Reporting mechanisms and consequences",
  "Non-Disclosure Agreement":
    "- Parties: Company and Employee\n- Definition of confidential information\n- Duration: 2 years post-employment\n- Permitted disclosures and exceptions",
  "Promotion Announcement":
    "- Employee name: Robert Chen\n- New position: Senior Manager\n- Department: Operations\n- Effective date: March 1, 2026\n- Key achievements that led to promotion",
  "Performance Review":
    "- Employee: Sarah Williams\n- Period: Jan - Dec 2025\n- Rating: Exceeds Expectations\n- Key strengths and areas for development\n- Goals for next year",
  "Incident Report":
    "- Date of incident: February 20, 2026\n- Type: Workplace safety / harassment / property damage\n- Involved parties and witnesses\n- Description and impact\n- Recommended actions",
  "Interview Notes":
    "- Candidate: Maria Lopez\n- Position: Product Designer\n- Date: March 3, 2026\n- Interviewer(s): HR + Hiring Manager\n- Q&A highlights, impression, recommendation",
  "Meeting Minutes":
    "- Meeting title: Q1 Strategy Review\n- Date/Time: March 5, 2026, 10:00 AM\n- Attendees: Leadership team\n- Agenda items, decisions, action items with owners",
  "Policy Draft":
    "- Policy name: Remote Work Policy\n- Effective date: April 1, 2026\n- Purpose and scope\n- Key procedures and compliance requirements",
  "Daily Report":
    "- Date: March 7, 2026\n- Department: Operations\n- Tasks completed, in progress, blockers\n- Upcoming tasks for tomorrow",
  "Training Summary":
    "- Program: Leadership Development Workshop\n- Date: February 28, 2026\n- Participants: 15 managers\n- Topics covered, key learnings, follow-up actions",
  "Disciplinary Notice":
    "- Employee name: Kevin Park\n- Offense: Repeated policy violation\n- Policy violated: Attendance Policy\n- Consequence and appeal process",
  "Training Plan":
    "- Employee: Michael Torres\n- Skill gap: Advanced Excel\n- Training provider: LinkedIn Learning\n- Duration: 8 weeks\n- Success metrics and expectation",
  "Resignation Letter":
    "- Employee name: Emma Davis\n- Position: Business Analyst\n- Last day of work: March 14, 2026\n- Reason: Career change\n- Transition plan and knowledge transfer",
  "Attendance Policy":
    "- Working hours: 9 AM - 5 PM\n- Clock-in/out requirements\n- Late arrival consequences\n- Unauthorized absence protocol\n- Flexibility options",
  "Confidentiality Agreement":
    "- Sensitive information types: client data, trade secrets, financial info\n- Protection measures required\n- Duration and post-employment obligations\n- Permitted disclosures",
  "FMLA Notice":
    "- Employee name: Patricia Martinez\n- Reason: Medical condition / Family care\n- Duration: 12 weeks\n- Benefit continuation during leave\n- Return-to-work date",
  "Exit Interview Form":
    "- Employee: David Thompson\n- Position and tenure\n- Reason for departure\n- Questions about management, work culture, compensation",
  "Salary Review Memo":
    "- Employee: Laura Anderson\n- Current salary: $95,000\n- Proposed increase: 5% to $99,750\n- Merit justification: performance rating, market analysis\n- Effective date",
  "Succession Plan":
    "- Key role: Chief Financial Officer\n- Current holder and retirement date\n- Identified successors: 2-3 candidates\n- Development required and timeline",
  "Onboarding Policy":
    "- Scope: all new hires\n- Duration: 90-day onboarding\n- Responsibilities: managers, HR, team members\n- Completion criteria and documentation",
  "Learning, Development & Capability Policy":
    "- Annual training budget per employee: $2,000\n- Eligible courses: job-related, professional development\n- Approval process and time allocation\n- Success tracking and feedback",
  "Performance Management and Review Policy":
    "- Review frequency: annual with quarterly check-ins\n- Evaluation criteria: goals, competencies, behaviors\n- Rating scale and calibration process\n- Discussion and development planning",
};

/* ------------------------------------------------------------------ */
/*  CSV parsing helper for Bulk Generation                             */
/* ------------------------------------------------------------------ */
function parseCSV(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseRow = (line: string) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseRow(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = values[i] ?? "";
    });
    return record;
  });

  return { headers, rows };
}

/* ------------------------------------------------------------------ */
/*  /builder — AI-powered HR document builder (from scratch)           */
/*                                                                     */
/*  Wizard UI: Doc Type + Key Details + Tone → complete draft          */
/* ------------------------------------------------------------------ */
export default function BuilderPage() {
  const showSkeletonPreview = useDevSkeletonPreview();
  const {
    styling,
    googleFonts,
    webSafeFonts,
    updateFontFamily,
    updateH1Size,
    updateH2H3Size,
    updateBodyTextSize,
    updateLineSpacing,
    updateBulletStyle,
    resetToDefaults,
  } = useDocumentStyling();

  const [docType, setDocType] = useState<string>(DOC_TYPES[0]);
  const [customDocumentType, setCustomDocumentType] = useState("");
  const [keyDetails, setKeyDetails] = useState("");
  const [tone, setTone] = useState<string>(TONES[0]);
  const [language, setLanguage] = useState<LanguageValue>("English");
  const [referenceText, setReferenceText] = useState("");
  const [isConsented, setIsConsented] = useState(false);
  const [step, setStep] = useState(1); // Wizard step 1-3
  const [minSkeletonDuration, setMinSkeletonDuration] = useState(false);
  const [showStylingModal, setShowStylingModal] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const bulkAbortRef = useRef<AbortController | null>(null);

  // Sync language from sidebar via custom event + localStorage
  useEffect(() => {
    const saved = localStorage.getItem("puredraft_language");
    if (saved) setLanguage(saved as LanguageValue);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as LanguageValue;
      if (detail) setLanguage(detail);
    };
    window.addEventListener("puredraft-language-change", handler);
    return () =>
      window.removeEventListener("puredraft-language-change", handler);
  }, []);

  // Bulk CSV state
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkToggleFeedback, setBulkToggleFeedback] = useState<
    "enabled" | "disabled" | null
  >(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<{
    headers: string[];
    rows: Record<string, string>[];
  } | null>(null);
  const [bulkResults, setBulkResults] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  /** Resolved document type — custom string or dropdown value */
  const resolvedDocType =
    docType === "Other (Custom)" && customDocumentType.trim()
      ? customDocumentType.trim()
      : docType === "Other (Custom)"
        ? "Custom HR Document"
        : docType;

  const { messages, isLoading, append, setMessages, stop } = useChat({
    api: "/api/chat",
    body: {
      tool: "builder",
      referenceText: referenceText || undefined,
      language: language !== "English" ? language : undefined,
    },
    onError(err) {
      console.error("[Builder] Stream error:", err);
      const msg = err.message || "";
      if (
        msg.includes("429") ||
        msg.includes("rate") ||
        msg.includes("slow down")
      ) {
        setStreamError(
          "Our AI is currently processing a high volume of documents. Please wait just a few seconds and try again! \u23f3",
        );
      } else {
        setStreamError(
          msg || "An error occurred. The document may be too large.",
        );
      }
    },
  });

  // Manage skeleton minimum display duration (1.5 seconds)
  useEffect(() => {
    if (isLoading || showSkeletonPreview) {
      setMinSkeletonDuration(true);
      const timer = setTimeout(() => setMinSkeletonDuration(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, showSkeletonPreview]);

  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const resultContent = assistantMessage?.content ?? "";
  const displayLoading =
    (isLoading || showSkeletonPreview) && minSkeletonDuration && !resultContent;

  /** Open styling modal instead of generating directly */
  const handleGenerateClick = useCallback(() => {
    if (!keyDetails.trim() || isLoading || !isConsented) return;
    setShowStylingModal(true);
  }, [keyDetails, isLoading, isConsented]);

  /** Confirm styling and trigger the AI stream */
  const handleConfirmGenerate = useCallback(() => {
    setShowStylingModal(false);

    setMessages([]);
    append({
      role: "user",
      content: `Please create the following HR document from scratch:

Document Type: ${resolvedDocType}
Tone: ${tone}
Key Details: ${keyDetails}`,
    });

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [keyDetails, append, setMessages, resolvedDocType, tone, language]);

  /** Send a refinement follow-up */
  const handleRefine = useCallback(() => {
    if (!refineText.trim() || isLoading) return;
    append({
      role: "user",
      content: refineText.trim(),
    });
    setRefineText("");
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [refineText, isLoading, append]);

  /** Handle CSV file upload */
  const handleCsvUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setCsvFile(file);
      const text = await file.text();
      const parsed = parseCSV(text);
      setCsvData(parsed);
    },
    [],
  );

  /** Bulk generate documents from CSV rows */
  const handleBulkGenerate = useCallback(async () => {
    if (!csvData || csvData.rows.length === 0) return;
    setShowStylingModal(false);
    setBulkResults([]);
    setBulkProgress({ current: 0, total: csvData.rows.length });

    const controller = new AbortController();
    bulkAbortRef.current = controller;
    const results: string[] = [];

    for (let i = 0; i < csvData.rows.length; i++) {
      if (controller.signal.aborted) break;
      setBulkProgress({ current: i + 1, total: csvData.rows.length });
      const row = csvData.rows[i];
      const rowDetails = Object.entries(row)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n");

      const combinedDetails = keyDetails.trim()
        ? `${keyDetails}\n\n--- Row ${i + 1} Data ---\n${rowDetails}`
        : rowDetails;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Please create the following HR document from scratch:\n\nDocument Type: ${resolvedDocType}\nTone: ${tone}\nKey Details: ${combinedDetails}`,
              },
            ],
            tool: "builder",
            referenceText: referenceText || undefined,
            language: language !== "English" ? language : undefined,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          results.push(
            `[Error generating document for row ${i + 1}: HTTP ${res.status}]`,
          );
          continue;
        }

        // Read the streaming response fully
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            // Parse Vercel AI SDK data stream format
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("0:")) {
                try {
                  fullText += JSON.parse(line.slice(2));
                } catch {
                  // skip non-JSON lines
                }
              }
            }
          }
        }

        results.push(
          fullText || `[Error generating document for row ${i + 1}]`,
        );

        // Throttle: wait between rows to respect Gemini RPM limits
        if (i < csvData.rows.length - 1 && !controller.signal.aborted) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          results.push(`[Cancelled at row ${i + 1}]`);
          break;
        }
        console.error(`Bulk generation error for row ${i + 1}:`, err);
        results.push(`[Error generating document for row ${i + 1}]`);
      }
    }

    setBulkResults(results);
    setBulkProgress(null);
    bulkAbortRef.current = null;

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [csvData, keyDetails, resolvedDocType, tone, referenceText, language]);

  /** Cancel ongoing bulk generation */
  const handleCancelBulk = useCallback(() => {
    bulkAbortRef.current?.abort();
  }, []);

  /** Can the user proceed to the next step? */
  const canProceed =
    step === 1 ? true : step === 2 ? keyDetails.trim().length > 0 : true;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="text-center sm:text-left">
        <div className="flex items-center gap-2.5 justify-center sm:justify-start">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Document Builder
          </h1>
        </div>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto sm:mx-0">
          Build a complete HR document from scratch. Fill in the details and let
          AI draft it for you.
        </p>
      </div>

      {/* ── Wizard Form ── */}
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Step {step} of 3 —{" "}
              {step === 1
                ? "Document Template"
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-type">Document Template</Label>
                  <Select
                    id="doc-type"
                    value={docType}
                    onChange={(e) => {
                      setDocType(e.target.value);
                      if (e.target.value !== "Other (Custom)")
                        setCustomDocumentType("");
                    }}
                  >
                    {DOC_TYPES.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Custom document type input */}
                {docType === "Other (Custom)" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-doc-type">
                      Custom Document Title
                    </Label>
                    <Input
                      id="custom-doc-type"
                      type="text"
                      value={customDocumentType}
                      onChange={(e) => setCustomDocumentType(e.target.value)}
                      placeholder="Enter custom document title (e.g., Exit Interview Form)..."
                      className="text-sm"
                    />
                  </div>
                )}

                {/* Language selector removed — controlled globally from sidebar */}

                {/* Bulk mode toggle */}
                <div className="rounded-lg border border-dashed p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Label className="text-sm font-medium truncate">
                        Bulk Generation (CSV)
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant={
                        bulkToggleFeedback === "enabled"
                          ? "default"
                          : bulkToggleFeedback === "disabled"
                            ? "outline"
                            : bulkMode
                              ? "default"
                              : "outline"
                      }
                      size="sm"
                      className={`shrink-0 ${
                        bulkToggleFeedback === "enabled"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : bulkToggleFeedback === "disabled"
                            ? "border-red-400 text-red-600 dark:text-red-400"
                            : bulkMode
                              ? "bg-primary text-primary-foreground"
                              : ""
                      }`}
                      onClick={() => {
                        const newMode = !bulkMode;
                        setBulkMode(newMode);
                        setBulkToggleFeedback(newMode ? "enabled" : "disabled");
                        if (!newMode) {
                          setCsvFile(null);
                          setCsvData(null);
                          setBulkResults([]);
                        }
                        setTimeout(() => setBulkToggleFeedback(null), 2000);
                      }}
                    >
                      {bulkToggleFeedback === "enabled"
                        ? "Enabled!"
                        : bulkToggleFeedback === "disabled"
                          ? "Disabled!"
                          : bulkMode
                            ? "Disable"
                            : "Enable"}
                    </Button>
                  </div>

                  {bulkMode && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Upload a CSV with a header row (e.g., Name, Role,
                        Salary, Start Date). A document will be generated for
                        each row.
                      </p>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".csv"
                          title="Upload CSV file for bulk generation"
                          onChange={handleCsvUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          {csvFile ? csvFile.name : "Choose CSV File"}
                        </Button>
                      </div>
                      {csvData && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Parsed {csvData.rows.length} rows with columns:{" "}
                          {csvData.headers.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
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
                  onFocus={(e) =>
                    setTimeout(
                      () =>
                        (e.target as HTMLElement).scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        }),
                      300,
                    )
                  }
                  placeholder={`Example for "${resolvedDocType}":\n${
                    DOC_TYPE_PLACEHOLDERS[resolvedDocType] ||
                    "- Provide relevant details for the document\u2026"
                  }`}
                  className="resize-y min-h-[150px] text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:leading-relaxed"
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
                    <span className="font-medium">Type:</span> {resolvedDocType}
                  </p>
                  <p>
                    <span className="font-medium">Details:</span>{" "}
                    {keyDetails.slice(0, 120)}
                    {keyDetails.length > 120 ? "\u2026" : ""}
                  </p>
                  <p>
                    <span className="font-medium">Tone:</span> {tone}
                  </p>
                  {language !== "English" && (
                    <p>
                      <span className="font-medium">Language:</span> {language}
                    </p>
                  )}
                  {bulkMode && csvData && (
                    <p>
                      <span className="font-medium">Bulk:</span>{" "}
                      {csvData.rows.length} rows from CSV
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons & Final form */}
            {step < 3 ? (
              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  disabled={!canProceed}
                >
                  Next
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-start">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                </div>
                {/* Consent & Reference Template Footer */}
                <DocumentFormFooter
                  isLoading={isLoading || !!bulkProgress}
                  isConsented={isConsented}
                  onConsentChange={setIsConsented}
                  onReferenceTextChange={setReferenceText}
                  onSubmit={handleGenerateClick}
                  submitLabel={
                    bulkMode && csvData
                      ? `Generate ${csvData.rows.length} Documents`
                      : "Generate Document"
                  }
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Result Section ── */}
        <div ref={resultRef}>
          {/* Error banner */}
          {streamError && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {streamError}
              </p>
              <button
                onClick={() => setStreamError(null)}
                aria-label="Dismiss error"
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300 ml-2"
              >
                &times;
              </button>
            </div>
          )}
          {/* Bulk progress indicator */}
          {bulkProgress && (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">
                      Generating document {bulkProgress.current} of{" "}
                      {bulkProgress.total}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please don&apos;t close this page ⏳
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{
                          width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-auto gap-2 shrink-0"
                    onClick={handleCancelBulk}
                  >
                    <StopCircle className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bulk results */}
          {bulkResults.length > 0 && (
            <div className="space-y-4">
              {bulkResults.map((result, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Document {idx + 1} of {bulkResults.length}
                      {csvData?.rows[idx] &&
                        ` — ${Object.values(csvData.rows[idx])[0] || ""}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MarkdownRenderer content={result} styling={styling} />
                    <ExportButtons
                      content={result}
                      filename={`hr-${resolvedDocType.toLowerCase().replace(/\s+/g, "-")}-${idx + 1}`}
                      styling={styling}
                      tool="builder"
                    />
                  </CardContent>
                </Card>
              ))}
              {/* Export all as combined */}
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Export all {bulkResults.length} documents combined:
                  </p>
                  <ExportButtons
                    content={bulkResults.join("\n\n---\n\n# ---\n\n")}
                    filename={`hr-bulk-${resolvedDocType.toLowerCase().replace(/\s+/g, "-")}`}
                    styling={styling}
                    tool="builder"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Single result */}
          {!bulkMode && (resultContent || isLoading) && (
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
              <CardContent className="space-y-4">
                {displayLoading ? (
                  <ResultSkeleton />
                ) : (
                  <>
                    <MarkdownRenderer
                      content={resultContent}
                      styling={styling}
                    />
                    {isLoading && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3 gap-2"
                        onClick={() => stop()}
                      >
                        <StopCircle className="h-4 w-4" />
                        Stop Generating
                      </Button>
                    )}
                    <ExportButtons
                      content={resultContent}
                      filename={`hr-${resolvedDocType.toLowerCase().replace(/\s+/g, "-")}`}
                      styling={styling}
                      tool="builder"
                    />

                    {/* Refine Document — chat-style input */}
                    {!isLoading && resultContent && (
                      <div className="mt-4 relative">
                        <Textarea
                          rows={1}
                          value={refineText}
                          onChange={(e) => setRefineText(e.target.value)}
                          placeholder="Ask to refine this document…"
                          className="resize-none min-h-[42px] max-h-[120px] pr-11 rounded-xl text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleRefine();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={!refineText.trim()}
                          onClick={handleRefine}
                          className="absolute right-1.5 bottom-1.5 h-7 w-7 rounded-lg"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Document Styling Modal ── */}
      <Modal
        open={showStylingModal}
        onClose={() => setShowStylingModal(false)}
        title="Document Styling"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowStylingModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={
                bulkMode && csvData ? handleBulkGenerate : handleConfirmGenerate
              }
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {bulkMode && csvData
                ? `Generate ${csvData.rows.length} Docs`
                : "Confirm & Generate"}
            </Button>
          </>
        }
      >
        <DocumentStylingUI
          styling={styling}
          googleFonts={googleFonts}
          webSafeFonts={webSafeFonts}
          onFontFamilyChange={updateFontFamily}
          onH1SizeChange={updateH1Size}
          onH2H3SizeChange={updateH2H3Size}
          onBodyTextSizeChange={updateBodyTextSize}
          onLineSpacingChange={updateLineSpacing}
          onBulletStyleChange={updateBulletStyle}
          onResetDefaults={resetToDefaults}
        />
      </Modal>
    </div>
  );
}
