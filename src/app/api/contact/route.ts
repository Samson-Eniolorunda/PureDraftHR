import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactLimiter } from "@/lib/rate-limit";

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
    /* ── Rate limit check (persistent via Upstash Redis) ── */
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const { success: rateLimitOk } = await contactLimiter.limit(ip);
    if (!rateLimitOk) {
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

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY env var is not set");
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
    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "UTC",
    });

    // Send email via Resend
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "PureDraftHR <onboarding@resend.dev>";

    console.log("[Contact] Sending email:", {
      from: fromEmail,
      to: contactEmail,
      replyTo: body.email,
      subject: `New Contact: ${body.subject}`,
    });

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: contactEmail,
      replyTo: body.email,
      subject: `New Contact: ${body.subject}`,
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 32px;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
          <td style="background:rgba(255,255,255,0.2);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;font-weight:bold;font-size:16px;color:#ffffff;">PD</td>
          <td style="padding-left:12px;font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">PureDraft HR</td>
        </tr></table>
        <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Contact Form Submission</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="background-color:#ffffff;padding:32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding-bottom:20px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">From</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">${safeName}</p>
            <p style="margin:2px 0 0;font-size:14px;color:#2563eb;"><a href="mailto:${safeEmail}" style="color:#2563eb;text-decoration:none;">${safeEmail}</a></p>
          </td></tr>
          <tr><td style="border-top:1px solid #e5e7eb;padding:20px 0;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">Subject</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${safeSubject}</p>
          </td></tr>
          <tr><td style="border-top:1px solid #e5e7eb;padding:20px 0 0;">
            <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">Message</p>
            <div style="font-size:14px;line-height:1.7;color:#374151;background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">${safeMessage}</div>
          </td></tr>
        </table>
      </td></tr>
      <!-- Signature -->
      <tr><td style="background-color:#ffffff;border-top:1px solid #e5e7eb;padding:24px 32px;">
        <p style="margin:0 0 4px;font-size:14px;color:#374151;">Best Regards,</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">PureDraft HR Support</p>
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">AI-Powered HR Document Platform</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">Received ${timestamp} UTC</p>
        <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} PureDraft HR &middot; AI-Powered HR Documents</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    });

    if (sendError) {
      console.error("❌ Resend API error:", JSON.stringify(sendError));
      console.error("❌ From email:", fromEmail, "| To:", contactEmail);
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
      "| ID:",
      sendData?.id,
    );

    /* ── Auto-reply confirmation email to the person who contacted us ── */
    try {
      await resend.emails.send({
        from: fromEmail,
        to: body.email,
        replyTo: contactEmail,
        subject: `We received your message — ${body.subject}`,
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 32px;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
          <td style="background:rgba(255,255,255,0.2);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;font-weight:bold;font-size:16px;color:#ffffff;">PD</td>
          <td style="padding-left:12px;font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">PureDraft HR</td>
        </tr></table>
      </td></tr>
      <!-- Body -->
      <tr><td style="background-color:#ffffff;padding:40px 32px;">
        <p style="margin:0 0 8px;font-size:15px;color:#6b7280;">Hi ${safeName},</p>
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111827;">Thank you for reaching out!</h2>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#374151;">We've received your message and our team will get back to you as soon as possible, typically within 24-48 hours.</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb;margin:0 0 20px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">Your message</p>
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#111827;">${safeSubject}</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">${safeMessage}</p>
        </div>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#374151;">In the meantime, feel free to explore our AI-powered tools:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
          <td style="background:#2563eb;border-radius:8px;"><a href="https://puredrafthr.btbcoder.site/builder" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Try Document Builder</a></td>
          <td style="width:12px;"></td>
          <td style="background:#f3f4f6;border-radius:8px;"><a href="https://puredrafthr.btbcoder.site/assistant" style="display:inline-block;padding:12px 28px;color:#374151;font-size:14px;font-weight:600;text-decoration:none;">Chat with AI</a></td>
        </tr></table>
      </td></tr>
      <!-- Signature -->
      <tr><td style="background-color:#ffffff;border-top:1px solid #e5e7eb;padding:24px 32px;">
        <p style="margin:0 0 4px;font-size:14px;color:#374151;">Best Regards,</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">The PureDraft HR Team</p>
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">AI-Powered HR Document Platform</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} PureDraft HR &middot; <a href="https://puredrafthr.btbcoder.site" style="color:#9ca3af;text-decoration:underline;">puredrafthr.btbcoder.site</a></p>
        <p style="margin:6px 0 0;font-size:10px;color:#d1d5db;">This is an automated confirmation. Please do not reply to this email — just reply to our follow-up instead.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
      });
      console.log("📧 Auto-reply sent to", body.email);
    } catch (autoReplyErr) {
      // Non-critical — log but don't fail the request
      console.error("⚠️ Auto-reply failed:", autoReplyErr);
    }

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
