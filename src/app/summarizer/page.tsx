"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DualInput } from "@/components/dual-input";
import { MultiFileDropZone } from "@/components/multi-file-drop-zone";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ExportButtons } from "@/components/export-buttons";
import { DocumentFormFooter } from "@/components/document-form-footer";
import { type LanguageValue } from "@/components/language-selector";
import { ResultSkeleton } from "@/components/ui/skeleton-loaders";
import { useDevSkeletonPreview } from "@/hooks/useDevSkeletonPreview";
import {
  Loader2,
  Wand2,
  StopCircle,
  Paintbrush,
  FileStack,
  FileText,
  Send,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* /summarizer — AI-powered HR document summarizer                    */
/* ------------------------------------------------------------------ */
export default function SummarizerPage() {
  const router = useRouter();
  const showSkeletonPreview = useDevSkeletonPreview();

  const [inputText, setInputText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [isConsented, setIsConsented] = useState(false);
  const [language, setLanguage] = useState<LanguageValue>("English");
  const [refineText, setRefineText] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [batchFiles, setBatchFiles] = useState<
    { name: string; text: string }[]
  >([]);
  const resultRef = useRef<HTMLDivElement>(null);

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

  const { messages, isLoading, append, setMessages, stop } = useChat({
    api: "/api/chat",
    body: {
      tool: "summarizer",
      referenceText: referenceText || undefined,
      language: language !== "English" ? language : undefined,
    },
    onError(err) {
      console.error("[Summarizer] Stream error:", err);
      const msg = err.message || "";
      if (
        msg.includes("429") ||
        msg.includes("rate") ||
        msg.includes("slow down")
      ) {
        setStreamError(
          "Our AI is currently processing a high volume of documents. Please wait just a few seconds and try again! ⏳",
        );
      } else {
        setStreamError(
          msg || "An error occurred. The document may be too large.",
        );
      }
    },
  });

  // Extract the latest assistant message (the streamed summary)
  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const resultContent = assistantMessage?.content ?? "";
  const displayLoading = (isLoading || showSkeletonPreview) && !resultContent;

  /** Trigger the AI stream directly */
  const handleSummarizeClick = useCallback(() => {
    const isBatch = mode === "batch";
    const textToSummarize = isBatch
      ? batchFiles
          .map((f, i) => `--- Document ${i + 1}: ${f.name} ---\n\n${f.text}`)
          .join("\n\n")
      : inputText;

    if (!textToSummarize.trim() || isLoading || !isConsented) return;

    // Reset previous conversation and send the new text
    setMessages([]);
    const prompt = isBatch
      ? `Please summarize each of the following ${batchFiles.length} HR documents. Provide a separate summary section for each document, clearly labelled with the document name:\n\n${textToSummarize}`
      : `Please summarize the following HR document:\n\n${textToSummarize}`;
    append({ role: "user", content: prompt });

    // Scroll to result area after a short delay
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [
    inputText,
    batchFiles,
    mode,
    isLoading,
    isConsented,
    append,
    setMessages,
  ]);

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

  // Push to Formatter Action
  const handleRouteToFormatter = (text: string) => {
    localStorage.setItem("puredraft_formatter_payload", text);
    router.push("/formatter"); // Navigates to your formatter page
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="text-center sm:text-left">
        <div className="flex items-center gap-2.5 justify-center sm:justify-start">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileStack className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Document Summarizer
          </h1>
        </div>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto sm:mx-0">
          Paste or upload a lengthy HR document and get a clear, human-sounding
          summary in seconds.
        </p>
      </div>

      {/* ── Form & Results ── */}
      <div className="space-y-6 max-w-3xl">
        {/* ── Input Section ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Input</CardTitle>
            <CardDescription>
              Upload a file (.txt, .pdf, .docx) or paste your text directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Single / Batch toggle */}
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "single" | "batch")}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="single" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Single
                </TabsTrigger>
                <TabsTrigger value="batch" className="gap-2">
                  <FileStack className="h-4 w-4" />
                  Batch
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <DualInput
                  onTextReady={setInputText}
                  disabled={isLoading}
                  placeholder="Paste the full text of the HR document you want summarized…"
                />
              </TabsContent>

              <TabsContent value="batch">
                <MultiFileDropZone
                  onTextsExtracted={setBatchFiles}
                  disabled={isLoading}
                />
                {batchFiles.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {batchFiles.length} document{batchFiles.length !== 1 && "s"}{" "}
                    ready for summarization
                  </p>
                )}
              </TabsContent>
            </Tabs>

            {/* Language selector removed — controlled globally from sidebar */}

            {/* Consent & Reference Template Footer */}
            <DocumentFormFooter
              isLoading={isLoading}
              isConsented={isConsented}
              onConsentChange={setIsConsented}
              onReferenceTextChange={setReferenceText}
              onSubmit={handleSummarizeClick}
              submitLabel="Summarize"
            />
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

          {(resultContent || isLoading) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {mode === "batch" ? "Batch Summary" : "Summary"}
                </CardTitle>
                {isLoading && (
                  <CardDescription className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    AI is writing…
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {displayLoading ? (
                  <ResultSkeleton />
                ) : (
                  <>
                    <MarkdownRenderer content={resultContent} />
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

                    {!isLoading && resultContent && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
                        <ExportButtons
                          content={resultContent}
                          filename="hr-summary"
                          tool="summarizer"
                        />
                        <Button
                          variant="secondary"
                          onClick={() => handleRouteToFormatter(resultContent)}
                          className="gap-2"
                        >
                          <Paintbrush className="h-4 w-4" />
                          Format Document
                        </Button>
                      </div>
                    )}

                    {/* Refine Summary — chat-style input */}
                    {!isLoading && resultContent && (
                      <div className="mt-4 relative">
                        <Textarea
                          rows={1}
                          value={refineText}
                          onChange={(e) => setRefineText(e.target.value)}
                          placeholder="Ask to refine this summary…"
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
    </div>
  );
}
