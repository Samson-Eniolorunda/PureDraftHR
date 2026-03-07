/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";

export const metadata = {
  title: "FAQ | PureDraft HR",
  description: "Frequently Asked Questions about PureDraft HR",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  const faqs = [
    {
      q: "What is PureDraft HR?",
      a: "PureDraft HR is a free, AI-powered web application for generating, formatting, summarizing, and managing HR documents. It includes four core tools: Assistant (HR Copilot), Builder (document generation), Formatter (reference cloning & restructuring), and Summarizer (document condensation). All AI processing is powered by the Google Gemini API.",
    },
    {
      q: "Do I need an account to use PureDraft HR?",
      a: "No \u2014 you can use all four tools (Formatter, Builder, Summarizer, Assistant) without signing in. However, creating a free account lets you save documents to your Dashboard and access them later.",
    },
    {
      q: "How does authentication work?",
      a: "PureDraft HR uses Clerk for authentication. You can sign up with your email address (with verification code) or sign in with Google. Your account lets you save and manage documents from the Dashboard.",
    },
    {
      q: "What happens to my saved documents?",
      a: "Saved documents are stored in a secure database (Supabase PostgreSQL) linked to your account. Only you can view or delete your documents. You can manage them from the Dashboard page.",
    },
    {
      q: "What happens to my uploaded files?",
      a: "Uploaded files (PDF, DOCX, TXT, XLSX, CSV) are processed in-memory for text extraction and are never stored on our servers. The extracted text is sent to the Google Gemini API for processing.",
    },
    {
      q: "What AI model does PureDraft HR use?",
      a: "PureDraft HR uses Google Gemini 2.5 Flash via the Vercel AI SDK. Gemini AI can make mistakes \u2014 always review generated content before using it.",
    },
    {
      q: "Is there a cost to use PureDraft HR?",
      a: "No, PureDraft HR is completely free. It uses free tiers of Google Gemini, Clerk, Supabase, and Upstash.",
    },
    {
      q: "What tools are available?",
      a: "There are four main tools:\n\u2022 Assistant \u2014 Ask HR questions, draft emails, chat with uploaded documents, use voice-to-text input, and schedule meetings with Google Calendar / .ics export.\n\u2022 Builder \u2014 Generate complete HR documents from scratch across 31 document templates, with optional Bulk CSV mode.\n\u2022 Formatter \u2014 Upload or paste unstructured text and let AI restructure it into a clean, professional document.\n\u2022 Summarizer \u2014 Condense lengthy HR documents into concise summaries.",
    },
    {
      q: "What is the Smart Meeting Scheduler?",
      a: "On the Assistant page, you can ask the AI to schedule a meeting, interview, or appointment. The AI extracts the details and displays a Meeting Card with \u201cAdd to Google Calendar\u201d (opens a pre-filled calendar URL) and \u201cDownload Outlook Invite (.ics)\u201d buttons. No OAuth or backend integration is required.",
    },
    {
      q: "Can I generate documents in other languages?",
      a: "Yes. All four tools support multi-language output. Choose from English, Spanish, French, German, Mandarin Chinese, Portuguese, Arabic, or Hindi via the language selector in the sidebar.",
    },
    {
      q: "What is the My Templates Library?",
      a: "The My Templates Library lets you save reference text snippets to your browser\u2019s localStorage so you can reuse them later. Templates persist across sessions but are local to your browser \u2014 nothing is sent to a server. You can save, load, and delete templates from the Formatter, Builder, and Summarizer pages.",
    },
    {
      q: "Can I generate multiple documents at once?",
      a: "Yes. The Builder supports Bulk CSV Generation. Upload a CSV file where each row contains document-specific details, and the Builder will generate one document per row with a live progress bar.",
    },
    {
      q: "What is the \u201cOther (Custom)\u201d document template?",
      a: "The Builder includes an \u201cOther (Custom)\u201d option. If the document template you need isn\u2019t listed, select this option and type a custom name \u2014 the AI will generate content accordingly.",
    },
    {
      q: "Can I customize document styling?",
      a: "Yes. When you generate a document, a Styling Modal lets you adjust font family (14 options), heading sizes, body text size, line spacing, and bullet styles. All styling is preserved when exporting to PDF, DOCX, or copying to clipboard.",
    },
    {
      q: "What file formats are supported for upload?",
      a: "PDF, DOCX (Word), TXT, XLSX and CSV files. Text is extracted automatically and processed by the AI.",
    },
    {
      q: "What export formats are available?",
      a: "You can export generated documents as PDF, DOCX (Word), or copy plain text to your clipboard. You can also email documents directly from the app and save them to your Dashboard. All exports happen entirely in your browser \u2014 no server processing.",
    },
    {
      q: "Can I email a document to someone?",
      a: "Yes. Each tool has an \u201cEmail Document\u201d option. Choose your email provider (Gmail, Outlook, Yahoo, Zoho, ProtonMail, or your default email app) and the document is pre-filled in a compose window ready to send.",
    },
    {
      q: "Can I use PureDraft HR offline?",
      a: "The UI works offline thanks to our Progressive Web App (PWA) architecture. However, AI generation, document saving, and authentication require an active internet connection.",
    },
    {
      q: "Is the Google Gemini API processing secure?",
      a: "All communication with Google\u2019s Gemini API uses HTTPS encryption. Google\u2019s processing of your data is subject to their own privacy policies. We recommend reviewing Google\u2019s Privacy Policy if you have concerns about sensitive data.",
    },
    {
      q: "Can I trust this tool with sensitive HR documents?",
      a: "Uploaded files are never stored on our servers. Saved documents are stored securely in a user-scoped database. However, content is transmitted to Google\u2019s Gemini API for processing. If you have highly sensitive information (e.g., social security numbers), we recommend redacting those values before uploading.",
    },
    {
      q: "Can I delete my account and data?",
      a: "Yes. You can delete saved documents from your Dashboard at any time. You can also delete your account through your profile settings. For complete data removal, contact us via the Contact page.",
    },
    {
      q: "Do you track my activity or use analytics?",
      a: "No. We do not use tracking cookies, analytics scripts, or any third-party services to monitor your behavior.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 px-6 py-8 sm:px-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Got a question? We&apos;ve got answers. Learn more about how PureDraft
          HR works.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:border-primary/30"
          >
            <summary className="cursor-pointer flex items-center justify-between gap-3 px-5 py-4 text-sm sm:text-base font-medium select-none group-open:text-primary transition-colors">
              <span>{faq.q}</span>
              <svg
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="px-5 pb-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {faq.a}
              </p>
            </div>
          </details>
        ))}
      </div>

      <section className="rounded-xl border border-border/60 bg-card p-6 text-center space-y-2">
        <h2 className="text-lg font-semibold">Still have questions?</h2>
        <p className="text-sm text-muted-foreground">
          If you have any other questions or need support, please{" "}
          <Link
            href="/contact"
            className="text-primary hover:underline font-medium"
          >
            Contact Us
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
