/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";

export const metadata = {
  title: "FAQ | PureDraft HR",
  description: "Frequently Asked Questions about PureDraft HR",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "What is PureDraft HR?",
      a: "PureDraft HR is a free, AI-powered web application for generating, formatting, summarizing, and managing HR documents. It includes four core tools: Assistant (HR Copilot), Builder (document generation), Formatter (reference cloning & restructuring), and Summarizer (document condensation). All processing is powered by the Google Gemini API.",
    },
    {
      q: "Is PureDraft HR really 100% stateless?",
      a: "Yes. We do not store any data on our servers. All processing happens in-memory during your session, and everything is erased when you close the browser or end your session. The only data stored locally is your theme preference and any Saved Templates (in your browser\u2019s localStorage).",
    },
    {
      q: "What happens to my uploaded documents?",
      a: "Your uploaded documents (PDF, DOCX, TXT) are never saved to any database or server. Text is extracted in your browser, sent to the Google Gemini API for processing, and then permanently discarded. Only the session duration matters.",
    },
    {
      q: "What AI model does PureDraft HR use?",
      a: "PureDraft HR uses Google Gemini 2.5 Flash via the Vercel AI SDK. Gemini AI can make mistakes \u2014 always review generated content before using it.",
    },
    {
      q: "Is there a cost to use PureDraft HR?",
      a: "No, PureDraft HR is completely free. It uses Google\u2019s free tier of the Gemini API, which has generous usage limits.",
    },
    {
      q: "What tools are available?",
      a: "There are four main tools:\n\u2022 Assistant \u2014 Ask HR questions, draft emails, chat with uploaded documents, and schedule meetings with Google Calendar / .ics export.\n\u2022 Builder \u2014 Generate complete HR documents from scratch across 25+ types, with optional Bulk CSV mode.\n\u2022 Formatter \u2014 Restructure messy text into professional documents using AI-powered reference template cloning.\n\u2022 Summarizer \u2014 Condense lengthy HR documents into concise summaries.",
    },
    {
      q: "What is the Smart Meeting Scheduler?",
      a: "On the Assistant page, you can ask the AI to schedule a meeting, interview, or appointment. The AI extracts the details and displays a Meeting Card with \u201cAdd to Google Calendar\u201d (opens a pre-filled calendar URL) and \u201cDownload Outlook Invite (.ics)\u201d buttons. No OAuth or backend integration is required.",
    },
    {
      q: "Can I generate documents in other languages?",
      a: "Yes. All four tools support multi-language output. Choose from English, Spanish, French, German, Mandarin Chinese, Portuguese, Arabic, or Hindi via the language selector.",
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
      q: "What is the \u201cOther (Custom)\u201d document type?",
      a: "Both the Builder and Formatter include an \u201cOther (Custom)\u201d option. If the document type or template you need isn\u2019t listed, select this option and type a custom name \u2014 the AI will generate content accordingly.",
    },
    {
      q: "Can I customize document styling?",
      a: "Yes. When you generate a document, a Styling Modal lets you adjust font family (14 options), heading sizes, body text size, line spacing, and bullet styles. All styling is preserved when exporting to PDF, DOCX, or copying to clipboard.",
    },
    {
      q: "What file formats are supported for upload?",
      a: "PDF, DOCX (Word), and TXT files. Text is extracted automatically and processed by the AI.",
    },
    {
      q: "What export formats are available?",
      a: "You can export generated documents as PDF, DOCX (Word), or copy plain text to your clipboard. All exports happen entirely in your browser \u2014 no server processing.",
    },
    {
      q: "Can I use PureDraft HR offline?",
      a: "The UI works offline thanks to our Progressive Web App (PWA) architecture. However, AI generation requires an active internet connection to reach the Google Gemini API.",
    },
    {
      q: "Is the Google Gemini API processing secure?",
      a: "All communication with Google\u2019s Gemini API uses HTTPS encryption. Google\u2019s processing of your data is subject to their own privacy policies. We recommend reviewing Google\u2019s Privacy Policy if you have concerns about sensitive data.",
    },
    {
      q: "Can I trust this tool with sensitive HR documents?",
      a: "PureDraft HR is stateless and does not store data. However, content is temporarily transmitted to Google\u2019s Gemini API. If you have highly sensitive information (e.g., social security numbers), we recommend redacting those values before uploading.",
    },
    {
      q: "Do you track my activity or use analytics?",
      a: "No. We do not use tracking cookies, analytics scripts, or any third-party services to monitor your behavior.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Got a question? We&apos;ve got answers. Learn more about how PureDraft
          HR works.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group border rounded-lg p-4 hover:bg-accent/50 transition-colors"
          >
            <summary className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100 group-open:text-primary">
              {faq.q}
            </summary>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {faq.a}
            </p>
          </details>
        ))}
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Still have questions?
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          If you have any other questions or need support, please{" "}
          <Link
            href="/contact"
            className="text-primary hover:underline font-medium"
          >
            Contact Us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
