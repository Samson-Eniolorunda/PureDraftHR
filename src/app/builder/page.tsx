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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { DocumentFormFooter } from "@/components/document-form-footer";
import { DocumentStylingUI } from "@/components/document-styling-ui";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
import { useDocumentStyling } from "@/hooks/useDocumentStyling";
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
  "Sick Leave Policy",
  "Code of Conduct",
  "Non-Disclosure Agreement",
  "Promotion Announcement",
  "Performance Review",
  "Incident Report",
  "Training Plan",
  "Resignation Letter",
  "Attendance Policy",
  "Confidentiality Agreement",
  "FMLA Notice",
  "Exit Interview Form",
  "Salary Review Memo",
  "Succession Plan",
  "Onboarding Policy",
  "Learning, Development & Capability Policy",
  "Performance Management and Review Policy",
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
  const [keyDetails, setKeyDetails] = useState("");
  const [tone, setTone] = useState<string>(TONES[0]);
  const [referenceText, setReferenceText] = useState("");
  const [isConsented, setIsConsented] = useState(false);
  const [step, setStep] = useState(1); // Wizard step 1-3
  const [minSkeletonDuration, setMinSkeletonDuration] = useState(false); // Ensure skeleton shows for minimum time
  const resultRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/chat",
    body: { tool: "builder", referenceText: referenceText || undefined },
  });

  // Debug logs for messages & loading
  useEffect(() => {
    console.log("Builder useChat state:", { messages, isLoading });
  }, [messages, isLoading]);

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
    (isLoading || showSkeletonPreview) && minSkeletonDuration;

  /** Submit the builder form to the AI */
  const handleGenerate = useCallback(() => {
    console.log("Builder.handleGenerate clicked", {
      docType,
      tone,
      keyDetailsLength: keyDetails.length,
      isConsented,
      isLoading,
    });
    if (!keyDetails.trim() || isLoading || !isConsented) return;

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
  }, [keyDetails, isLoading, append, setMessages, docType, tone, isConsented]);

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

      {/* ── Main Layout: Form + Styling Sidebar ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* ── Left: Wizard Form ── */}
        <div className="space-y-6">
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
                    placeholder={`Example for "${docType}":\n${
                      DOC_TYPE_PLACEHOLDERS[docType] ||
                      "- Provide relevant details for the document…"
                    }`}
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
                    isLoading={isLoading}
                    isConsented={isConsented}
                    onConsentChange={setIsConsented}
                    onReferenceTextChange={setReferenceText}
                    onSubmit={handleGenerate}
                    submitLabel="Generate Document"
                  />
                </>
              )}
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
                <CardContent className="space-y-4">
                  {displayLoading ? (
                    <ResultSkeleton />
                  ) : (
                    <>
                      <MarkdownRenderer
                        content={resultContent}
                        styling={styling}
                      />
                      <ExportButtons
                        content={resultContent}
                        filename={`hr-${docType.toLowerCase().replace(/\s+/g, "-")}`}
                        styling={styling}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ── Right: Styling Sidebar (sticky on lg screens) ── */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
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
        </div>
      </div>
    </div>
  );
}
