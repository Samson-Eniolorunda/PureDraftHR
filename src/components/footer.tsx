"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

const ThemeToggleButton = dynamic(
  () => import("./theme-toggle-button").then((mod) => mod.ThemeToggleButton),
  { ssr: false },
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/80 backdrop-blur-sm py-6 px-4 md:ml-64 pb-24 md:pb-6 text-sm text-muted-foreground md:fixed md:bottom-0 md:left-0 md:right-0 md:z-40">
      <div className="mx-auto max-w-4xl">
        {/* Desktop: 3-column layout (Copyright | Links | Contact) */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-4">
          {/* Copyright & Attribution */}
          <div className="flex flex-col items-start gap-1">
            <div>© {currentYear} PureDraft HR. All rights reserved.</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              Powered by <Sparkles className="h-3 w-3 text-blue-500" />
              <a
                href="https://ai.google.dev"
                className="hover:text-foreground transition-colors underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Gemini
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/faq"
              className="hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Mobile: Centered stack (Links | Contact | Copyright) */}
        <div className="md:hidden flex flex-col items-center gap-4">
          {/* Links */}
          <div className="flex items-center gap-6 justify-center flex-wrap">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/faq"
              className="hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Theme toggle on mobile */}
          <div className="flex justify-center">
            <ThemeToggleButton />
          </div>

          {/* Copyright - Last on mobile */}
          <div className="text-xs text-center pt-2 border-t border-border/50 space-y-1">
            <div>© {currentYear} PureDraft HR. All rights reserved.</div>
            <div className="flex items-center justify-center gap-1">
              Powered by <Sparkles className="h-3 w-3 text-blue-500" />
              <a
                href="https://ai.google.dev"
                className="hover:text-foreground transition-colors underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Gemini
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
