/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | PureDraft HR",
  description:
    "PureDraft HR Privacy Policy - No data storage, stateless processing",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Last updated: February 26, 2026
        </p>
      </div>

      {/* 1 ── Stateless Architecture */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Stateless Architecture &amp; Data Privacy
        </h2>
        <p className="leading-relaxed">
          <strong>PureDraft HR is a 100% stateless application.</strong> We do
          not operate any database, file storage, or persistent backend. All
          document processing happens in-memory during your browser session and
          is permanently discarded when the session ends.
        </p>
      </section>

      {/* 2 ── No Data Storage */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          No Data Storage
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            Uploaded files (PDF, DOCX, TXT) are <strong>never</strong> saved to
            any server or database.
          </li>
          <li>
            Generated documents from any tool — Assistant, Builder, Formatter,
            or Summarizer — are never stored on our infrastructure.
          </li>
          <li>
            All processing is ephemeral; data exists only in-memory for the
            duration of a single request.
          </li>
          <li>
            We do not maintain logs, backups, or historical records of your
            content.
          </li>
        </ul>
      </section>

      {/* 3 ── How Data Is Processed */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          How Your Data Is Processed
        </h2>
        <p className="leading-relaxed">
          PureDraft HR uses the{" "}
          <strong>Google Gemini API (Gemini 2.5 Flash)</strong> for all
          AI-powered features:
        </p>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            <strong>Assistant</strong> — Your prompts and any uploaded reference
            documents are sent to the Gemini API to generate answers, drafts, or
            meeting schedules.
          </li>
          <li>
            <strong>Builder</strong> — Key details you enter (document type,
            tone, employee info) are transmitted to generate a full document.
            Bulk CSV data follows the same flow.
          </li>
          <li>
            <strong>Formatter</strong> — Your raw text and optional reference
            templates are sent for restructuring.
          </li>
          <li>
            <strong>Summarizer</strong> — Uploaded or pasted documents are
            transmitted for summarization.
          </li>
          <li>
            All communication uses <strong>HTTPS encryption</strong>.
          </li>
          <li>
            Google processes the text under their own{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Important:</strong> Gemini AI can make mistakes. Always
            review AI-generated content for accuracy.
          </li>
        </ul>
      </section>

      {/* 4 ── Employee Data Safety */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Employee Data Safety
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            If you include employee names, IDs, salary figures, or other
            personal data, this information is only temporarily processed
            in-memory and never retained.
          </li>
          <li>
            We recommend redacting highly sensitive identifiers (e.g., social
            security numbers) before uploading, as a precaution.
          </li>
          <li>
            Once your browser tab is closed or the session ends, all data is
            gone.
          </li>
        </ul>
      </section>

      {/* 5 ── Browser-Level Data */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Browser-Level Data
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            <strong>Theme preference</strong> (dark/light) is stored in your
            browser&apos;s localStorage.
          </li>
          <li>
            <strong>Saved templates</strong> (My Templates Library) are stored
            in your browser&apos;s localStorage. No template data is ever sent
            to our servers.
          </li>
          <li>No tracking cookies or analytics are deployed.</li>
          <li>No third-party scripts collect your browsing behavior.</li>
        </ul>
      </section>

      {/* 6 ── Third-Party Services */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Third-Party Services
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            <strong>Google Gemini API:</strong> AI-powered document processing.
            See{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google&apos;s Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Vercel:</strong> Secure hosting and API routing. See{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Vercel&apos;s Privacy Policy
            </a>
            .
          </li>
        </ul>
      </section>

      {/* 7 ── Your Rights */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Your Rights
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            Since we do not store personal data, there is nothing to request,
            access, or delete.
          </li>
          <li>You have full control over what data you upload or generate.</li>
          <li>
            Saved Templates in localStorage can be deleted at any time from
            within the app or by clearing your browser data.
          </li>
        </ul>
      </section>

      {/* 8 ── Changes */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Changes to This Policy
        </h2>
        <p className="leading-relaxed">
          We may update this Privacy Policy from time to time to reflect new
          features or legal requirements. Your continued use of PureDraft HR
          constitutes acceptance of any changes. We encourage you to review this
          page periodically.
        </p>
      </section>

      {/* 9 ── Contact */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Contact Us
        </h2>
        <p className="leading-relaxed">
          If you have questions about this Privacy Policy, please{" "}
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
