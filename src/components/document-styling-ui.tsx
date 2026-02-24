"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DocumentStyling,
  useDocumentStyling,
} from "@/hooks/useDocumentStyling";
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
      | "checkmark",
  ) => void;
  onResetDefaults: () => void;
}

const BULLET_STYLES = [
  { value: "none", label: "None" },
  { value: "dot", label: "Dot (•)" },
  { value: "circle", label: "Circle (○)" },
  { value: "square", label: "Square (■)" },
  { value: "diamond", label: "Diamond (❖)" },
  { value: "arrow", label: "Arrow (➤)" },
  { value: "checkmark", label: "Checkmark (✓)" },
];

const LINE_SPACING_OPTIONS = [
  { value: "1.0", label: "1.0 (Single)" },
  { value: "1.15", label: "1.15" },
  { value: "1.5", label: "1.5 (Default)" },
  { value: "2.0", label: "2.0 (Double)" },
];

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
  // All available fonts: web-safe + Google Fonts
  const allFonts = [...webSafeFonts, ...googleFonts.map((f) => f.name)];

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Document Styling</CardTitle>
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
      </CardHeader>

      <CardContent className="space-y-4">
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

        {/* Font Sizes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Font Sizes (pt)</Label>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Heading 1 (H1)</span>
              <span className="text-xs font-mono">{styling.h1SizePt}pt</span>
            </div>
            <Input
              type="number"
              min={18}
              max={36}
              value={styling.h1SizePt}
              onChange={(e) => onH1SizeChange(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Subheading (H2/H3)</span>
              <span className="text-xs font-mono">{styling.h2h3SizePt}pt</span>
            </div>
            <Input
              type="number"
              min={14}
              max={18}
              value={styling.h2h3SizePt}
              onChange={(e) => onH2H3SizeChange(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Body Text</span>
              <span className="text-xs font-mono">
                {styling.bodyTextSizePt}pt
              </span>
            </div>
            <Input
              type="number"
              min={10}
              max={14}
              value={styling.bodyTextSizePt}
              onChange={(e) => onBodyTextSizeChange(Number(e.target.value))}
              className="h-8 text-sm"
            />
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
                  | "checkmark",
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
      </CardContent>
    </Card>
  );
}
