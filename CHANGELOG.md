# Changelog

All notable changes to PureDraft HR will be documented in this file.

## [Unreleased]

### Added

- 💬 **ChatGPT/Gemini-style Assistant UX**: Full chat bubble interface with message history, typing indicator, suggestion chips, pinned input bar, and "New Chat" button
- 📩 **Email Provider Selection**: Users choose their own email provider (Gmail, Outlook, Yahoo, Zoho, ProtonMail, or default app) via a dropdown — opens a pre-filled compose window instead of server-side email sending
- 📅 **Smart Meeting Scheduler** (Assistant): AI-extracted meeting details rendered as a Meeting Card with "Add to Google Calendar" and "Download Outlook Invite (.ics)" buttons
- 🌍 **Multi-Language Translation**: Output language selector on all 4 tools supporting 8 languages — English, Spanish, French, German, Mandarin Chinese, Portuguese, Arabic, Hindi
- 📂 **My Templates Library**: Save, load, and delete reference text snippets with localStorage; integrated into Builder, Formatter, and Summarizer
- ✏️ **Custom Document Type ("Other (Custom)")**: Builder and Formatter include a freeform text input for unlisted document/template types
- 📊 **Bulk CSV Generation** (Builder): Toggle bulk mode, upload a CSV, batch-generate one document per row with live progress bar
- 🎚️ **Document Styling System**: Typography modal with font family, heading/body font sizes, line spacing, and 7 bullet styles — preserved across PDF, DOCX, and clipboard exports
- 📋 **Rich Copy to Clipboard**: Copies HTML-formatted content for pasting into Word, Docs, etc.
- 🏷️ **Dynamic export filenames**: Extracted from H1 heading with sanitized fallback
- 📄 Privacy, Terms of Service, and FAQ pages with full feature coverage
- 📖 Contact page with working form
- 🔗 **PWA icon updated**: Icon now displays "PD" (PureDraft) instead of "HR"

### Changed

- 🤖 **AI branding**: Disclaimer text changed from "Gemini AI" to "PureDraft AI" across Builder, Formatter, and Summarizer notes
- 🧭 **Dashboard filter order**: Assistant tab now appears first after "All" in the My Documents filter bar
- 🧭 **My Documents in sidebar**: Dashboard link moved into the main nav list alongside Assistant, Builder, Formatter, and Summarizer (still auth-gated)
- 🚫 **Footer removed**: Global footer removed from layout — essential links (Privacy, Terms, FAQ) remain in sidebar
- 📩 **Email: no server dependency**: Removed Resend server-side email for documents — now uses client-side provider-specific compose URLs
- 📄 **FAQ updated**: Email answer reflects new provider-based approach; cost answer updated to remove Resend reference
- 🔒 **Privacy Policy updated**: Email section rewritten to clarify client-side email handling
- 🛡️ **Sign-in flash fix**: Uses `isLoaded` from `useAuth()` to prevent layout shift on page load
- 📜 **Assistant scroll fix**: Auto-scroll only triggers after user sends a message (prevents scroll-to-bottom on page load)
- 📱 **Mobile text wrap**: "Supported formats" text in drop-zone now uses `whitespace-nowrap` to prevent line break on small screens

### Fixed

- 🔧 Service Worker message listener to prevent "message channel closed" errors
- 📱 Mobile textarea keyboard coverage with focus-scroll delay
- 🔍 Favicon caching on Vercel with cache-bust query params
- 🧩 Font Family dropdown group parsing bug
- 📋 PDF/DOCX bullet export with inline character injection
- 📤 File upload UI state reset

---

## Previous Releases

### Added (from earlier unreleased)

- 💬 **HR Assistant page** (`/assistant`): Freeform HR Copilot for Q&A, drafting workplace emails, and policy guidance — with file upload, styled send, quick send (Enter key), and full export support
- 📄 **Chat with a Document**: Upload a PDF, DOCX, or TXT to the Assistant page and ask questions about its contents; document text injected as reference context for the AI
- 🌍 **Multi-Language Translation**: Output language selector on all 4 tools (Formatter, Summarizer, Builder, Assistant) supporting 8 languages — English, Spanish, French, German, Mandarin Chinese, Portuguese, Arabic, Hindi
- 📂 **My Templates Library**: Save, load, and delete reference text snippets using `localStorage`; integrated into DocumentFormFooter for Builder, Formatter, and Summarizer
- ✏️ **Custom Document Type ("Other (Custom)")**: Builder and Formatter now include an "Other (Custom)" option with a freeform text input for unlisted document/template types
- 📊 **Bulk CSV Generation** (Builder): Toggle bulk mode, upload a CSV file, and batch-generate one document per row with a live progress bar; supports per-document and combined export
- 🔧 `useTemplateLibrary` hook for localStorage-based template persistence
- 🧩 `LanguageSelector` component with Globe icon and 8-language dropdown
- 🧩 `TemplateLibrary` component for saved template management UI (save/load/delete)
- 📄 `assistant` system prompt in API route — knowledgeable HR Assistant for personal drafts and document Q&A
- 🌐 Language parameter support in API `/api/chat` route — appends mandatory language instruction to system prompt when non-English selected
- 🧭 "Assistant" navigation item with MessageCircle icon in sidebar and mobile tabs
- 📅 **Smart Meeting Scheduler** (Assistant): Ask the AI to schedule a meeting — response is intercepted and rendered as a Meeting Card with "Add to Google Calendar" (URL template) and "Download Outlook Invite (.ics)" (generated file) buttons
- 🧩 `MeetingCard` component with `parseMeetingFromResponse()` utility for detecting structured meeting JSON in AI responses
- 📆 Google Calendar URL generation (`calendar.google.com/calendar/render?action=TEMPLATE`) with ISO 8601 → GCal date format conversion
- 📥 `.ics` file generation with `BEGIN:VCALENDAR`/`VEVENT` spec-compliant output and browser download trigger

### Changed

- 🔢 Builder DOC_TYPES expanded from 24 to 25 types (+ "Other (Custom)")
- 📋 Formatter template list now includes "Other (Custom)" option with conditional text input
- 🧭 Navigation updated: 4 tools (Formatter, Summarizer, Builder, Assistant) — Builder icon changed from FileText to PenTool
- 🧭 **Navigation reordered**: Assistant is now the first nav item; default landing page changed from `/builder` to `/assistant`
- 🪟 **Modal overflow fix**: Changed modal panel from `overflow-auto` to `overflow-visible` with scrollable body (`max-h-[60vh] overflow-y-auto`) so dropdown `<select>` menus are no longer clipped
- 📄 **Privacy Policy page rewritten**: Explicit light/dark mode text colors (`text-gray-900 dark:text-gray-100`), updated to cover all 4 tools, Saved Templates, Meeting Scheduler; removed hardcoded email — replaced with `/contact` link
- 📜 **Terms of Service page rewritten**: Proper contrast classes, detailed "Description of Service" section covering all features (Assistant, Builder, Formatter, Summarizer, Bulk CSV, Meeting Scheduler, Multi-Language); removed hardcoded email — replaced with `/contact` link
- ❓ **FAQ page rewritten**: 18 questions covering all current features (Smart Meeting Scheduler, Bulk CSV, Custom Doc Types, My Templates Library, Multi-Language, Document Styling); removed hardcoded email and GitHub links — replaced with `/contact` link; proper light/dark mode styling

### Fixed

- 🔧 Service Worker message listener to prevent "message channel closed" errors
- 📱 Mobile textarea keyboard coverage by adding focus-scroll with delay
- 🎨 Select dropdown arrow behavior (up when closed, down when open)
- 🔗 Footer layout on mobile: prevent bottom nav bar overlap (pb-24), center links/social, copyright last
- ♿ ARIA accessibility violations: convert boolean attributes to strings ("true"/"false")
- 🔍 Favicon caching on Vercel by adding cache-bust query params (?v=v2)
- 📝 Escaped apostrophes in contact/page.tsx for ESLint compliance (Lines 78, 137, 250)
- 🔤 UTF-8 encoding issues in API routes by removing special Unicode characters
- 🧩 **Font Family dropdown bug**: `<optgroup>` children were flattened into a single option — added recursive `parseChildren()` parser to handle groups correctly with styled separator headers
- 📋 **PDF bullet export**: html2pdf.js ignores CSS `::before` pseudo-elements — now injects bullet character directly into `<li>` text content
- 📋 **DOCX bullet export**: `docx` library's `bullet: { level: 0 }` ignores custom symbols — now prepends bullet character as text with `indent: { left: 360 }`
- 📤 **File upload UI state**: file input reverted to "Choose File" after upload — now shows green success state with CheckCircle icon, filename, and X remove button

### Added

- 🎣 `useDevSkeletonPreview` hook for dev-mode skeleton UI testing via ?devSkeletons=true URL param
- 🪵 Comprehensive console logging with structured prefixes ([API/chat], [SW], [Layout])
- 📊 Service Worker logging at lifecycle events (install, activate, fetch, message)
- 🏷️ API request/response logging with validation error traces
- 🎨 Monitor icon for system theme toggle (lucide-react)
- 🧩 Skeleton loaders integrated into Builder, Formatter, and Summarizer result sections
- ✅ Title attributes on form inputs for accessibility
- 📖 Contact page (/contact) with working form and contact information
- 👤 Contact form API endpoint (/api/contact) with validation and submission handling
- 🎚️ **Document Styling System:**
  - `useDocumentStyling` hook for managing typography state
  - `DocumentStylingUI` component with responsive sidebar controls
  - Dynamic CSS injection system (`document-styling.ts`)
  - Font family selector (web-safe + Google Fonts with dynamic loading)
  - Font size controls in MS Word standard points (pt):
    - Heading 1 (H1): 18-36pt
    - Subheading (H2/H3): 14-18pt
    - Body Text: 10-14pt
  - Line spacing dropdown (1.0, 1.15, 1.5, 2.0)
  - 7 custom bullet point styles (none, dot, circle, square, diamond, arrow, checkmark)
  - Live preview with CSS variables applied to markdown renderer
- 📊 Enhanced markdown renderer with styling prop and dynamic CSS injection
- 📤 Enhanced export system:
  - PDF export with inline font family, sizes (pt), and line spacing
  - DOCX export with proper font mapping and line spacing (in half-points per docx spec)
  - Both PDF and DOCX now capture and preserve user styling selections
- 🤖 AI system prompt enhancements:
  - Strict reference template cloning rules for exact layout mirroring
  - Mandatory typography and white-space enforcement
  - Markdown table reconstruction for tabular data
  - Proper spacing rules (double breaks between sections, single breaks in address blocks)
  - Signatory block formatting with 3-4 empty lines for signatures
  - Key term bolding for document scannability
- 🎯 Dynamic placeholder examples in Document Builder:
  - 24 document-type-specific placeholder examples
  - Context-aware suggestions showing realistic sample data for each document type
- ⏱️ Minimum skeleton loading duration (1.5 seconds) for better UX visibility
- 🔗 Gemini API attribution button in footer (link to ai.google.dev)
- 📄 Terms of Service page with Google Gemini AI disclosure
- 🔒 Privacy Policy page with Google Gemini AI processing information
- ⚠️ AI disclaimer under generate buttons stating "Gemini AI can make mistakes"
- 🧩 **Modal component** (`ui/modal.tsx`): Accessible dialog with backdrop, Escape key handling, scroll lock, header/body/footer slots
- 📋 **Copy to Clipboard**: One-click plain-text copy with "Copied!" feedback (2-second timeout), added as 3rd export button alongside PDF & DOCX
- 🏷️ **Dynamic export filenames**: Extracts H1 heading from generated markdown → sanitized filename; falls back to timestamped `{prefix}_YYYY-MM-DD_HHMM`
- 📝 **Plain text reference input**: Textarea in `DocumentFormFooter` for pasting reference template text as an alternative to file upload; merges with uploaded file text
- 🗃️ **Aggressive table recovery**: All 3 AI system prompts now include "CRITICAL DATA RECOVERY & TABLE RECONSTRUCTION" section instructing the AI to reconstruct markdown tables from comma-separated text patterns (common in PDF/DOCX extraction)
- 🗣️ **Human tone enforcement**: All 3 system prompts now include "HUMAN TONE AND AUTHENTICITY" section with expanded banned AI buzzword list (delve, furthermore, testament, tapestry, beacon, dynamic, multifaceted, nuanced, paradigm, synergy, leverage, robust, streamline, holistic, etc.), sentence rhythm variation rules, and "BE DIRECT" instructions

### Changed

- 🔄 Service Worker cache name: v1 → v2 (favicon bust)
- 📝 Footer structure: now responsive with different layouts for mobile vs desktop
- 🎛️ Mobile header styling with improved theme toggle positioning
- 📝 API chat route: reference templates now injected into system prompt
- 🎨 Export buttons now styled as responsive grid (side-by-side on mobile)
- 🔵 Footer now displays "Powered by Google Gemini" attribution with clickable link
- 🗑️ Removed nested PureDraftHR directory and git submodule reference
- 🪟 **Document Styling moved from sidebar to Modal**: Submit/Generate buttons now open a styling modal popup with "Cancel" and "Confirm & Generate" actions — replaces the old `grid lg:grid-cols-[1fr_280px]` sidebar layout on all 3 pages (Builder, Formatter, Summarizer)
- 🔢 **Font size controls changed from number inputs to dropdown selectors**: H1 (18-36pt), H2/H3 (14-24pt, expanded range), Body (10-14pt) — consistent with MS Word standard sizes
- 📊 **Export buttons layout**: Changed from 2-column to 3-column grid (PDF / Word / Copy) with shorter labels
- 🏗️ **H2/H3 default size**: Changed from 14pt to 18pt; max range expanded from 18pt to 24pt
- 📐 **Document Styling UI**: Removed Card wrapper (now renders as plain div for modal embedding)

## [1.0.0] - 2026-02-23

### Features

- ✨ Initial release of PureDraft HR
- 📋 Document Formatter tool with 5+ templates
- 📝 AI-powered Document Summarizer with human-sounding output
- 🏗️ Document Builder wizard for creating documents from scratch
- 📱 Progressive Web App (PWA) support for iOS & Android
- 🎨 Fully responsive mobile-first UI with Tailwind CSS
- 📥 Client-side PDF & DOCX export functionality
- 📤 File extraction for PDF, DOCX, and TXT uploads
- 🔒 100% stateless architecture with no database
- 🌙 Light & dark theme support
- ♿ Accessible UI components built with shadcn/ui
- 📧 Vercel AI SDK integration with streaming responses
- 🚀 Edge Runtime support for optimal performance

### Architecture

- Built with Next.js 15 (App Router)
- Server-side AI processing with dynamic system prompts
- Client-side export implementation
- Service Worker for offline PWA functionality
- TypeScript strict mode for type safety

### Security & Privacy

- No data storage or persistence
- Real-time processing with immediate cleanup
- HTTPS recommended for production
- API key management best practices

## [Future]

### Planned Features

- [ ] Document history (optional client-side storage)
- [ ] Collab edit links with temporary storage
- [ ] AI-powered grammar and tone adjustment
- [ ] Integration with HR systems (ATS, HRIS)
- [ ] Advanced analytics and usage metrics
- [ ] Mobile app versions (React Native)
