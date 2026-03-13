"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { translations, LANG_TO_HTML } from "@/lib/translations";
import { type LanguageValue } from "@/components/language-selector";

/* ------------------------------------------------------------------ */
/*  I18n Context — global language state + t() translation helper      */
/* ------------------------------------------------------------------ */

interface I18nContextValue {
  language: LanguageValue;
  setLanguage: (lang: LanguageValue) => void;
  /** Translate a key, with optional {param} replacement */
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: "English",
  setLanguage: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageValue>("English");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("puredraft_language");
    if (saved) setLanguageState(saved as LanguageValue);
  }, []);

  const setLanguage = useCallback((lang: LanguageValue) => {
    // Store first, then reload — do NOT update React state before reload
    // to avoid a flash of the new language before the page fully reloads.
    localStorage.setItem("puredraft_language", lang);
    window.dispatchEvent(
      new CustomEvent("puredraft-language-change", { detail: lang }),
    );
    window.location.reload();
  }, []);

  // Keep html lang attribute in sync
  useEffect(() => {
    const htmlLang = LANG_TO_HTML[language] || "en";
    document.documentElement.lang = htmlLang;
    document.documentElement.dir = language === "Arabic" ? "rtl" : "ltr";
  }, [language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text =
        translations[language]?.[key] || translations["English"]?.[key] || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [language],
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
