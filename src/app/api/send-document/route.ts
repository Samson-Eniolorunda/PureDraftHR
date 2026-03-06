import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { emailLimiter } from "@/lib/rate-limit";
import { markdownToHtml } from "@/lib/markdown-to-html";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

export async function POST(request: NextRequest) {
  try {
    /* ── Rate limit ── */
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const { success: rateLimitOk } = await emailLimiter.limit(ip);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Too many email requests. Please wait a few minutes." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { recipientEmail, subject, content } = body as {
      recipientEmail: string;
      subject: string;
      content: string;
    };

    /* ── Validation ── */
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      return NextResponse.json(
        { error: "A valid recipient email is required." },
        { status: 400 },
      );
    }

    if (!subject || subject.trim().length === 0 || subject.length > 300) {
      return NextResponse.json(
        { error: "A valid subject is required (max 300 characters)." },
        { status: 400 },
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Document content is required." },
        { status: 400 },
      );
    }

    if (content.length > 100_000) {
      return NextResponse.json(
        { error: "Document content is too large to email." },
        { status: 400 },
      );
    }

    /* ── Convert markdown to styled HTML ── */
    const htmlBody = markdownToHtml(content);

    const emailHtml = `
      <div style="max-width: 700px; margin: 0 auto; font-family: Arial, sans-serif; color: #1a1a1a;">
        ${htmlBody}
        <hr style="margin-top: 2em; border: none; border-top: 1px solid #e5e5e5;" />
        <p style="color: #888; font-size: 11px;">
          Sent via <strong>PureDraftHR</strong> &mdash; AI-Powered HR Document Generation
        </p>
      </div>
    `;

    /* ── Send via Resend ── */
    const { error: sendError } = await resend.emails.send({
      from: "PureDraftHR <onboarding@resend.dev>",
      to: recipientEmail,
      subject: subject.trim(),
      html: emailHtml,
    });

    if (sendError) {
      console.error("❌ Resend send-document error:", sendError);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ send-document route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
