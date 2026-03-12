"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LogIn, Loader2, MoreVertical, X, Sparkles } from "lucide-react";
import { useTranslation } from "@/components/i18n-provider";
import { LANGUAGES } from "@/components/language-selector";

const ThemeToggleButton = dynamic(
  () => import("./theme-toggle-button").then((mod) => mod.ThemeToggleButton),
  { ssr: false },
);

export function MobileHeader() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  // Close panel on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-20 border-b border-border/50 bg-card/90 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 safe-top">
        <div className="flex items-center justify-between h-14 px-4">
          <Link
            href="/assistant"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
              PD
            </div>
            <span className="font-semibold text-sm tracking-tight">
              PureDraft HR
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {!isLoaded ? (
              <div className="h-8 w-8 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {t("common.signIn")}
                </Button>
              </SignInButton>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen((v) => !v)}
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Slide-out panel from right ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 z-[61] w-72 bg-card border-l border-border/50 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-border/50">
          <span className="font-semibold text-sm">
            {t("export.moreOptions")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100%-3.5rem)]">
          <div className="p-4 space-y-5 overflow-y-auto flex-1">
            {/* Theme toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("common.theme")}</span>
              <ThemeToggleButton />
            </div>

            {/* Language selector (dropdown) */}
            <div className="space-y-1.5">
              <label htmlFor="language-select" className="text-xs text-muted-foreground">
                {t("common.language")}
              </label>
              <Select
                id="language-select"
                name="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Links */}
            <div className="space-y-1">
              {[
                { href: "/privacy", label: t("common.privacy") },
                { href: "/terms", label: t("common.terms") },
                { href: "/faq", label: t("common.faq") },
                { href: "/contact", label: t("common.contact") },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Attribution — pinned to bottom */}
          <div className="shrink-0 border-t border-border/50 px-4 py-3">
            <p className="text-[10px] text-muted-foreground/50 text-center flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              {t("common.poweredByGemini")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
