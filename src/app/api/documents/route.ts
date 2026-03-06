import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/** GET /api/documents — list documents for the authenticated user */
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get("limit")) || 20),
  );
  const tool = url.searchParams.get("tool");
  const search = url.searchParams.get("search")?.trim();

  const where: Record<string, unknown> = { userId };
  if (tool) where.tool = tool;
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [documents, total] = await Promise.all([
    db.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        tool: true,
        docType: true,
        createdAt: true,
        updatedAt: true,
        // Return a preview snippet (first 200 chars) instead of full content
        content: true,
      },
    }),
    db.document.count({ where }),
  ]);

  // Truncate content to preview
  const docs = documents.map((d) => ({
    ...d,
    preview: d.content.slice(0, 200),
    content: undefined,
  }));

  return NextResponse.json({
    documents: docs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

/** POST /api/documents — save a new document */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, tool, docType } = body as {
    title: string;
    content: string;
    tool: string;
    docType?: string;
  };

  if (!title?.trim() || !content?.trim() || !tool?.trim()) {
    return NextResponse.json(
      { error: "Title, content, and tool are required." },
      { status: 400 },
    );
  }

  if (title.length > 300) {
    return NextResponse.json(
      { error: "Title must be 300 characters or less." },
      { status: 400 },
    );
  }

  if (content.length > 200_000) {
    return NextResponse.json(
      { error: "Content is too large to save." },
      { status: 400 },
    );
  }

  const validTools = ["builder", "formatter", "summarizer", "assistant"];
  if (!validTools.includes(tool)) {
    return NextResponse.json({ error: "Invalid tool type." }, { status: 400 });
  }

  const document = await db.document.create({
    data: {
      userId,
      title: title.trim(),
      content,
      tool,
      docType: docType?.trim() || null,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
