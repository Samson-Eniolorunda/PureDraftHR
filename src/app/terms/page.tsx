/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Terms of Service | PureDraft HR",
  description: "PureDraft HR Terms of Service",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Terms of Service
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 7, 2026
        </p>
      </div>

      {/* 1 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          1. Agreement to Terms
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          By accessing and using PureDraft HR, you accept and agree to be bound
          by these Terms of Service. If you do not agree, please discontinue use
          of the application immediately.
        </p>
      </section>

      {/* 2 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          2. Description of Service
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          PureDraft HR is an AI-powered web application for generating,
          formatting, summarizing, and managing HR documents. The platform
          includes the following core tools:
        </p>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">
                Assistant (HR Copilot)
              </strong>{" "}
              — Ask HR questions, draft workplace emails, chat with uploaded
              documents, and use the Smart Meeting Scheduler to create calendar
              events.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Builder</strong> — Generate
              complete HR documents from scratch across 31 document templates
              with optional Bulk CSV generation.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Formatter</strong> — Upload or
              paste unstructured text and let AI restructure it into a clean,
              professionally formatted document.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              <strong className="text-foreground">Summarizer</strong> — Condense
              lengthy HR documents into concise, human-sounding summaries.
            </span>
          </li>
        </ul>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          Additional features include user accounts with authentication, a My
          Documents dashboard for saving and managing generated documents,
          multi-language translation (8 languages), a My Templates Library
          (localStorage-based), customizable document styling, email document
          sharing, and client-side export to PDF, DOCX, and clipboard.
        </p>
      </section>

      {/* 3 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          3. User Accounts &amp; Authentication
        </h2>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Certain features (saving documents, accessing the Dashboard)
              require creating an account via Clerk.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You are responsible for keeping your login credentials secure.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>You may sign in with email/password or Google OAuth.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You can delete your account at any time through your profile
              settings.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Core tools (Formatter, Builder, Summarizer, Assistant) are
              accessible without an account — only document saving requires
              authentication.
            </span>
          </li>
        </ul>
      </section>

      {/* 4 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          4. Data Storage &amp; Document Handling
        </h2>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              When you save a document, it is stored in our database (Supabase
              PostgreSQL) linked to your user account.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Saved documents are user-scoped — only you can view or delete
              them.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Uploaded files (PDF, DOCX, TXT, XLSX, CSV) used for text
              extraction are processed in-memory and never stored on our
              servers.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You are responsible for saving copies of any generated documents
              you wish to keep, via the export buttons (PDF, DOCX, Copy) or the
              Save to Dashboard feature.
            </span>
          </li>
        </ul>
      </section>

      {/* 5 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          5. AI Processing &amp; Accuracy Disclaimer
        </h2>
        <div className="rounded-xl border border-amber-300/50 dark:border-amber-600/30 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3">
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            <strong className="text-foreground">
              PureDraft HR uses the Google Gemini API (Gemini 2.5 Flash)
            </strong>{" "}
            to power all AI features. Please be aware:
          </p>
          <ul className="space-y-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-amber-500 mt-1 shrink-0">&bull;</span>
              <span>
                <strong className="text-foreground">
                  Gemini AI can make mistakes.
                </strong>{" "}
                Generated content may contain errors, inaccuracies, or
                incomplete information.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 mt-1 shrink-0">&bull;</span>
              <span>
                You are solely responsible for reviewing all AI-generated
                documents before using them.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 mt-1 shrink-0">&bull;</span>
              <span>
                Always verify facts, figures, dates, and legal language with
                qualified experts.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 mt-1 shrink-0">&bull;</span>
              <span>
                PureDraft HR and Google disclaim liability for errors in
                AI-generated output.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 mt-1 shrink-0">&bull;</span>
              <span>
                Do not rely solely on AI-generated documents for legal,
                compliance, or critical HR decisions.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 mt-1 shrink-0">&bull;</span>
              <span>
                The Smart Meeting Scheduler generates calendar links based on
                AI-extracted dates — always verify event details.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* 6 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">6. Use License</h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          Permission is granted to use PureDraft HR for personal and
          professional HR document generation. Under this license you may not:
        </p>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Attempt to reverse engineer, decompile, or extract source code
              from the hosted service.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Use the application for unlawful purposes or to generate content
              that violates applicable laws.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Redistribute or resell the service without authorization.
            </span>
          </li>
        </ul>
      </section>

      {/* 7 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          7. Disclaimer of Warranties
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          PureDraft HR is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis. We make no warranties, expressed or implied,
          regarding merchantability, fitness for a particular purpose, or
          non-infringement.
        </p>
      </section>

      {/* 8 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          8. Limitations of Liability
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          In no event shall PureDraft HR or its contributors be liable for any
          damages — including loss of data, profit, or business interruption —
          arising from the use or inability to use the application, even if
          advised of the possibility of such damage.
        </p>
      </section>

      {/* 9 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          9. Content Ownership
        </h2>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              You retain all rights to any documents you upload or generate.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              By using PureDraft HR, you grant us temporary permission to
              process your content solely for generating the requested output.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>We do not claim ownership of any documents you create.</span>
          </li>
        </ul>
      </section>

      {/* 10 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          10. Limitations on Use
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          You agree not to:
        </p>
        <ul className="space-y-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Use the application to generate harassing, obscene, or
              discriminatory content.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>Disrupt the normal operation of the service.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary mt-1 shrink-0">&bull;</span>
            <span>
              Use the app for illegal activities or in violation of any
              applicable laws.
            </span>
          </li>
        </ul>
      </section>

      {/* 11 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">11. Governing Law</h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          These Terms are governed by and construed in accordance with the laws
          of the jurisdiction where the service is provided, and you irrevocably
          submit to the exclusive jurisdiction of the courts in that location.
        </p>
      </section>

      {/* 12 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          12. Changes to Terms
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          PureDraft HR reserves the right to update these Terms at any time.
          Your continued use of the application following any changes
          constitutes acceptance of the revised Terms.
        </p>
      </section>

      {/* 13 */}
      <section className="rounded-xl border border-border/60 bg-card p-6 text-center space-y-2">
        <h2 className="text-lg font-semibold">Have questions?</h2>
        <p className="text-sm text-muted-foreground">
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
