import { NextRequest, NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  POST /api/extract — extract plain text from uploaded PDF or DOCX   */
/*  Runs on the Node.js runtime (not Edge) for fs/buffer access.       */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();
    let text = "";

    if (name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else if (name.endsWith(".pdf")) {
      // Dynamic import to avoid bundling when not needed
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use .txt, .pdf, or .docx" },
        { status: 400 },
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Extraction error:", err);
    return NextResponse.json(
      { error: "Failed to extract text" },
      { status: 500 },
    );
  }
}
