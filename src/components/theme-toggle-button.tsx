"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Desktop: Sun | System | Moon */}
      <div className="hidden sm:flex items-center gap-1 rounded-lg border border-input bg-muted p-1">
        <Button
          variant={theme === "light" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("light")}
          className={cn(
            "h-8 px-2",
            theme === "light"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="Light mode"
        >
          <Sun className="h-4 w-4" />
        </Button>

        <Button
          variant={theme === "system" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("system")}
          className={cn(
            "h-8 px-2",
            theme === "system"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="System theme"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </Button>

        <Button
          variant={theme === "dark" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("dark")}
          className={cn(
            "h-8 px-2",
            theme === "dark"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="Dark mode"
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile: Sun | Mobile | Moon (system as default) */}
      <div className="sm:hidden flex items-center gap-1 rounded-lg border border-input bg-muted p-1">
        <Button
          variant={theme === "light" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("light")}
          className={cn(
            "h-8 px-2",
            theme === "light"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="Light mode"
        >
          <Sun className="h-4 w-4" />
        </Button>

        <Button
          variant={theme === "system" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("system")}
          className={cn(
            "h-8 px-2",
            theme === "system"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="System theme"
        >
          <Smartphone className="h-4 w-4" />
        </Button>

        <Button
          variant={theme === "dark" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("dark")}
          className={cn(
            "h-8 px-2",
            theme === "dark"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="Dark mode"
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
