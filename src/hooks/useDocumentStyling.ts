import { useState, useCallback, useEffect } from "react";

export interface DocumentStyling {
  fontFamily: string;
  h1SizePt: number;
  h2h3SizePt: number;
  bodyTextSizePt: number;
  lineSpacing: "1.0" | "1.15" | "1.5" | "2.0";
  bulletStyle:
    | "none"
    | "dot"
    | "circle"
    | "square"
    | "diamond"
    | "arrow"
    | "checkmark";
  googleFonts: string[]; // loaded Google fonts
}

const DEFAULT_STYLING: DocumentStyling = {
  fontFamily: "Arial",
  h1SizePt: 24,
  h2h3SizePt: 14,
  bodyTextSizePt: 12,
  lineSpacing: "1.5",
  bulletStyle: "dot",
  googleFonts: [],
};

const WEB_SAFE_FONTS = [
  "Arial",
  "Trebuchet MS",
  "Verdana",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Comic Sans MS",
];

const GOOGLE_FONTS = [
  { name: "Lora", family: "'Lora', serif" },
  { name: "Open Sans", family: "'Open Sans', sans-serif" },
  { name: "Roboto", family: "'Roboto', sans-serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Merriweather", family: "'Merriweather', serif" },
  { name: "Source Sans Pro", family: "'Source Sans Pro', sans-serif" },
  { name: "Raleway", family: "'Raleway', sans-serif" },
];

export function useDocumentStyling() {
  const [styling, setStyling] = useState<DocumentStyling>(DEFAULT_STYLING);
  const [availableFonts, setAvailableFonts] =
    useState<string[]>(WEB_SAFE_FONTS);
  const [loadedGoogleFonts, setLoadedGoogleFonts] = useState<string[]>([]);

  // Load Google Font into document
  const loadGoogleFont = useCallback(
    (fontName: string) => {
      if (loadedGoogleFonts.includes(fontName)) return;

      const googleFont = GOOGLE_FONTS.find((f) => f.name === fontName);
      if (!googleFont) return;

      // Inject Google Fonts link
      const linkId = `google-font-${fontName.replace(/\s+/g, "-")}`;
      if (document.getElementById(linkId)) return;

      const encodedFontName = fontName.replace(/\s+/g, "+");
      const link = document.createElement("link");
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${encodedFontName}:wght@400;700&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);

      setLoadedGoogleFonts((prev) => [...prev, fontName]);
      setStyling((prev) => ({
        ...prev,
        googleFonts: [...prev.googleFonts, fontName],
      }));
    },
    [loadedGoogleFonts],
  );

  const updateFontFamily = useCallback(
    (fontName: string) => {
      // Check if it's a Google Font and load it
      if (GOOGLE_FONTS.some((f) => f.name === fontName)) {
        loadGoogleFont(fontName);
      }
      setStyling((prev) => ({ ...prev, fontFamily: fontName }));
    },
    [loadGoogleFont],
  );

  const updateH1Size = useCallback((size: number) => {
    setStyling((prev) => ({
      ...prev,
      h1SizePt: Math.max(18, Math.min(36, size)),
    }));
  }, []);

  const updateH2H3Size = useCallback((size: number) => {
    setStyling((prev) => ({
      ...prev,
      h2h3SizePt: Math.max(14, Math.min(18, size)),
    }));
  }, []);

  const updateBodyTextSize = useCallback((size: number) => {
    setStyling((prev) => ({
      ...prev,
      bodyTextSizePt: Math.max(10, Math.min(14, size)),
    }));
  }, []);

  const updateLineSpacing = useCallback(
    (spacing: "1.0" | "1.15" | "1.5" | "2.0") => {
      setStyling((prev) => ({ ...prev, lineSpacing: spacing }));
    },
    [],
  );

  const updateBulletStyle = useCallback(
    (
      style:
        | "none"
        | "dot"
        | "circle"
        | "square"
        | "diamond"
        | "arrow"
        | "checkmark",
    ) => {
      setStyling((prev) => ({ ...prev, bulletStyle: style }));
    },
    [],
  );

  const resetToDefaults = useCallback(() => {
    setStyling(DEFAULT_STYLING);
  }, []);

  return {
    styling,
    availableFonts,
    loadedGoogleFonts,
    updateFontFamily,
    updateH1Size,
    updateH2H3Size,
    updateBodyTextSize,
    updateLineSpacing,
    updateBulletStyle,
    resetToDefaults,
    googleFonts: GOOGLE_FONTS,
    webSafeFonts: WEB_SAFE_FONTS,
  };
}
