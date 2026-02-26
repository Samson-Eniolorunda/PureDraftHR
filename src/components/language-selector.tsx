"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Globe } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  LanguageSelector — output language for AI generation               */
/* ------------------------------------------------------------------ */
export const LANGUAGES = [
  { value: "English", label: "English (Default)" },
  { value: "Spanish", label: "Spanish (Español)" },
  { value: "French", label: "French (Français)" },
  { value: "German", label: "German (Deutsch)" },
  { value: "Mandarin", label: "Mandarin (中文)" },
  { value: "Portuguese", label: "Portuguese (Português)" },
  { value: "Arabic", label: "Arabic (العربية)" },
  { value: "Hindi", label: "Hindi (हिन्दी)" },
] as const;

export type LanguageValue = (typeof LANGUAGES)[number]["value"];

interface LanguageSelectorProps {
  value: LanguageValue;
  onChange: (lang: LanguageValue) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  value,
  onChange,
  disabled,
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="output-language" className="text-sm font-medium">
          Output Language
        </Label>
      </div>
      <Select
        id="output-language"
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageValue)}
        disabled={disabled}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
