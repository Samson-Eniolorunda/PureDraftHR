"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Smartphone, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Desktop: Sun | System | Moon */}
      <div
        role="group"
        aria-label="Theme selection"
        className="hidden sm:flex items-center gap-0.5 rounded-full border border-input bg-muted/60 p-0.5"
      >
        <Button
          variant={theme === "light" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("light")}
          className={cn(
            "h-7 w-7 p-0 rounded-full",
            theme === "light"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="Light mode"
        >
          <Sun className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant={theme === "system" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("system")}
          className={cn(
            "h-7 w-7 p-0 rounded-full",
            theme === "system"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="System theme"
        >
          <Monitor className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant={theme === "dark" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("dark")}
          className={cn(
            "h-7 w-7 p-0 rounded-full",
            theme === "dark"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="Dark mode"
        >
          <Moon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Mobile: Sun | Mobile | Moon (system as default) */}
      <div
        role="group"
        aria-label="Theme selection"
        className="sm:hidden flex items-center gap-0.5 rounded-full border border-input bg-muted/60 p-0.5"
      >
        <Button
          variant={theme === "light" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("light")}
          className={cn(
            "h-7 w-7 p-0 rounded-full",
            theme === "light"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="Light mode"
        >
          <Sun className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant={theme === "system" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("system")}
          className={cn(
            "h-7 w-7 p-0 rounded-full",
            theme === "system"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="System theme"
        >
          <Smartphone className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant={theme === "dark" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("dark")}
          className={cn(
            "h-7 w-7 p-0 rounded-full",
            theme === "dark"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title="Dark mode"
        >
          <Moon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </>
  );
}
