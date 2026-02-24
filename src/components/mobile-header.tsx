"use client";

import dynamic from "next/dynamic";

const ThemeToggleButton = dynamic(
  () => import("./theme-toggle-button").then((mod) => mod.ThemeToggleButton),
  { ssr: false },
);

export function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-20 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-top">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            PD
          </div>
          <span className="font-semibold text-sm tracking-tight">
            PureDraft HR
          </span>
        </div>
        <ThemeToggleButton />
      </div>
    </header>
  );
}
