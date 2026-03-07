# PureDraft HR

**Enterprise-grade Next.js 15 PWA for Human Resources**

A full-stack web application that empowers HR teams to format, summarize, and generate professional HR documents with AI. Built with Next.js 15, Tailwind CSS, Vercel AI SDK, Google Gemini AI, shadcn/ui, Clerk authentication, Prisma ORM + Supabase PostgreSQL, and Upstash Redis rate limiting.

---

## 🚀 Features

### 1. **4-in-1 Document Tools**

#### 📋 **Formatter**

- Convert messy, unstructured HR text into perfectly formatted markdown documents
- Choose from 5 professional templates + **"Other (Custom)"** option for freeform template names
- AI-powered restructuring with semantic understanding
- Reference template cloning for exact layout mirroring

#### 📝 **Summarizer**

- Distill lengthy HR documents into concise, human-sounding summaries
- **Plagiarism-free intelligence**: AI explicitly avoids common AI-detector buzzwords
- Varied sentence lengths and conversational professional tone
- Outputs TL;DR + summary + key takeaways

#### 🏗️ **Builder**

- Create professional HR documents from scratch using a 3-step wizard
- Select document type, add key details, choose tone
- **25 document types** supported (Offer Letters, Job Descriptions, Policies, Contracts, and more) + **"Other (Custom)"** option
- **Dynamic placeholder examples** — context-aware suggestions for each document type
- **Bulk CSV Generation** — upload a CSV file to batch-generate multiple documents at once with progress tracking
- Streaming generation with real-time preview
- Minimum skeleton loading duration (1.5s) for smooth UX

#### 💬 **Assistant** _(NEW)_

- Freeform **HR Copilot** — ask HR questions, draft workplace emails, get policy advice
- **Chat with a Document** — upload a PDF, DOCX, or TXT file and ask questions about its contents
- Styled output with full document styling modal support
- Quick-send (Enter) or styled-send (Wand icon) modes
- **Smart Meeting Scheduler** — ask the AI to schedule a meeting and get a beautiful Meeting Card with "Add to Google Calendar" and "Download Outlook Invite (.ics)" buttons
- Full export support (PDF, DOCX, Copy)

### 2. **Document Styling System (Modal)**

- 🎨 **Font Family Selector** — 7 web-safe fonts + 7 Google Fonts with dynamic loading
- 📏 **Font Size Dropdowns** in MS Word standard points (pt):
  - Heading 1 (H1): 18–36pt (dropdown selector)
  - Subheading (H2/H3): 14–24pt (dropdown selector)
  - Body Text: 10–14pt (dropdown selector)
- 📐 **Line Spacing** — 1.0, 1.15, 1.5, 2.0
- 🔘 **Bullet Styles** — None, Dot, Circle, Square, Diamond, Arrow, Checkmark
- 🪟 **Styling Modal Flow** — Submit → choose styling in a modal popup → "Confirm & Generate"
- 👁️ **Live Preview** — CSS variables injected in real-time into the markdown renderer
- 📤 **Style-aware Export** — PDF, DOCX, and clipboard exports preserve all user styling selections
- 🔄 **Reset to Defaults** — One-click reset button

### 3. **Authentication & User Accounts**

- 🔐 Clerk authentication (email/password + Google OAuth)
- 👤 User profile management with `<UserButton />`
- 🛡️ Protected routes via Next.js middleware
- 📝 Sign-in / Sign-up pages with Clerk components

### 4. **My Documents Dashboard**

- 📂 Save generated documents to your account (Supabase PostgreSQL via Prisma)
- 🗂️ View, search, and manage saved documents
- 🗑️ Delete documents with confirmation
- 📄 Re-open saved documents for viewing and export
- 🔒 User-scoped — each user sees only their own documents

### 5. **Rate Limiting & Security**

- ⏱️ Upstash Redis-powered rate limiting on AI endpoints
- 🔒 CSRF-safe API routes with proper validation
- 🛡️ Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

### 6. **Progressive Web App (PWA)**

- 📱 Mobile-first responsive design
- 🏠 "Add to Home Screen" on iOS & Android
- 📴 Offline support with service worker
- ⚡ Desktop sidebar + mobile bottom-tab navigation
- 🎨 Beautiful light/dark theme with system/manual toggle

### 7. **Client-Side Export**

- 📥 **Download as PDF** — Uses html2pdf.js with inline font, size, and spacing styles
- 📥 **Download as DOCX** — Uses docx library with proper font mapping and half-point line spacing
- 📋 **Copy to Clipboard** — One-click plain-text copy with 2-second "Copied!" confirmation
- 🏷️ **Dynamic Filenames** — Exports auto-named from the document's H1 heading (fallback: timestamped)
- ✅ All export happens in the browser (no server processing)
- ✅ Exports preserve document styling selections (font, sizes, spacing, bullets)
- ✅ Bullet symbols rendered inline in both PDF and DOCX (not CSS pseudo-elements)

### 8. **Multi-Language Translation**

- 🌍 Output language selector on all 4 tools (Formatter, Summarizer, Builder, Assistant)
- 8 supported languages: English, Spanish, French, German, Mandarin Chinese, Portuguese, Arabic, Hindi
- Language instruction injected into AI system prompt for accurate translation
- Default: English (no extra instruction overhead)

### 9. **My Templates Library**

- 📂 Save reference text snippets as reusable templates
- Templates stored in `localStorage` (persistent across sessions, no server needed)
- One-click load from saved templates dropdown
- Delete unwanted templates with confirmation
- Integrated into the `DocumentFormFooter` component (available on Formatter, Builder, Summarizer)

### 10. **File Import Support**

- 📤 Drag-and-drop upload interface with success state (green checkmark + filename)
- 📄 Supported formats: `.txt`, `.pdf`, `.docx`
- 🔍 Automatic text extraction via a lightweight extraction API
- 📝 **Plain text reference input** — Textarea alternative to file upload for pasting reference templates
- ❌ One-click file removal button to clear uploaded files

### 11. **AI Transparency & Disclaimers**

- ⚠️ AI disclaimer under generate buttons: "PureDraft AI can make mistakes"
- 📄 Dedicated Terms of Service page with AI accuracy disclosure (Section 5)
- 🔒 Privacy Policy page with AI processing information
- 🤖 AI assistant branded as "PureDraft" throughout the app

### 12. **Smart Meeting Scheduler**

- 📅 Ask the Assistant to schedule a meeting, interview, or appointment
- AI outputs structured JSON that is automatically intercepted and parsed
- Beautiful **Meeting Card** UI rendered in place of raw JSON — shows title, date, time, and description
- **"Add to Google Calendar"** — generates a Google Calendar template URL and opens it in a new tab
- **"Download Outlook Invite (.ics)"** — generates a standards-compliant `.ics` file and downloads it to the browser
- No OAuth or backend calendar integration required — works entirely client-side

---

## 🏗️ Tech Stack

| Layer               | Technology                                          |
| ------------------- | --------------------------------------------------- |
| **Framework**       | Next.js 15 (App Router)                             |
| **Styling**         | Tailwind CSS + shadcn/ui                            |
| **Theming**         | next-themes (light/dark/system toggle)              |
| **AI/LLM**          | Vercel AI SDK + Google Gemini 2.5 Flash (100% Free) |
| **Auth**            | Clerk (email/password + Google OAuth)               |
| **Database**        | Supabase PostgreSQL + Prisma 7 ORM                  |
| **Rate Limiting**   | Upstash Redis                                       |
| **Email**           | Resend (document sharing + contact form)            |
| **Runtime**         | Node.js Runtime (API routes)                        |
| **Export**          | html2pdf.js, docx, file-saver                       |
| **File Parsing**    | mammoth (DOCX), pdf-parse (PDF), xlsx               |
| **Icons**           | lucide-react                                        |
| **Markdown**        | react-markdown                                      |
| **Package Manager** | npm                                                 |
| **Language**        | TypeScript (strict mode)                            |
| **Deployment**      | Vercel (recommended)                                |

---

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ & npm
- Google Gemini API key (free)
- Clerk account (free)
- Supabase project (free)
- Upstash Redis database (free)
- Resend account (free)

See [SETUP.md](SETUP.md) for detailed setup instructions for each service.

### 1. Clone the Repository

```bash
git clone https://github.com/Samson-Eniolorunda/PureDraftHR.git
cd PureDraftHR
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key

# Resend Email
RESEND_API_KEY=your-resend-key
CONTACT_EMAIL=your-email@example.com

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-pk
CLERK_SECRET_KEY=your-clerk-sk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase PostgreSQL (Prisma)
DATABASE_URL=your-supabase-pooler-url
DIRECT_URL=your-supabase-direct-url
```

### 4. Push Database Schema

```bash
npx prisma db push
```

### 5. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
PureDraftHR/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/
│       ├── icon-192.svg       # PWA icon
│       └── icon-512.svg       # PWA splash
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with Clerk, PWA, theme
│   │   ├── page.tsx           # Redirect to /formatter
│   │   ├── globals.css        # Global styles
│   │   ├── api/
│   │   │   ├── chat/route.ts  # AI streaming (dynamic system prompts)
│   │   │   ├── contact/route.ts # Contact form API
│   │   │   ├── documents/route.ts # Save/list documents API
│   │   │   ├── documents/[id]/route.ts # Get/delete document API
│   │   │   ├── extract/route.ts # File text extraction
│   │   │   └── send-document/route.ts # Email document API
│   │   ├── builder/page.tsx   # Document builder wizard (25 types + custom)
│   │   ├── formatter/page.tsx # Document formatter tool
│   │   ├── summarizer/page.tsx# Document summarizer tool
│   │   ├── assistant/page.tsx # HR Assistant copilot + chat with document
│   │   ├── dashboard/page.tsx # My Documents dashboard (auth required)
│   │   ├── sign-in/           # Clerk sign-in page
│   │   ├── sign-up/           # Clerk sign-up page
│   │   ├── contact/page.tsx   # Contact page with form
│   │   ├── faq/page.tsx       # FAQ page
│   │   ├── terms/page.tsx     # Terms of Service (Gemini AI disclosure)
│   │   └── privacy/page.tsx   # Privacy Policy (Gemini AI processing)
│   │
│   ├── components/
│   │   ├── app-nav.tsx        # Sidebar + mobile bottom tabs
│   │   ├── document-form-footer.tsx # Consent text + AI disclaimer
│   │   ├── document-styling-ui.tsx  # Styling modal controls
│   │   ├── drop-zone.tsx      # Drag-and-drop upload
│   │   ├── dual-input.tsx     # Upload/Paste tabs
│   │   ├── email-document-modal.tsx # Email document modal (Resend)
│   │   ├── export-buttons.tsx # Style-aware PDF & DOCX download
│   │   ├── footer.tsx         # App footer with Gemini attribution
│   │   ├── language-selector.tsx # Multi-language output selector
│   │   ├── markdown-renderer.tsx # Renders AI output with styling
│   │   ├── meeting-card.tsx   # Smart Meeting Scheduler card + .ics generation
│   │   ├── multi-file-drop-zone.tsx # Multi-file upload for batch mode
│   │   ├── template-library.tsx  # Saved templates library (localStorage)
│   │   ├── mobile-header.tsx  # Mobile header with theme toggle
│   │   ├── sonner-toaster.tsx # Toast notifications
│   │   ├── pwa-register.tsx   # Service worker registration
│   │   ├── theme-provider.tsx # Light/dark/system theme provider
│   │   ├── theme-toggle-button.tsx # Theme toggle button
│   │   └── ui/                # shadcn-style components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── modal.tsx
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       ├── skeleton-loaders.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   │
│   ├── hooks/
│   │   ├── useDevSkeletonPreview.ts  # Dev-mode skeleton testing
│   │   ├── useDocumentStyling.ts     # Document styling state management
│   │   └── useTemplateLibrary.ts     # Saved templates hook (localStorage)
│   │
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton (Supabase adapter)
│   │   ├── document-styling.ts # CSS generation & injection utilities
│   │   ├── markdown-to-html.ts # Markdown to HTML conversion
│   │   ├── rate-limit.ts     # Upstash Redis rate limiter
│   │   └── utils.ts           # cn() utility for class merging
│   │
│   └── types/
│       └── modules.d.ts       # Type declarations for pdf-parse, html2pdf
│
├── prisma/
│   └── schema.prisma          # Database schema (Document model)
├── prisma.config.ts           # Prisma 7 config (datasource, dotenv)
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── next.config.js
├── SETUP.md                   # Service setup guide
├── CHANGELOG.md
└── .gitignore
```

---

## 🔧 Key API Routes

### `POST /api/chat`

Streams AI-generated markdown based on the selected tool.

**Request:**

```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "tool": "formatter|summarizer|builder|assistant",
  "template": "incident-report", // optional, for formatter
  "language": "Spanish" // optional, default English
}
```

**Response:** Server-sent events with streamed markdown.

**System Prompts:**

- **Formatter**: Restructures text into professional document templates with reference template cloning
- **Summarizer**: Creates human-sounding summaries (avoids AI buzzwords)
- **Builder**: Generates complete documents from scratch with strict typography rules
- **Assistant**: Freeform HR Copilot for Q&A, personal drafting, and document chat
- **All prompts include**: Aggressive table recovery from destroyed PDF/DOCX data, human tone enforcement with banned AI buzzword list
- **Language injection**: When a non-English language is selected, a mandatory language instruction is appended to the system prompt

**AI Typography Rules (enforced in all prompts):**

- Double line breaks between sections
- Heading hierarchy enforcement
- Address block formatting
- Aggressive Markdown table reconstruction from comma-separated text
- Signatory blocks with 3–4 empty lines for signatures
- Key term bolding for document scannability
- Human tone: varied sentence lengths, no AI buzzwords (delve, furthermore, tapestry, etc.)

### `POST /api/extract`

Extracts plain text from uploaded files (PDF, DOCX, TXT).

**Request:** FormData with `file` field
**Response:** `{ "text": "..." }`

### `POST /api/contact`

Handles contact form submissions with validation.

**Request:**

```json
{
  "name": "...",
  "email": "...",
  "subject": "...",
  "message": "..."
}
```

**Response:** `{ "success": true }`

---

## 🎨 UI Architecture

### Desktop (≥1024px)

- **Left Sidebar** (fixed, 256px): Navigation + logo
- **Main Content**: Responsive grid layout with max-width container
- **Styling Modal**: Popup modal for document styling (replaces sidebar)
- **Routes**: /formatter, /summarizer, /builder, /assistant, /contact, /faq, /terms, /privacy

### Tablet (768px–1023px)

- **Left Sidebar**: Collapsed navigation
- **Main Content**: Full width, max-w-3xl
- **Styling Modal**: Same modal popup as desktop

### Mobile (<768px)

- **Mobile Header** (fixed, top): Logo + theme toggle
- **Bottom Tab Bar** (fixed, 64px): Icon + label navigation
- **Main Content**: Full width with safe-area padding (pb-24 to avoid bottom nav overlap)
- **Styling Modal**: Same modal popup as desktop

---

## 💡 Usage Examples

### Format a Messy Interview

1. Go to `/formatter`
2. Select "Interview Notes" template
3. Paste or upload your notes
4. Click "Format Document" → a **Styling Modal** opens
5. Adjust font family, sizes, spacing, and bullet style
6. Click **"Confirm & Generate"**
7. Export as PDF, Word, or copy to clipboard

### Summarize a Long Policy

1. Go to `/summarizer`
2. Upload a policy document (.pdf, .docx, .txt)
3. Click "Summarize" → choose styling in the modal
4. Click **"Confirm & Generate"**
5. Get a concise, human-sounding summary in 10–15 seconds
6. Export or copy to clipboard

### Build a New Offer Letter

1. Go to `/builder`
2. Select "Offer Letter" — see dynamic placeholder suggestions
3. Add employee details, choose "Friendly" tone
4. Click "Generate Document" → a **Styling Modal** opens
5. Customize font, sizes, and spacing, then click **"Confirm & Generate"**
6. Download as Word (.docx), PDF, or copy to clipboard — filename auto-set from H1

### Bulk Generate Documents from CSV

1. Go to `/builder`
2. Select a document type (e.g., "Offer Letter")
3. Toggle **"Enable Bulk CSV Mode"**
4. Upload a CSV where each row has employee-specific details (e.g., name, role, salary)
5. Click "Generate N Docs" → watch the progress bar as each document is generated
6. Export individual documents or download all as a combined file

### Chat with an HR Document

1. Go to `/assistant`
2. Upload a document (PDF, DOCX, TXT) — e.g., an employee handbook
3. Ask a question: "What is the bereavement leave policy?"
4. Get an instant, contextual answer from the AI
5. Export the response as PDF or DOCX if needed

### Ask an HR Question

1. Go to `/assistant`
2. Type: "Write a sick leave email to my manager for tomorrow"
3. Press Enter (quick send) or click Styled (for formatted output)
4. Export or copy the result

---

## 🔐 Privacy & Security

- ✅ **Authenticated access**: Clerk-managed user accounts with email verification
- ✅ **User-scoped data**: Documents are stored per-user in Supabase PostgreSQL
- ✅ **Rate limiting**: Upstash Redis protects AI endpoints from abuse
- ✅ **No tracking**: No analytics or third-party trackers
- ✅ **HTTPS enforced**: Secure connections in production
- ✅ **API key management**: All secrets in `.env.local` (never committed)
- ✅ **Client-side exports**: PDF/Word generation happens locally
- ✅ **AI transparency**: Clear disclaimers about Gemini AI usage and limitations
- ✅ **Security headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- ✅ **Legal pages**: Dedicated Terms of Service and Privacy Policy with Gemini AI disclosures

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
vercel
```

### Deploy to Other Platforms

Ensure all environment variables from `.env.local` are set. See [SETUP.md](SETUP.md) for details on each service.

---

## 📊 Performance

- ⚡ **First Load**: ~2-3s (with PWA, cached after first visit)
- ⚡ **Format/Summarize**: 5-15s (depending on document length)
- ⚡ **Export**: Instant (client-side)
- 📱 **Mobile**: Fully optimized, responsive design

### Core Web Vitals

- LCP: ~2.5s
- FID: <100ms
- CLS: <0.1

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

### Code Quality

- ✅ TypeScript strict mode
- ✅ ESLint Next.js config (strict — enforced on Vercel builds)
- ✅ Tailwind CSS classes with `cn()` utility
- ✅ Server & client components properly separated
- ✅ HTML entities for apostrophes (ESLint `react/no-unescaped-entities`)

### Adding New Tools

1. Create a new page in `src/app/[toolname]/page.tsx`
2. Add system prompt to `src/app/api/chat/route.ts`
3. Use the `DualInput`, `MarkdownRenderer`, `ExportButtons` components
4. Integrate `useDocumentStyling` hook and `DocumentStylingUI` in a `Modal`
5. Add `DocumentFormFooter` for consent text and AI disclaimer
6. Add navigation item in `src/components/app-nav.tsx`

---

## 📝 License

MIT License — feel free to use this project for personal or commercial purposes.

---

## 👤 Author

**Samson Eniolorunda**

- GitHub: [@Samson-Eniolorunda](https://github.com/Samson-Eniolorunda)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## ❓ FAQ

**Q: Does this app store my documents?**
A: Yes — if you're signed in, you can save generated documents to your account (stored in Supabase PostgreSQL). Documents are user-scoped and only visible to you. You can delete them at any time from the Dashboard.

**Q: What AI model does PureDraft HR use?**
A: Google Gemini 2.5 Flash via the Vercel AI SDK. Gemini AI can make mistakes — always review generated content before using.

**Q: Can I customize the document styling?**
A: Yes! When you click Generate/Format/Summarize, a Styling Modal opens where you can adjust font family, heading/body sizes, line spacing, and bullet styles. Click "Confirm & Generate" to proceed. All styling is preserved when exporting to PDF, DOCX, or copying to clipboard.

**Q: Can I use this offline?**
A: The UI will work offline, but AI generation requires an internet connection and a Google Generative AI API key.

**Q: What happens if I close the browser?**
A: Unsaved in-progress work is lost. Save documents to your account via the Dashboard to keep them.

**Q: Can I use a different AI model?**
A: Yes! Modify [src/app/api/chat/route.ts](src/app/api/chat/route.ts) to use any Vercel AI SDK provider (`@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, etc.).

**Q: Is there a cost per request?**
A: No! Google Gemini has a generous free tier. Clerk, Supabase, Upstash, and Resend also offer free tiers suitable for production use.

**Q: How many document types does the Builder support?**
A: 25 document types including Offer Letters, Job Descriptions, Company Policies, Employment Contracts, Termination Letters, Warning Letters, and more — plus an "Other (Custom)" option for any document type not listed. Each type has context-aware placeholder examples.

**Q: Can I generate documents in other languages?**
A: Yes! All 4 tools support multi-language output. Choose from English, Spanish, French, German, Mandarin Chinese, Portuguese, Arabic, and Hindi via the language selector.

**Q: What is the Assistant page?**
A: The Assistant is a freeform HR Copilot. You can ask HR questions, draft workplace emails, or upload a document and ask questions about its contents ("Chat with a Document").

**Q: Can I generate multiple documents at once?**
A: Yes! The Builder supports Bulk CSV Generation. Upload a CSV file where each row contains document-specific details, and the Builder will generate one document per row with progress tracking.

**Q: Does PureDraft HR save my templates?**
A: The "My Templates" Library stores reference text snippets in your browser's localStorage. Templates persist across sessions but are local to your browser — nothing is sent to a server.

---

## 📞 Support

For issues, bugs, or feature requests, please open a GitHub Issue.

---

**Built with ❤️ by Samson Eniolorunda**
