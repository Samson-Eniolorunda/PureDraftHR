"use client";

import { useState, useCallback, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  useTemplateLibrary — localStorage-based saved template management   */
/* ------------------------------------------------------------------ */

export interface SavedTemplate {
  id: string;
  name: string;
  text: string;
  createdAt: number;
}

const STORAGE_KEY = "puredraft-hr-templates";

function loadTemplates(): SavedTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistTemplates(templates: SavedTemplate[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function useTemplateLibrary() {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setTemplates(loadTemplates());
    setIsLoaded(true);
  }, []);

  const saveTemplate = useCallback(
    (name: string, text: string) => {
      const newTemplate: SavedTemplate = {
        id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim(),
        text: text.trim(),
        createdAt: Date.now(),
      };
      const updated = [...templates, newTemplate];
      setTemplates(updated);
      persistTemplates(updated);
      return newTemplate;
    },
    [templates],
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      const updated = templates.filter((t) => t.id !== id);
      setTemplates(updated);
      persistTemplates(updated);
    },
    [templates],
  );

  const getTemplate = useCallback(
    (id: string) => {
      return templates.find((t) => t.id === id) ?? null;
    },
    [templates],
  );

  return {
    templates,
    isLoaded,
    saveTemplate,
    deleteTemplate,
    getTemplate,
  };
}
