"use client";

import React, { useState, useEffect, useRef } from "react";

type ThemeValue = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeContextValue {
  theme: ThemeValue;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeValue) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeValue>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);
  const themeRef = useRef<ThemeValue>("system");

  // Determine actual theme based on system preference
  const getResolvedTheme = (t: ThemeValue): ResolvedTheme => {
    if (t === "system") {
      if (typeof window === "undefined") return "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return t;
  };

  // Load theme from localStorage on mount and listen to system changes
  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeValue | null;
    const initialTheme = saved || "system";
    setThemeState(initialTheme);
    themeRef.current = initialTheme;
    const resolved = getResolvedTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeRef.current === "system") {
        const newResolved = getResolvedTheme("system");
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    setMounted(true);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const applyTheme = (resolved: ResolvedTheme) => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  };

  const setTheme = (newTheme: ThemeValue) => {
    setThemeState(newTheme);
    themeRef.current = newTheme;
    localStorage.setItem("theme", newTheme);
    const resolved = getResolvedTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  };

  // Prevent flash of wrong theme
  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
