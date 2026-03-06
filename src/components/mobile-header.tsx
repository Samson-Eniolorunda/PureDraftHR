"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const ThemeToggleButton = dynamic(
  () => import("./theme-toggle-button").then((mod) => mod.ThemeToggleButton),
  { ssr: false },
);

export function MobileHeader() {
  const { isSignedIn } = useAuth();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-20 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-top">
      <div className="flex items-center justify-between h-16 px-4">
        <Link
          href="/assistant"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            PD
          </div>
          <span className="font-semibold text-sm tracking-tight">
            PureDraft HR
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Button>
            </SignInButton>
          )}
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
