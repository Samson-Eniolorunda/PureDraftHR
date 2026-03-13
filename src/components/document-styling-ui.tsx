"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DocumentStyling } from "@/hooks/useDocumentStyling";
import { RotateCcw } from "lucide-react";

interface DocumentStylingUIProps {
  styling: DocumentStyling;
  googleFonts: Array<{ name: string; family: string }>;
  webSafeFonts: string[];
  onFontFamilyChange: (font: string) => void;
  onH1SizeChange: (size: number) => void;
  onH2H3SizeChange: (size: number) => void;
  onBodyTextSizeChange: (size: number) => void;
  onLineSpacingChange: (spacing: "1.0" | "1.15" | "1.5" | "2.0") => void;
  onBulletStyleChange: (
    style:
      | "none"
      | "dot"
      | "circle"
      | "square"
      | "diamond"
      | "arrow"
      | "checkmark"
      | "number"
      | "roman",
  ) => void;
  onResetDefaults: () => void;
}

const BULLET_STYLES = [
  { value: "none", label: "None" },
  { value: "dot", label: "Dot (\u2022)" },
  { value: "circle", label: "Circle (\u25CB)" },
  { value: "square", label: "Square (\u25A0)" },
  { value: "diamond", label: "Diamond (\u2756)" },
  { value: "arrow", label: "Arrow (\u27A4)" },
  { value: "checkmark", label: "Checkmark (\u2713)" },
  { value: "number", label: "Numbered (1. 2. 3.)" },
  { value: "roman", label: "Roman (I. II. III.)" },
];

const LINE_SPACING_OPTIONS = [
  { value: "1.0", label: "1.0 (Single)" },
  { value: "1.15", label: "1.15" },
  { value: "1.5", label: "1.5 (Default)" },
  { value: "2.0", label: "2.0 (Double)" },
];

const H1_SIZE_OPTIONS = [18, 20, 22, 24, 26, 28, 32, 36];
const H2H3_SIZE_OPTIONS = [14, 16, 18, 20, 22, 24];
const BODY_SIZE_OPTIONS = [10, 11, 12, 14];

export function DocumentStylingUI({
  styling,
  googleFonts,
  webSafeFonts,
  onFontFamilyChange,
  onH1SizeChange,
  onH2H3SizeChange,
  onBodyTextSizeChange,
  onLineSpacingChange,
  onBulletStyleChange,
  onResetDefaults,
}: DocumentStylingUIProps) {
  return (
    <div className="space-y-5">
      {/* Header with reset */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Document Styling</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={onResetDefaults}
          className="h-8 w-8 p-0"
          title="Reset to defaults"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label htmlFor="font-family">Font Family</Label>
        <Select
          id="font-family"
          value={styling.fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
        >
          <optgroup label="Web Safe">
            {webSafeFonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </optgroup>
          <optgroup label="Google Fonts">
            {googleFonts.map((font) => (
              <option key={font.name} value={font.name}>
                {font.name}
              </option>
            ))}
          </optgroup>
        </Select>
      </div>

      {/* Font Sizes — Dropdowns */}
      <div className="space-y-3">
        <span className="text-sm font-medium">Font Sizes (pt)</span>

        {/* Heading 1 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Heading 1 (H1)</span>
            <span className="text-xs font-mono">{styling.h1SizePt}pt</span>
          </div>
          <Select
            id="h1-size"
            value={String(styling.h1SizePt)}
            onChange={(e) => onH1SizeChange(Number(e.target.value))}
          >
            {H1_SIZE_OPTIONS.map((size) => (
              <option key={size} value={String(size)}>
                {size} pt
              </option>
            ))}
          </Select>
        </div>

        {/* Subheading */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Subheading (H2/H3)</span>
            <span className="text-xs font-mono">{styling.h2h3SizePt}pt</span>
          </div>
          <Select
            id="h2h3-size"
            value={String(styling.h2h3SizePt)}
            onChange={(e) => onH2H3SizeChange(Number(e.target.value))}
          >
            {H2H3_SIZE_OPTIONS.map((size) => (
              <option key={size} value={String(size)}>
                {size} pt
              </option>
            ))}
          </Select>
        </div>

        {/* Body Text */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Body Text</span>
            <span className="text-xs font-mono">
              {styling.bodyTextSizePt}pt
            </span>
          </div>
          <Select
            id="body-size"
            value={String(styling.bodyTextSizePt)}
            onChange={(e) => onBodyTextSizeChange(Number(e.target.value))}
          >
            {BODY_SIZE_OPTIONS.map((size) => (
              <option key={size} value={String(size)}>
                {size} pt
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Line Spacing */}
      <div className="space-y-2">
        <Label htmlFor="line-spacing">Line Spacing</Label>
        <Select
          id="line-spacing"
          value={styling.lineSpacing}
          onChange={(e) =>
            onLineSpacingChange(
              e.target.value as "1.0" | "1.15" | "1.5" | "2.0",
            )
          }
        >
          {LINE_SPACING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Bullet Style */}
      <div className="space-y-2">
        <Label htmlFor="bullet-style">Bullet Style</Label>
        <Select
          id="bullet-style"
          value={styling.bulletStyle}
          onChange={(e) =>
            onBulletStyleChange(
              e.target.value as
                | "none"
                | "dot"
                | "circle"
                | "square"
                | "diamond"
                | "arrow"
                | "checkmark"
                | "number"
                | "roman",
            )
          }
        >
          {BULLET_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
