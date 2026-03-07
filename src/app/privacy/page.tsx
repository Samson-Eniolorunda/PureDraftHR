/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | PureDraft HR",
  description: "PureDraft HR Privacy Policy - How we handle your data",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Last updated: March 7, 2026
        </p>
      </div>

      {/* 1 ── Overview */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Overview
        </h2>
        <p className="leading-relaxed">
          PureDraft HR is an AI-powered HR document platform. We collect only
          the minimum data necessary to provide our services: authentication,
          document storage, and AI-powered generation.
        </p>
      </section>

      {/* 2 ── Account & Authentication */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Account &amp; Authentication
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            User authentication is managed by <strong>Clerk</strong>. When you
            create an account, Clerk stores your email address, name, and
            authentication credentials.
          </li>
          <li>
            You may sign in with email/password or Google OAuth. Clerk handles
            all credential storage and verification.
          </li>
          <li>
            See{" "}
            <a
              href="https://clerk.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Clerk&apos;s Privacy Policy
            </a>{" "}
            for how they manage your authentication data.
          </li>
          <li>
            You can delete your account at any time through your profile
            settings.
          </li>
        </ul>
      </section>

      {/* 3 ── Document Storage */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Document Storage
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            When you save a document from any tool, it is stored in a{" "}
            <strong>Supabase PostgreSQL database</strong> linked to your user
            account.
          </li>
          <li>
            Documents are user-scoped — only you can view, access, or delete
            your saved documents.
          </li>
          <li>
            You can delete any saved document at any time from your Dashboard.
          </li>
          <li>
            Uploaded files (PDF, DOCX, TXT, XLSX, CSV) used for text extraction
            are processed in-memory and <strong>never stored</strong> on our
            servers.
          </li>
        </ul>
      </section>

      {/* 4 ── How Data Is Processed */}
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

      {/* 5 ── Email Services */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Email Services
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            Document sharing via email opens a compose window in your chosen
            email provider (Gmail, Outlook, Yahoo, etc.) — no server-side email
            processing is involved.
          </li>
          <li>Authentication emails (verification codes) are sent by Clerk.</li>
          <li>
            We do not use your email for marketing or share it with third
            parties.
          </li>
        </ul>
      </section>

      {/* 6 ── Rate Limiting */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Rate Limiting
        </h2>
        <p className="leading-relaxed">
          We use <strong>Upstash Redis</strong> to enforce rate limits on AI
          endpoints. This stores only anonymous request counts tied to IP
          addresses — no personal data or document content is stored in Redis.
        </p>
      </section>

      {/* 7 ── Employee Data Safety */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Employee Data Safety
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            If you include employee names, IDs, salary figures, or other
            personal data, this information is processed in-memory and sent to
            the Gemini API for generation. Saved documents may contain this data
            in your database.
          </li>
          <li>
            We recommend redacting highly sensitive identifiers (e.g., social
            security numbers) before uploading, as a precaution.
          </li>
          <li>
            You can delete any saved documents containing sensitive data at any
            time from your Dashboard.
          </li>
        </ul>
      </section>

      {/* 8 ── Browser-Level Data */}
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
          <li>
            <strong>Authentication cookies</strong> are managed by Clerk for
            session management.
          </li>
          <li>No tracking cookies or analytics are deployed.</li>
          <li>No third-party scripts collect your browsing behavior.</li>
        </ul>
      </section>

      {/* 9 ── Third-Party Services */}
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
            <strong>Clerk:</strong> Authentication and user management. See{" "}
            <a
              href="https://clerk.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Clerk&apos;s Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Supabase:</strong> Database hosting for saved documents. See{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Supabase&apos;s Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Upstash:</strong> Rate limiting. See{" "}
            <a
              href="https://upstash.com/trust/privacy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Upstash&apos;s Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Resend:</strong> Email delivery. See{" "}
            <a
              href="https://resend.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Resend&apos;s Privacy Policy
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

      {/* 10 ── Your Rights */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Your Rights
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>
            You can view, export, and delete your saved documents at any time
            from the Dashboard.
          </li>
          <li>
            You can delete your account through Clerk&apos;s user profile
            settings, which will remove your authentication data.
          </li>
          <li>
            Saved Templates in localStorage can be deleted at any time from
            within the app or by clearing your browser data.
          </li>
          <li>
            To request complete deletion of all your data, please{" "}
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact Us
            </Link>
            .
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
