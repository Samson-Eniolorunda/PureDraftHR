/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | PureDraft HR",
  description: "PureDraft HR Privacy Policy - How we handle your data",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 px-6 py-8 sm:px-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 7, 2026
        </p>
      </div>

      {/* 1 ── Overview */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">Overview</h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          PureDraft HR is an AI-powered HR document platform. We collect only
          the minimum data necessary to provide our services: authentication,
          document storage, and AI-powered generation.
        </p>
      </section>

      {/* 2 ── Account & Authentication */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          Account &amp; Authentication
        </h2>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              User authentication is managed by{" "}
              <strong className="text-foreground">Clerk</strong>. When you
              create an account, Clerk stores your email address, name, and
              authentication credentials.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You may sign in with email/password or Google OAuth. Clerk handles
              all credential storage and verification.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              See{" "}
              <a
                href="https://clerk.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Clerk&apos;s Privacy Policy
              </a>{" "}
              for how they manage your authentication data.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You can delete your account at any time through your profile
              settings.
            </span>
          </li>
        </ul>
      </section>

      {/* 3 ── Document Storage */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">Document Storage</h2>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              When you save a document, it is stored in a{" "}
              <strong className="text-foreground">
                Supabase PostgreSQL database
              </strong>{" "}
              linked to your user account.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Documents are user-scoped — only you can view, access, or delete
              your saved documents.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You can delete any saved document at any time from your Dashboard.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Uploaded files (PDF, DOCX, TXT, XLSX, CSV) used for text
              extraction are processed in-memory and{" "}
              <strong className="text-foreground">never stored</strong> on our
              servers.
            </span>
          </li>
        </ul>
      </section>

      {/* 4 ── How Data Is Processed */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          How Your Data Is Processed
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          PureDraft HR uses the{" "}
          <strong className="text-foreground">
            Google Gemini API (Gemini 2.5 Flash)
          </strong>{" "}
          for all AI-powered features:
        </p>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Assistant</strong> — Your
              prompts and any uploaded reference documents are sent to the
              Gemini API to generate answers, drafts, or meeting schedules.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Builder</strong> — Key details
              you enter (document type, tone, employee info) are transmitted to
              generate a full document. Bulk CSV data follows the same flow.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Formatter</strong> — Your raw
              text and optional reference templates are sent for restructuring.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Summarizer</strong> — Uploaded
              or pasted documents are transmitted for summarization.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              All communication uses{" "}
              <strong className="text-foreground">HTTPS encryption</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Google processes the text under their own{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Privacy Policy
              </a>
              .
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Important:</strong> Gemini AI
              can make mistakes. Always review AI-generated content for
              accuracy.
            </span>
          </li>
        </ul>
      </section>

      {/* 5 ── Email Services */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">Email Services</h2>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Document sharing via email opens a compose window in your chosen
              email provider (Gmail, Outlook, Yahoo, etc.) — no server-side
              email processing is involved.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Authentication emails (verification codes) are sent by Clerk.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              We do not use your email for marketing or share it with third
              parties.
            </span>
          </li>
        </ul>
      </section>

      {/* 6 ── Rate Limiting */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">Rate Limiting</h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          We use <strong className="text-foreground">Upstash Redis</strong> to
          enforce rate limits on AI endpoints. This stores only anonymous
          request counts tied to IP addresses — no personal data or document
          content is stored in Redis.
        </p>
      </section>

      {/* 7 ── Employee Data Safety */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          Employee Data Safety
        </h2>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              If you include employee names, IDs, salary figures, or other
              personal data, this information is processed in-memory and sent to
              the Gemini API for generation. Saved documents may contain this
              data in your database.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              We recommend redacting highly sensitive identifiers (e.g., social
              security numbers) before uploading, as a precaution.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You can delete any saved documents containing sensitive data at
              any time from your Dashboard.
            </span>
          </li>
        </ul>
      </section>

      {/* 8 ── Browser-Level Data */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">Browser-Level Data</h2>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Theme preference</strong>{" "}
              (dark/light) is stored in your browser&apos;s localStorage.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Saved templates</strong> (My
              Templates Library) are stored in your browser&apos;s localStorage.
              No template data is ever sent to our servers.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">
                Authentication cookies
              </strong>{" "}
              are managed by Clerk for session management.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>No tracking cookies or analytics are deployed.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>No third-party scripts collect your browsing behavior.</span>
          </li>
        </ul>
      </section>

      {/* 9 ── Third-Party Services */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          Third-Party Services
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              name: "Google Gemini API",
              desc: "AI-powered document processing",
              url: "https://policies.google.com/privacy",
            },
            {
              name: "Clerk",
              desc: "Authentication & user management",
              url: "https://clerk.com/legal/privacy",
            },
            {
              name: "Supabase",
              desc: "Database hosting for saved documents",
              url: "https://supabase.com/privacy",
            },
            {
              name: "Upstash",
              desc: "Rate limiting",
              url: "https://upstash.com/trust/privacy.pdf",
            },
            {
              name: "Vercel",
              desc: "Secure hosting & API routing",
              url: "https://vercel.com/legal/privacy-policy",
            },
          ].map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border/60 bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                {s.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* 10 ── Your Rights */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">Your Rights</h2>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You can view, export, and delete your saved documents at any time
              from the Dashboard.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You can delete your account through Clerk&apos;s user profile
              settings, which will remove your authentication data.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Saved Templates in localStorage can be deleted at any time from
              within the app or by clearing your browser data.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              To request complete deletion of all your data, please{" "}
              <Link
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                Contact Us
              </Link>
              .
            </span>
          </li>
        </ul>
      </section>

      {/* 11 ── Changes */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          Changes to This Policy
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          We may update this Privacy Policy from time to time to reflect new
          features or legal requirements. Your continued use of PureDraft HR
          constitutes acceptance of any changes. We encourage you to review this
          page periodically.
        </p>
      </section>

      {/* 12 ── Contact */}
      <section className="rounded-xl border border-border/60 bg-card p-6 text-center space-y-2">
        <h2 className="text-lg font-semibold">Have questions?</h2>
        <p className="text-sm text-muted-foreground">
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
