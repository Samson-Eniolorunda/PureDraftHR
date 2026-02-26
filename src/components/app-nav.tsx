"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { FileText, ClipboardList, PenTool, MessageCircle } from "lucide-react";

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

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card min-h-screen fixed left-0 top-0 z-30">
        {/* Logo */}
        <Link href="/assistant" className="hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2 px-6 py-5 border-b">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              PD
            </div>
            <span className="font-semibold text-lg tracking-tight">
              PureDraft HR
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Theme Toggle */}
        <div className="px-6 py-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">
              Stateless &bull; No data saved
            </span>
            <ThemeToggleButton />
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
