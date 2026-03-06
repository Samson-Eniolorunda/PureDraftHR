import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/documents/[id] — fetch a single document (verify ownership) */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = await db.document.findUnique({ where: { id } });

  if (!document || document.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ document });
}

/** PUT /api/documents/[id] — update document content */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.document.findUnique({ where: { id } });

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, content } = body as { title?: string; content?: string };

  const document = await db.document.update({
    where: { id },
    data: {
      ...(title?.trim() && { title: title.trim() }),
      ...(content && { content }),
    },
  });

  return NextResponse.json({ document });
}

/** DELETE /api/documents/[id] — delete a document (verify ownership) */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.document.findUnique({ where: { id } });

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
