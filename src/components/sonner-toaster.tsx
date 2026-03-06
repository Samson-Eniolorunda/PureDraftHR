"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function SonnerToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{ className: "mb-16 md:mb-0" }}
    />
  );
}
