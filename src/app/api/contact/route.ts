import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

  return null;
}

export async function POST(request: NextRequest) {
  try {
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
        { success: false, error: "Server misconfigured. Please try again later." },
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

    console.log("📧 Contact form email sent successfully to", process.env.CONTACT_EMAIL);

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
