/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";

export const metadata = {
  title: "Terms of Service | PureDraft HR",
  description: "PureDraft HR Terms of Service",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Last updated: February 26, 2026
        </p>
      </div>

      {/* 1 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          1. Agreement to Terms
        </h2>
        <p className="leading-relaxed">
          By accessing and using PureDraft HR, you accept and agree to be bound
          by these Terms of Service. If you do not agree, please discontinue use
          of the application immediately.
        </p>
      </section>

      {/* 2 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          2. Description of Service
        </h2>
        <p className="leading-relaxed">
          PureDraft HR is a stateless, AI-powered web application for
          generating, formatting, summarizing, and managing HR documents. The
          platform includes the following core tools:
        </p>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            <strong>Assistant (HR Copilot)</strong> — Ask HR questions, draft
            workplace emails, chat with uploaded documents, and use the Smart
            Meeting Scheduler to create calendar events.
          </li>
          <li>
            <strong>Builder</strong> — Generate complete HR documents from
            scratch across 25+ document types with optional Bulk CSV generation.
          </li>
          <li>
            <strong>Formatter</strong> — Restructure messy text into
            professionally formatted documents using AI-powered reference
            template cloning.
          </li>
          <li>
            <strong>Summarizer</strong> — Condense lengthy HR documents into
            concise, human-sounding summaries.
          </li>
        </ul>
        <p className="leading-relaxed">
          Additional features include multi-language translation (8 languages),
          a My Templates Library (localStorage-based), customizable document
          styling, and client-side export to PDF, DOCX, and clipboard.
        </p>
      </section>

      {/* 3 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          3. Stateless Processing &amp; No Storage
        </h2>
        <p className="leading-relaxed">
          <strong>PureDraft HR is architecturally stateless.</strong>
        </p>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            No employee data, uploaded files, or generated text is ever stored
            on any server or database.
          </li>
          <li>
            All data processing occurs temporarily, in-memory, during your
            active session only.
          </li>
          <li>
            When your browser session ends, all data is permanently erased.
          </li>
          <li>
            You are solely responsible for saving copies of any generated
            documents via the export buttons (PDF, DOCX, Copy).
          </li>
        </ul>
      </section>

      {/* 4 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          4. Google Gemini AI Processing &amp; Accuracy Disclaimer
        </h2>
        <p className="leading-relaxed">
          <strong>
            PureDraft HR uses the Google Gemini API (Gemini 2.5 Flash)
          </strong>{" "}
          to power all AI features across the Assistant, Builder, Formatter, and
          Summarizer tools. Please be aware:
        </p>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            <strong>Gemini AI can make mistakes.</strong> Generated content may
            contain errors, inaccuracies, or incomplete information.
          </li>
          <li>
            You are solely responsible for reviewing all AI-generated documents
            before using them for any purpose.
          </li>
          <li>
            Always verify facts, figures, dates, and legal language with
            qualified subject matter experts.
          </li>
          <li>
            PureDraft HR and Google disclaim liability for errors or omissions
            in AI-generated output.
          </li>
          <li>
            Do not rely solely on AI-generated documents for legal, compliance,
            or critical HR decisions.
          </li>
          <li>
            The Smart Meeting Scheduler generates calendar links and .ics files
            based on AI-extracted dates — always verify the event details before
            sending invites.
          </li>
        </ul>
      </section>

      {/* 5 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          5. Use License
        </h2>
        <p className="leading-relaxed">
          Permission is granted to use PureDraft HR for personal and
          professional HR document generation. Under this license you may not:
        </p>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            Attempt to reverse engineer, decompile, or extract source code from
            the hosted service.
          </li>
          <li>
            Use the application for unlawful purposes or to generate content
            that violates applicable laws.
          </li>
          <li>Redistribute or resell the service without authorization.</li>
        </ul>
      </section>

      {/* 6 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          6. Disclaimer of Warranties
        </h2>
        <p className="leading-relaxed">
          PureDraft HR is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis. We make no warranties, expressed or implied,
          regarding merchantability, fitness for a particular purpose, or
          non-infringement.
        </p>
      </section>

      {/* 7 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          7. Limitations of Liability
        </h2>
        <p className="leading-relaxed">
          In no event shall PureDraft HR or its contributors be liable for any
          damages — including loss of data, profit, or business interruption —
          arising from the use or inability to use the application, even if
          advised of the possibility of such damage.
        </p>
      </section>

      {/* 8 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          8. Content Ownership
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            You retain all rights to any documents you upload or generate.
          </li>
          <li>
            By using PureDraft HR, you grant us temporary permission to process
            your content solely for generating the requested output.
          </li>
          <li>We do not claim ownership of any documents you create.</li>
        </ul>
      </section>

      {/* 9 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          9. Limitations on Use
        </h2>
        <p className="leading-relaxed">You agree not to:</p>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            Use the application to generate harassing, obscene, or
            discriminatory content.
          </li>
          <li>Disrupt the normal operation of the service.</li>
          <li>
            Use the app for illegal activities or in violation of any applicable
            laws.
          </li>
        </ul>
      </section>

      {/* 10 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          10. Governing Law
        </h2>
        <p className="leading-relaxed">
          These Terms are governed by and construed in accordance with the laws
          of the jurisdiction where the service is provided, and you irrevocably
          submit to the exclusive jurisdiction of the courts in that location.
        </p>
      </section>

      {/* 11 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          11. Changes to Terms
        </h2>
        <p className="leading-relaxed">
          PureDraft HR reserves the right to update these Terms at any time.
          Your continued use of the application following any changes
          constitutes acceptance of the revised Terms.
        </p>
      </section>

      {/* 12 ── Contact */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          12. Contact
        </h2>
        <p className="leading-relaxed">
          If you have any questions about these Terms, please{" "}
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
