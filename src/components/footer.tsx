"use client";

import Link from "next/link";
import { Mail, Github } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/50 py-6 px-4 md:ml-64 pb-24 md:pb-6 text-sm text-muted-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Desktop: 3-column layout (Copyright | Links | Social) */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-4">
          {/* Copyright */}
          <div>© {currentYear} PureDraft HR. All rights reserved.</div>

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
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="mailto:eniolorundasamson@gmail.com"
              className="hover:text-foreground transition-colors"
              title="Email"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/Samson-Eniolorunda"
              className="hover:text-foreground transition-colors"
              title="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Mobile: Centered stack (Links | Social | Copyright) */}
        <div className="md:hidden flex flex-col items-center gap-4">
          {/* Links */}
          <div className="flex items-center gap-6 justify-center">
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
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 justify-center">
            <a
              href="mailto:eniolorundasamson@gmail.com"
              className="hover:text-foreground transition-colors"
              title="Email"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/Samson-Eniolorunda"
              className="hover:text-foreground transition-colors"
              title="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright - Last on mobile */}
          <div className="text-xs text-center pt-2 border-t border-border/50">
            © {currentYear} PureDraft HR. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
