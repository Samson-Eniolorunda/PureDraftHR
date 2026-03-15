"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface SharedMessage {
  role: "user" | "assistant";
  content: string;
}

interface SharedChat {
  title: string;
  messages: SharedMessage[];
  sharedAt: number;
}

export default function SharedChatPage() {
  const params = useParams();
  const id = params.id as string;
  const [chat, setChat] = useState<SharedChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/share?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setChat(data.chat);
        } else {
          setError(data.error || "Conversation not found");
        }
      })
      .catch(() => setError("Failed to load conversation"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-sm text-muted-foreground">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="h-8 w-8 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">
            {error || "Conversation not found"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            This shared conversation may have expired or been removed.
          </p>
          <Link
            href="/assistant"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start your own chat
          </Link>
        </div>
      </div>
    );
  }

  const sharedDate = new Date(chat.sharedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-border/50 pb-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {chat.title}
        </h1>
        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            PD
          </div>
          <span>Shared from PureDraft HR</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{sharedDate}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-6">
        {chat.messages.map((msg, i) => (
          <div key={i} className="flex gap-3">
            {/* Avatar */}
            <div className="shrink-0 mt-1">
              {msg.role === "user" ? (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    className="h-3.5 w-3.5 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              ) : (
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  PD
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                {msg.role === "user" ? "You" : "PureDraft HR"}
              </p>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer content={msg.content} />
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 pt-6 border-t border-border/50 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Want to try PureDraft HR&apos;s AI assistant?
        </p>
        <Link
          href="/assistant"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Continue this chat
        </Link>
      </div>
    </div>
  );
}
