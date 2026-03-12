/* ------------------------------------------------------------------ */
/*  Chat history store — localStorage-backed                           */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "puredraft_chats";

function readAll(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getChats(): ChatSession[] {
  return readAll().sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export function getChat(id: string): ChatSession | undefined {
  return readAll().find((c) => c.id === id);
}

/** Derive a short title from the first user message */
function deriveTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New Chat";
  const text = first.content.trim();
  return text.length > 50 ? text.slice(0, 50) + "…" : text;
}

export function saveChat(
  id: string,
  messages: ChatMessage[],
  existingTitle?: string,
): ChatSession {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === id);
  const now = Date.now();
  if (idx >= 0) {
    all[idx].messages = messages;
    all[idx].updatedAt = now;
    if (!existingTitle) all[idx].title = deriveTitle(messages);
  } else {
    all.push({
      id,
      title: existingTitle || deriveTitle(messages),
      messages,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  writeAll(all);
  return all[idx >= 0 ? idx : all.length - 1];
}

export function deleteChat(id: string) {
  writeAll(readAll().filter((c) => c.id !== id));
}

export function renameChat(id: string, title: string) {
  const all = readAll();
  const chat = all.find((c) => c.id === id);
  if (chat) {
    chat.title = title;
    writeAll(all);
  }
}

export function togglePin(id: string) {
  const all = readAll();
  const chat = all.find((c) => c.id === id);
  if (chat) {
    chat.pinned = !chat.pinned;
    writeAll(all);
  }
}
