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
  Sparkles,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LANGUAGES } from "@/components/language-selector";
import { useTranslation } from "@/components/i18n-provider";

const ThemeToggleButton = dynamic(
  () => import("./theme-toggle-button").then((mod) => mod.ThemeToggleButton),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/*  Navigation items shared between sidebar & bottom tabs              */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
  { href: "/assistant", labelKey: "nav.assistant", icon: MessageCircle },
  { href: "/builder", labelKey: "nav.builder", icon: PenTool },
  { href: "/formatter", labelKey: "nav.formatter", icon: FileText },
  { href: "/summarizer", labelKey: "nav.summarizer", icon: ClipboardList },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showMorePanel, setShowMorePanel] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  // Close More panel on navigation
  useEffect(() => {
    setShowMorePanel(false);
  }, [pathname]);

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
          {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
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
                {t(labelKey)}
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
              {t("nav.myDocuments")}
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
                  {t("common.signIn")}
                </Button>
              </SignInButton>
            )}
            <ThemeToggleButton />
          </div>
          {/* Language selector */}
          <div className="relative mt-2">
            <p className="text-[9px] text-muted-foreground/50 text-center mb-0.5">
              {t("common.language")}
            </p>
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
              {t("common.privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              {t("common.terms")}
            </Link>
            <Link
              href="/faq"
              className="hover:text-foreground transition-colors"
            >
              {t("common.faq")}
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              {t("common.contact")}
            </Link>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            {t("common.poweredByGemini")}
          </p>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav
        aria-label="Main navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/75 safe-bottom"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
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
                  {t(labelKey)}
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
                {t("nav.docs")}
              </span>
            </Link>
          )}
          {/* More button */}
          <button
            type="button"
            onClick={() => setShowMorePanel((v) => !v)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 min-h-[2.75rem] px-1 py-1 text-[11px] font-medium transition-all duration-200 rounded-xl",
              showMorePanel
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>{t("common.more")}</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile "More" slide-up panel ── */}
      {showMorePanel && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/40 animate-in fade-in duration-200"
          onClick={() => setShowMorePanel(false)}
        />
      )}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[61] bg-card border-t border-border/50 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out ${
          showMorePanel ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/50">
          <span className="font-semibold text-sm">{t("export.moreOptions")}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowMorePanel(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Theme toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("common.theme")}</span>
            <ThemeToggleButton />
          </div>

          {/* Language selector */}
          <div className="space-y-1.5">
            <label htmlFor="mobile-language-select" className="text-xs text-muted-foreground">
              {t("common.language")}
            </label>
            <Select
              id="mobile-language-select"
              name="mobile-language-select"
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
                onClick={() => setShowMorePanel(false)}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Attribution */}
          <p className="text-[10px] text-muted-foreground/50 text-center flex items-center justify-center gap-1 pt-2 border-t border-border/50">
            <Sparkles className="h-3 w-3" />
            {t("common.poweredByGemini")}
          </p>
        </div>
      </div>
    </>
  );
}
