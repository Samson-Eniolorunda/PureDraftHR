"use client";

import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/i18n-provider";

export function MobileHeader() {
  const { isSignedIn, isLoaded } = useAuth();
  const { t } = useTranslation();

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
          </div>
        </div>
      </header>
    </>
  );
}
