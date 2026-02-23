"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Select — modern, styled native select wrapper                      */
/* ------------------------------------------------------------------ */

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm ring-offset-background transition-all",
            "hover:border-primary/50 hover:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input disabled:hover:shadow-none",
            "font-medium text-foreground",
            className,
          )}
          {...props}
        >
          {children}
        </select>

        {/* Custom dropdown arrow - always visible */}
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 13l-7 7m0 0l-7-7m7 7V6"
          />
        </svg>
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
