"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PureDraftHR] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <span className="text-3xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Something went wrong
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        An unexpected error occurred. This has been logged and we&apos;ll look
        into it. You can try again or go back to the home page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
        <a
          href="/assistant"
          className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
