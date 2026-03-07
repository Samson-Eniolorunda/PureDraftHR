"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  FileText,
  ClipboardList,
  PenTool,
  MessageCircle,
  LayoutDashboard,
  LogIn,
  Loader2,
  Globe,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGES, type LanguageValue } from "@/components/language-selector";

const ThemeToggleButton = dynamic(
  () => import("./theme-toggle-button").then((mod) => mod.ThemeToggleButton),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/*  Navigation items shared between sidebar & bottom tabs              */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
  { href: "/assistant", label: "Assistant", icon: MessageCircle },
  { href: "/builder", label: "Builder", icon: PenTool },
  { href: "/formatter", label: "Formatter", icon: FileText },
  { href: "/summarizer", label: "Summarizer", icon: ClipboardList },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [language, setLanguage] = useState<LanguageValue>("English");

  // Persist language choice to localStorage and broadcast via custom event
  useEffect(() => {
    const saved = localStorage.getItem("puredraft_language");
    if (saved) setLanguage(saved as LanguageValue);
  }, []);

  useEffect(() => {
    localStorage.setItem("puredraft_language", language);
    window.dispatchEvent(
      new CustomEvent("puredraft-language-change", { detail: language }),
    );
  }, [language]);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/80 backdrop-blur-sm min-h-screen fixed left-0 top-0 z-30">
        {/* Logo */}
        <Link href="/assistant" className="hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border/50">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
              PD
            </div>
            <span className="font-semibold text-lg tracking-tight">
              PureDraft HR
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav
          aria-label="Main navigation"
          className="flex-1 px-3 py-4 space-y-1"
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
          {/* My Documents — auth-gated */}
          {isSignedIn && (
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === "/dashboard"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground",
              )}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              My Documents
            </Link>
          )}
        </nav>

        {/* Footer with Auth + Theme Toggle */}
        <div className="px-6 py-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            {!isLoaded ? (
              <div className="h-8 w-8 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 text-xs"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </Button>
              </SignInButton>
            )}
            <ThemeToggleButton />
          </div>
          {/* Language selector */}
          <div className="relative mt-2">
            <button
              type="button"
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors rounded-md px-1.5 py-1 hover:bg-accent/50 w-full justify-center"
            >
              <Globe className="h-3 w-3" />
              {language}
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
            {showLangPicker && (
              <div className="absolute bottom-full left-0 mb-1 bg-popover border border-border rounded-xl shadow-lg p-1 min-w-[160px] z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.value);
                      setShowLangPicker(false);
                    }}
                    className={`w-full text-left text-sm rounded-lg px-3 py-1.5 transition-colors ${
                      language === lang.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-muted-foreground flex-wrap">
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
      </aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav
        aria-label="Main navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/75 safe-bottom"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 min-h-[2.75rem] px-1 py-1 text-[11px] font-medium transition-all duration-200 rounded-xl",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    active && "stroke-[2.5] scale-110",
                  )}
                />
                <span className={cn("truncate", active && "font-semibold")}>
                  {label}
                </span>
              </Link>
            );
          })}
          {isSignedIn && (
            <Link
              href="/dashboard"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 min-h-[2.75rem] px-1 py-1 text-[11px] font-medium transition-all duration-200 rounded-xl",
                pathname === "/dashboard"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutDashboard
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  pathname === "/dashboard" && "stroke-[2.5] scale-110",
                )}
              />
              <span
                className={cn(pathname === "/dashboard" && "font-semibold")}
              >
                Docs
              </span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
