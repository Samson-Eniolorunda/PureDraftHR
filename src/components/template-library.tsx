"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SavedTemplate, useTemplateLibrary } from "@/hooks/useTemplateLibrary";
import { BookOpen, Save, Trash2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  TemplateLibrary — Save, select, and manage reference templates     */
/* ------------------------------------------------------------------ */
interface TemplateLibraryProps {
  /** Called when user selects a saved template (injects text) */
  onTemplateSelect: (text: string) => void;
  /** Current reference text (used when saving a new template) */
  currentReferenceText: string;
  disabled?: boolean;
}

export function TemplateLibrary({
  onTemplateSelect,
  currentReferenceText,
  disabled,
}: TemplateLibraryProps) {
  const { templates, isLoaded, saveTemplate, deleteTemplate } =
    useTemplateLibrary();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    if (id) {
      const found = templates.find((t) => t.id === id);
      if (found) onTemplateSelect(found.text);
    }
  };

  const handleSave = () => {
    if (!newTemplateName.trim() || !currentReferenceText.trim()) return;
    saveTemplate(newTemplateName.trim(), currentReferenceText.trim());
    setNewTemplateName("");
    setShowSaveInput(false);
  };

  if (!isLoaded) return null;

  return (
    <Card className="p-4 bg-muted/30 border-dashed">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">
            My Templates{" "}
            {templates.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({templates.length} saved)
              </span>
            )}
          </Label>
        </div>

        {/* Select saved template */}
        {templates.length > 0 && (
          <div className="space-y-1.5">
            <Label
              htmlFor="saved-templates"
              className="text-xs text-muted-foreground"
            >
              Select a saved template:
            </Label>
            <Select
              id="saved-templates"
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              disabled={disabled}
            >
              <option value="">— Choose saved template —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Delete selected template */}
        {selectedTemplateId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive h-8 gap-1.5"
            onClick={() => {
              deleteTemplate(selectedTemplateId);
              setSelectedTemplateId("");
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove template
          </Button>
        )}

        {/* Save current reference as template */}
        {currentReferenceText.trim() && !showSaveInput && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setShowSaveInput(true)}
            disabled={disabled}
          >
            <Save className="h-3.5 w-3.5" />
            Save current reference as template
          </Button>
        )}

        {showSaveInput && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Template name (e.g., Standard Offer Letter)"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="text-sm"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!newTemplateName.trim()}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSaveInput(false);
                setNewTemplateName("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {templates.length === 0 && !showSaveInput && (
          <p className="text-xs text-muted-foreground">
            Upload a reference template above, then save it here for quick
            reuse.
          </p>
        )}
      </div>
    </Card>
  );
}
