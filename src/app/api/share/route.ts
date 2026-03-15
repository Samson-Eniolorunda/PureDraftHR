import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface SharedMessage {
  role: "user" | "assistant";
  content: string;
}

interface SharedChat {
  type?: "chat" | "document";
  title: string;
  messages: SharedMessage[];
  content?: string;
  sharedAt: number;
}

const SHARE_PREFIX = "shared_chat:";
const SHARE_TTL = 60 * 60 * 24 * 90; // 90 days

/** POST — create a shared chat or document link */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      type?: "chat" | "document";
      title: string;
      messages?: SharedMessage[];
      content?: string;
    };

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const isDocument = body.type === "document";

    if (isDocument) {
      if (!body.content || body.content.trim().length === 0) {
        return NextResponse.json(
          { error: "Content is required for document sharing" },
          { status: 400 },
        );
      }
    } else {
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        return NextResponse.json(
          { error: "Messages are required for chat sharing" },
          { status: 400 },
        );
      }
    }

    // Filter to only user/assistant messages, limit to 200 messages
    const sanitizedMessages = isDocument
      ? []
      : (body.messages || [])
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(0, 200)
          .map((m) => ({
            role: m.role,
            content: m.content.slice(0, 50000),
          }));

    if (!isDocument && sanitizedMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages to share" },
        { status: 400 },
      );
    }

    // Generate a short unique ID
    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    const sharedChat: SharedChat = {
      type: isDocument ? "document" : "chat",
      title: body.title.slice(0, 200),
      messages: sanitizedMessages,
      ...(isDocument && { content: (body.content || "").slice(0, 100000) }),
      sharedAt: Date.now(),
    };

    await redis.set(`${SHARE_PREFIX}${id}`, JSON.stringify(sharedChat), {
      ex: SHARE_TTL,
    });

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://puredrafthr.btbcoder.site";

    return NextResponse.json({
      success: true,
      shareId: id,
      shareUrl: `${origin}/share/${id}`,
    });
  } catch (error) {
    console.error("❌ Share API error:", error);
    return NextResponse.json(
      { error: "Failed to create shared link" },
      { status: 500 },
    );
  }
}

/** GET — retrieve a shared chat */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !/^[a-f0-9]{12}$/.test(id)) {
      return NextResponse.json({ error: "Invalid share ID" }, { status: 400 });
    }

    const raw = await redis.get(`${SHARE_PREFIX}${id}`);

    if (!raw) {
      return NextResponse.json(
        { error: "Shared conversation not found or has expired" },
        { status: 404 },
      );
    }

    const chat: SharedChat =
      typeof raw === "string" ? JSON.parse(raw) : (raw as SharedChat);

    return NextResponse.json({ success: true, chat });
  } catch (error) {
    console.error("❌ Share GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve shared conversation" },
      { status: 500 },
    );
  }
}
