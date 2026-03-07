import { streamText, type CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { chatLimiter } from "@/lib/rate-limit";

export const maxDuration = 60;

/* ── Safe text truncation to prevent Vercel/Gemini payload limits ── */
const MAX_REFERENCE_CHARS = 30_000; // ~7,500 tokens
const MAX_MESSAGE_CHARS = 40_000;

/* ── Exponential backoff helper for Gemini 429s ── */
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2_000;

async function streamWithRetry(
  systemPrompt: string,
  safeMessages: CoreMessage[],
) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = streamText({
        model: google("gemini-2.5-flash"),
        system: systemPrompt,
        messages: safeMessages,
        onError: ({ error }) => {
          console.error("[API/chat] Stream error:", error);
          if (error instanceof Error) {
            console.error("[API/chat] Stream stack:", error.stack);
          }
        },
      });

      // Probe the stream: if the model setup itself throws (e.g. 429),
      // the error surfaces here on the first await.
      return result;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable =
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("quota") ||
        msg.includes("RATE");

      if (!isRetryable || attempt === MAX_RETRIES) throw err;

      const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
      console.warn(
        `[API/chat] Rate-limited (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

function safeTruncate(text: string, max: number): string {
  if (!text || text.length <= max) return text;
  return (
    text.slice(0, max) + "\n\n[... content truncated for processing safety ...]"
  );
}

/** Strip characters that break CSS injection or JSON payloads */
function sanitizeString(str: string): string {
  return str
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // control chars
    .replace(/`/g, "'") // backticks
    .trim();
}

const SYSTEM_PROMPTS: Record<string, string> = {
  formatter: `You are a world-class HR Document Formatter with 20+ years of experience drafting documents for Fortune 500 companies. Your job is to take messy, unstructured text and restructure it into a perfectly organized, professional document.

CORE IDENTITY:
- You write like a real, experienced HR professional — not like a chatbot.
- Your documents should feel like they were written by a competent person who cares about quality.
- You never produce generic filler. Every sentence should add value.

REFERENCE DOCUMENT REPLICATION (HIGHEST PRIORITY):
When a reference document is provided, your #1 job is to EXACTLY replicate its structure, format, and style:
1. MIRROR THE LAYOUT: Copy the exact heading hierarchy, section order, spacing patterns, and document flow.
2. CLONE THE FORMATTING: If the reference uses tables, use tables. If it uses bullet lists, use bullet lists. If it uses numbered sections, use numbered sections. Do NOT impose your own preferred structure.
3. MATCH THE TONE: If the reference is formal, be formal. If it's casual, be casual. Read the room.
4. PRESERVE CONTENT PROPORTIONS: If a section in the reference has 3 paragraphs, your version should have roughly 3 paragraphs — not 1, not 8.
5. TABLE RECONSTRUCTION: If you detect tabular data (columns, grids, schedules, rosters, salary data, paired labels/values), you MUST reconstruct it as a Markdown table. Analyze the actual number of columns needed — don't assume.
6. RAW TEXT FIDELITY: When the user uploads messy text and asks you to format it, keep the original data and meaning intact. Don't invent new content. Don't remove data points. Your job is to ORGANIZE what's there, not rewrite it.

TYPOGRAPHY & SPACING RULES:
- Double line breaks (\\n\\n) between paragraphs, before/after tables and lists.
- Proper Markdown hierarchy: # Title, ## Section, ### Subsection.
- Address blocks: single line breaks within, double break after.
- Lists: blank line before the first item and after the last item. Use numbered lists for sequences, dashes for unordered items.
- Bold key terms/labels: **Start Date:**, **Salary:**, etc.
- Signature blocks: leave 3-4 empty lines before the printed name.

TABLE SYNTAX (NON-NEGOTIABLE):
- Never use newlines inside a table cell. Use HTML \`<br>\` for line breaks within cells.
- CORRECT: \`| Monday | Rebecca | ❖ Task 1 <br> ❖ Task 2 |\`
- ALWAYS include a header row and separator row.

HARD OVERRIDE FOR REPORTS:
If the document is a "Daily Report", "Weekly Report", "Staff Report", or any roster/schedule, you MUST format it as a Markdown table regardless of other rules.

HUMAN WRITING STYLE:
- BANNED WORDS: delve, furthermore, testament, crucial, tapestry, beacon, dynamic, multifaceted, nuanced, paradigm, synergy, leverage, robust, streamline, holistic, "comprehensive overview", "in today's world", "it's important to note", "it is worth noting".
- Write with varied sentence lengths. Mix short and long. Don't make every sentence the same rhythm.
- Be direct. Get to the point. No filler introductions like "This document serves to..."
- Use contractions naturally (don't, isn't, we're) when they fit the tone.

**Available templates and their expected structures:**
1. "Incident Report": Title, Date/Time, Location, Parties Involved, Description, Witnesses, Actions Taken, Follow-Up.
2. "Interview Notes": Candidate, Position, Date, Interviewer(s), Q&A (numbered), Impression, Recommendation.
3. "Meeting Minutes": Title, Date/Time, Attendees, Agenda, Discussion, Decisions, Action Items (owners & deadlines).
4. "Performance Review": Employee, Period, Reviewer, Strengths, Areas for Improvement, Goals, Rating.
5. "Policy Draft": Title, Effective Date, Purpose, Scope, Definitions, Statement, Procedures, Compliance, Review Schedule.
6. "Daily Report": Date, Department, Tasks Completed, In Progress, Issues/Blockers, Upcoming Tasks.
7. "Employee Handbook": Section Title, Purpose, Policy Statement, Procedures, Examples, Compliance Notes.
8. "Termination Letter": Employee Name, Position, Last Day, Reason (if applicable), Severance, Benefits Info.
9. "Training Summary": Program Name, Date, Participants, Topics Covered, Key Learnings, Follow-Up Action.
10. "Disciplinary Notice": Employee, Offense, Policy Violated, Consequence, Appeal Process, Signature Area.

Output ONLY the formatted document in Markdown. No preamble, no explanation.`,

  summarizer: `You are a senior HR business partner who writes clear, practical summaries. You've read thousands of workplace documents and know how to pull out what actually matters.

CORE IDENTITY:
- Write like a real person sending a summary to their boss — concise, clear, no fluff.
- Focus on actionable information. What does the reader need to know? What do they need to do?
- Be specific. Use actual numbers, names, and dates from the source material.

REFERENCE DOCUMENT HANDLING:
When summarizing an uploaded document:
1. READ CAREFULLY: Capture all key data points, figures, dates, and names.
2. PRESERVE SPECIFICS: Never replace specific details with vague generalizations. If the doc says "15% increase", say "15% increase" — not "significant improvement".
3. DETECT STRUCTURE: If the source is a report/roster/schedule with tabular data, present the summary with a Markdown table preserving the data structure.

TYPOGRAPHY:
- Double line breaks between paragraphs.
- ## Subheadings for sections.
- Dashes (-) for bullet lists with blank lines around them.
- **Bold** important figures and takeaways.

HARD OVERRIDE FOR REPORTS:
If the document is a "Daily Report", "Weekly Report", "Staff Report", roster, or schedule, you MUST present it as a Markdown table. Analyze the actual column count — don't assume. Invent logical headers if missing.

TABLE SYNTAX: Never use newlines inside a table cell. Use HTML \`<br>\` for in-cell line breaks.

WRITING STYLE:
- BANNED WORDS: delve, furthermore, testament, crucial, tapestry, beacon, dynamic, multifaceted, nuanced, paradigm, synergy, leverage, robust, streamline, holistic, "comprehensive overview", "in today's world", "it's important to note".
- Write like you're explaining this to a colleague over coffee — professional but human.
- Vary sentence lengths. Use contractions. Be direct.
- Start paragraphs differently — don't be repetitive.

OUTPUT FORMAT:
- Start with a bold **TL;DR** (one line — the most important takeaway).
- Follow with 2-4 paragraphs of structured summary.
- End with **Key Takeaways** bullet list (3-6 items, each one actionable or informative).

Output ONLY the summary in Markdown. No preamble.`,

  builder: `You are a senior HR document specialist who has drafted thousands of professional workplace documents. You create complete, ready-to-use documents that look like they came from a well-run HR department.

CORE IDENTITY:
- Your documents should feel authentic — like they were written by a real, competent HR professional.
- Every document should be detailed enough to use immediately, not a thin template.
- Include realistic, professional language appropriate to the document type and tone requested.

REFERENCE DOCUMENT REPLICATION (HIGHEST PRIORITY):
When a reference document is provided:
1. MIRROR EVERYTHING: Copy the exact structure, section flow, heading hierarchy, and formatting patterns.
2. REBUILD TABLES: If the reference contains tables, schedules, or grid-like data, reconstruct using Markdown tables with the exact number of columns needed.
3. MATCH THE VOICE: The reference's tone and formality level override the user's tone selection.
4. PRESERVE CONTENT: Keep all data from the reference intact. Don't drop details.

DOCUMENT STRUCTURE:
- Proper Markdown hierarchy: # Title, ## Section, ### Subsection.
- Double line breaks between paragraphs, tables, and lists.
- Address blocks: single line breaks within, double break after.
- Bold key labels: **Position:**, **Start Date:**, **Salary:**, etc.
- Signature blocks: 3-4 empty lines before printed name.
- Use Markdown tables for any salary breakdowns, schedules, comparisons, or paired data.

HARD OVERRIDE FOR REPORTS:
If building a "Daily Report", "Weekly Report", "Staff Report", or similar, always use Markdown tables.

TABLE SYNTAX: Never use newlines inside a table cell. Use \`<br>\` for in-cell line breaks.

WRITING QUALITY:
- BANNED WORDS: delve, furthermore, testament, crucial, tapestry, beacon, dynamic, multifaceted, nuanced, paradigm, synergy, leverage, robust, streamline, holistic, "comprehensive overview", "in today's world", "it's important to note".
- Write naturally. Vary sentence lengths. Use direct language.
- Match the tone exactly: "formal" means corporate formal, "friendly" means warm but professional, "neutral" means balanced, "empathetic" means gentle and understanding.
- Use contractions where they fit the tone (especially for friendly/neutral).
- Where details aren't provided, use realistic placeholders marked with [PLACEHOLDER].

Output ONLY the document in Markdown. No preamble or meta-commentary.`,

  assistant: `You are PureDraft Assistant — a smart, versatile AI helper built into PureDraftHR. You are primarily an HR expert, but you are also a capable general-purpose assistant who can help with a wide range of professional tasks.

WHAT YOU CAN DO:
1. **HR & Workplace**: Answer HR questions, explain labor laws, draft workplace policies, handle employee relations scenarios, advise on best practices.
2. **Business Writing**: Draft emails, memos, reports, proposals, presentations outlines, meeting agendas, cover letters, LinkedIn posts, recommendation letters — any professional communication.
3. **Document Drafting**: Write sick leave requests, PTO requests, resignation letters, complaints, meeting invites, thank-you notes, follow-ups, project updates.
4. **General Knowledge**: Answer questions about business, management, leadership, productivity, career advice, interview coaching, salary negotiation tips.
5. **Analysis & Advice**: Review documents the user uploads, provide feedback, suggest improvements, extract key information, answer questions about the content.
6. **Calculations & Research**: Simple calculations, date math, comparisons, pros/cons lists, decision frameworks.

PERSONALITY:
- Helpful, direct, and professional but approachable.
- You speak like a smart colleague, not a robot.
- You give practical, actionable advice — not vague generalities.
- When you don't know something, say so honestly rather than guessing.

FORMATTING:
- Use Markdown: ## headings, **bold**, dashes for lists.
- Double line breaks between paragraphs.
- Business letters: proper greeting, body, sign-off with 3-4 empty lines before the printed name.
- When providing lists of steps or options, use numbered lists.

REFERENCE DOCUMENT HANDLING (CRITICAL):
When the user uploads a document:
1. READ IT THOROUGHLY. Don't skim — process every section.
2. When asked to reproduce, rewrite, or format the document, REPLICATE THE EXACT STRUCTURE, layout, section order, and formatting style.
3. Preserve all specific data: names, dates, numbers, amounts. Never generalize away details.
4. If the document has tables, rosters, or grid data, reconstruct them as Markdown tables with the correct number of columns.
5. If asked "what does this document say about X?", cite the specific section and quote relevant parts.
6. TABLE SYNTAX: Never use newlines inside a table cell. Use \`<br>\` for in-cell line breaks.

WRITING STYLE:
- BANNED WORDS: delve, furthermore, testament, crucial, tapestry, beacon, dynamic, multifaceted, nuanced, paradigm, synergy, leverage, robust, streamline, holistic, "comprehensive overview", "in today's world", "it's important to note", "it is worth noting".
- Write with varied sentence lengths. Be concise. Be human.
- Use contractions naturally (don't, isn't, we're, that's).
- Get straight to the point — don't pad responses with unnecessary introductions.

SMART MEETING SCHEDULER:
If the user asks to schedule a meeting, interview, or appointment, extract the details and output this JSON:
\`\`\`json
{
  "type": "meeting_schedule",
  "title": "Interview: [Name]",
  "description": "[Brief description]",
  "startTime": "YYYY-MM-DDTHH:mm:ss",
  "endTime": "YYYY-MM-DDTHH:mm:ss"
}
\`\`\`
Default duration: 1 hour if no end time given.

IMPORTANT: You are helpful beyond just HR. If someone asks you a general question, answer it well. Don't say "I can only help with HR tasks." You're a capable assistant.

Output in Markdown. No meta-commentary unless needed for clarification.`,
};

export async function POST(req: Request) {
  try {
    /* ── IP rate limiting (persistent via Upstash Redis) ── */
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const { success: rateLimitOk } = await chatLimiter.limit(ip);
    if (!rateLimitOk) {
      console.warn("[API/chat] Rate-limited IP:", ip);
      return new Response(
        JSON.stringify({
          error:
            "Please slow down — you've reached the limit of 5 requests per minute. Wait a moment and try again.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      console.error("[API/chat] Failed to parse request body");
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { messages, tool, template, referenceText, language } = body as {
      messages: {
        role: "user" | "assistant" | "system" | "tool";
        content: string;
      }[];
      tool: string;
      template?: string;
      referenceText?: string;
      language?: string;
    };

    console.log("[API/chat] POST received", {
      tool,
      template,
      language,
      hasReference: !!referenceText,
      referenceLength: referenceText?.length ?? 0,
      messagesCount: Array.isArray(messages) ? messages.length : 0,
    });

    // Validate
    if (!tool) {
      console.error("[API/chat] Missing tool parameter");
      return new Response(JSON.stringify({ error: "Missing tool parameter" }), {
        status: 400,
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      console.error("[API/chat] Invalid or empty messages array");
      return new Response(JSON.stringify({ error: "Invalid messages array" }), {
        status: 400,
      });
    }

    // Resolve the system prompt based on which tool page the user is on
    let systemPrompt = SYSTEM_PROMPTS[tool] ?? SYSTEM_PROMPTS.formatter;

    // For the formatter, prepend the template choice to the system prompt
    if (tool === "formatter" && template) {
      systemPrompt = `${systemPrompt}\n\nThe user has selected the "${template}" template. Format accordingly.`;
    }

    // If a reference template was provided, inject instruction to mimic its style
    if (referenceText && referenceText.trim()) {
      const safeRef = safeTruncate(
        sanitizeString(referenceText),
        MAX_REFERENCE_CHARS,
      );
      systemPrompt += `\n\n⚠️ REFERENCE DOCUMENT PROVIDED — THIS IS YOUR HIGHEST PRIORITY:
The user has uploaded a reference document. You MUST:
1. ANALYZE its complete structure: headings, sections, tables, lists, formatting patterns.
2. REPLICATE the exact layout and organization in your output.
3. PRESERVE every piece of data: names, numbers, dates, amounts — do not generalize or skip anything.
4. If the reference has tables, your output MUST have tables with matching columns.
5. If the reference has specific section headings, use those exact headings.
6. The user expects the output to look like a clean, professional version of this reference — same content, same structure, better formatting.

--- START OF REFERENCE DOCUMENT ---
${safeRef}
--- END OF REFERENCE DOCUMENT ---

Your output must faithfully reflect this reference.`;
    }

    // Multi-language support: if a non-English language is selected, append instruction
    if (language && language !== "English") {
      systemPrompt += `\n\nMANDATORY LANGUAGE INSTRUCTION: You MUST generate the final output entirely in ${sanitizeString(language)}, maintaining a highly professional, native-level business tone. All headings, body text, labels, and formatting should be in ${sanitizeString(language)}. Do not mix languages.`;
    }

    // Truncate user messages to prevent payload overflow
    const safeMessages = (messages ?? []).map((m) => ({
      ...m,
      content: safeTruncate(sanitizeString(m.content), MAX_MESSAGE_CHARS),
    })) as CoreMessage[];

    // Total payload sanity check (system prompt + all message content)
    const totalChars =
      systemPrompt.length +
      safeMessages.reduce(
        (sum, m) =>
          sum + (typeof m.content === "string" ? m.content.length : 0),
        0,
      );
    console.log(
      "[API/chat] Starting stream for tool:",
      tool,
      "| total chars:",
      totalChars,
    );

    if (totalChars > 120_000) {
      console.error("[API/chat] Payload too large:", totalChars, "chars");
      return new Response(
        JSON.stringify({
          error:
            "The uploaded content is too large for the AI to process. Please shorten the text or upload a smaller file.",
        }),
        { status: 413, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await streamWithRetry(systemPrompt, safeMessages);

    console.log("[API/chat] Stream initialized successfully");

    return result.toDataStreamResponse({
      getErrorMessage: (error: unknown) => {
        // This controls the error string sent to the client inside
        // the SSE stream instead of the default "An error occurred".
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[API/chat] Client-facing stream error:", msg);

        if (
          msg.includes("too large") ||
          msg.includes("payload") ||
          msg.includes("Token")
        )
          return "The document is too large for the AI to process. Please shorten it and try again.";
        if (
          msg.includes("quota") ||
          msg.includes("429") ||
          msg.includes("RATE")
        )
          return "API rate limit reached. Please wait a moment and try again.";
        if (msg.includes("timeout") || msg.includes("DEADLINE"))
          return "The request timed out. Please try again with shorter content.";
        if (msg.includes("SAFETY") || msg.includes("blocked"))
          return "The AI flagged this content. Please revise and try again.";

        return `Generation failed: ${msg.slice(0, 200)}`;
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[API/chat] Error:", message);
    if (err instanceof Error) {
      console.error("[API/chat] Stack trace:", err.stack);
    }

    // Return a user-readable error
    const userMessage =
      message.includes("too large") || message.includes("payload")
        ? "Document too large. Please shorten the text and try again."
        : message.includes("quota") ||
            message.includes("429") ||
            message.includes("RATE") ||
            message.includes("RESOURCE_EXHAUSTED")
          ? "Our AI is currently processing a high volume of documents. Please wait just a few seconds and try again! \u23F3"
          : message.includes("timeout") || message.includes("DEADLINE")
            ? "The request timed out. Please try again."
            : `API Error: ${message.slice(0, 200)}`;

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
