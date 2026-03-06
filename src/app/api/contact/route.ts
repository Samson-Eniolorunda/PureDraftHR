import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* ── In-memory rate limiter (3 submissions per 10 min per IP) ── */
const CONTACT_RATE_WINDOW = 600_000;
const CONTACT_RATE_MAX = 3;
const contactIpHits = new Map<string, number[]>();

function isContactRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = contactIpHits.get(ip) ?? [];
  const recent = hits.filter((t) => now - t < CONTACT_RATE_WINDOW);
  if (recent.length >= CONTACT_RATE_MAX) {
    contactIpHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  contactIpHits.set(ip, recent);
  return false;
}

/** Escape HTML special chars to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Validate email format (requires TLD)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate form data
function validateFormData(data: ContactFormData): string | null {
  if (!data.name || data.name.trim().length === 0) {
    return "Name is required";
  }

  if (!data.email || !isValidEmail(data.email)) {
    return "Valid email is required";
  }

  if (!data.subject || data.subject.trim().length === 0) {
    return "Subject is required";
  }

  if (!data.message || data.message.trim().length === 0) {
    return "Message is required";
  }

  if (data.message.length < 10) {
    return "Message must be at least 10 characters long";
  }

  if (
    data.name.length > 200 ||
    data.subject.length > 300 ||
    data.message.length > 5000
  ) {
    return "One or more fields exceed the maximum length";
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    /* ── Rate limit check ── */
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    if (isContactRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many submissions. Please wait a few minutes and try again.",
        },
        { status: 429 },
      );
    }

    const body = (await request.json()) as ContactFormData;

    // Validate form data
    const validationError = validateFormData(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 },
      );
    }

    // Guard against missing env var
    const contactEmail = process.env.CONTACT_EMAIL;
    if (!contactEmail) {
      console.error("❌ CONTACT_EMAIL env var is not set");
      return NextResponse.json(
        {
          success: false,
          error: "Server misconfigured. Please try again later.",
        },
        { status: 500 },
      );
    }

    // Escape user-supplied values to prevent HTML injection
    const safeName = escapeHtml(body.name);
    const safeEmail = escapeHtml(body.email);
    const safeSubject = escapeHtml(body.subject);
    const safeMessage = escapeHtml(body.message).replace(/\n/g, "<br>");

    // Send email via Resend
    const { error: sendError } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: contactEmail,
      subject: `New Contact Form Submission - HR App: ${body.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <hr />
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
        <hr />
        <p style="color: #888; font-size: 12px;">Sent from PureDraftHR Contact Form at ${new Date().toISOString()}</p>
      `,
    });

    if (sendError) {
      console.error("❌ Resend API error:", sendError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send your message. Please try again later.",
        },
        { status: 500 },
      );
    }

    console.log(
      "📧 Contact form email sent successfully to",
      process.env.CONTACT_EMAIL,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for contacting us! We'll get back to you soon.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your message. Please try again later.",
      },
      { status: 500 },
    );
  }
}
