"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on mount (client-side only).
 * Renders nothing — pure side-effect component.
 */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed — non-critical
      });
    }
  }, []);

  return null;
}
