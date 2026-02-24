import { NextRequest, NextResponse } from "next/server";

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
    // Add CORS headers for preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const body = await request.json() as ContactFormData;

    // Validate form data
    const validationError = validateFormData(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // Log the contact form submission (in production, send email here)
    console.log("📧 Contact form submission received:", {
      timestamp: new Date().toISOString(),
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
    });

    // TODO: Integrate with email service like:
    // - Resend (recommended for Next.js)
    // - SendGrid
    // - Nodemailer
    // - AWS SES
    //
    // Example with Resend:
    // const { data, error } = await resend.emails.send({
    //   from: "noreply@puredrafthr.com",
    //   to: "eniolorundasamson@gmail.com",
    //   subject: `New Contact Form: ${body.subject}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>Name:</strong> ${body.name}</p>
    //     <p><strong>Email:</strong> ${body.email}</p>
    //     <p><strong>Subject:</strong> ${body.subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${body.message.replace(/\n/g, "<br>")}</p>
    //   `,
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for contacting us! We'll get back to you soon.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your message. Please try again later.",
      },
      { status: 500 }
    );
  }
}
