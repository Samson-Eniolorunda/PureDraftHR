"use client";

import { useState, useCallback, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  AI Persistent Memory — stores user context across conversations    */
/*  Stored in localStorage as key-value pairs the AI can reference     */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "puredraft_ai_memory";
const MAX_MEMORIES = 50;
const MAX_MEMORY_CHARS = 5000;

export interface MemoryEntry {
  key: string;
  value: string;
  createdAt: number;
}

function loadMemories(): MemoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMemories(memories: MemoryEntry[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(memories.slice(0, MAX_MEMORIES)),
  );
}

export function useAIMemory() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);

  useEffect(() => {
    setMemories(loadMemories());
  }, []);

  const addMemory = useCallback((key: string, value: string) => {
    setMemories((prev) => {
      const filtered = prev.filter((m) => m.key !== key);
      const updated = [...filtered, { key, value, createdAt: Date.now() }];
      saveMemories(updated);
      return updated;
    });
  }, []);

  const removeMemory = useCallback((key: string) => {
    setMemories((prev) => {
      const updated = prev.filter((m) => m.key !== key);
      saveMemories(updated);
      return updated;
    });
  }, []);

  const clearMemories = useCallback(() => {
    setMemories([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /** Build a memory context string for the AI system prompt */
  const getMemoryContext = useCallback((): string => {
    if (memories.length === 0) return "";
    const entries = memories.map((m) => `- ${m.key}: ${m.value}`).join("\n");
    return entries.substring(0, MAX_MEMORY_CHARS);
  }, [memories]);

  return { memories, addMemory, removeMemory, clearMemories, getMemoryContext };
}

/**
 * Parse AI response for memory save commands.
 * The AI can include [MEMORY_SAVE: key | value] in its response to store info.
 * These tags are stripped from the displayed response.
 */
export function parseMemoryCommands(text: string): {
  cleanText: string;
  commands: { key: string; value: string }[];
} {
  const commands: { key: string; value: string }[] = [];
  const cleanText = text.replace(
    /\[MEMORY_SAVE:\s*([^|]+)\s*\|\s*([^\]]+)\]/g,
    (_, key, value) => {
      commands.push({ key: key.trim(), value: value.trim() });
      return "";
    },
  );
  return { cleanText: cleanText.trim(), commands };
}
