"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function SonnerToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-center"
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
