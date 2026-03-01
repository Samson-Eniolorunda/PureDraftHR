/**
 * Lightweight sessionStorage wrapper to pass text from Assistant/Summarizer to Formatter.
 * No external dependencies — uses built-in browser sessionStorage.
 */

const FORMATTER_TRANSFER_KEY = "pureDraftHR_formatterInput";

export function setFormatterInput(text: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(FORMATTER_TRANSFER_KEY, text);
  } catch (err) {
    console.error("[formatter-transfer] Failed to save to sessionStorage:", err);
  }
}

export function getFormatterInput(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(FORMATTER_TRANSFER_KEY);
    // Clear after reading so it doesn't persist across page reloads
    sessionStorage.removeItem(FORMATTER_TRANSFER_KEY);
    return value;
  } catch (err) {
    console.error("[formatter-transfer] Failed to read from sessionStorage:", err);
    return null;
  }
}
