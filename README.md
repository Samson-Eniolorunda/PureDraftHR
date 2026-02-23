# PureDraft HR

**Enterprise-grade Next.js 15 PWA for Human Resources**

An innovative, **100% stateless** web application that empowers HR teams to format, summarize, and generate professional HR documents with AI. Built with Next.js 15, Tailwind CSS, Vercel AI SDK, and shadcn/ui.

---

## 🚀 Features

### 1. **3-in-1 Document Tools**

#### 📋 **Formatter**
- Convert messy, unstructured HR text into perfectly formatted markdown documents
- Choose from 5 professional templates:
  - Incident Report
  - Interview Notes
  - Meeting Minutes
  - Performance Review
  - Policy Draft
- AI-powered restructuring with semantic understanding

#### 📝 **Summarizer**
- Distill lengthy HR documents into concise, human-sounding summaries
- **Plagiarism-free intelligence**: AI explicitly avoids common AI-detector buzzwords
- Varied sentence lengths and conversational professional tone
- Outputs TL;DR + summary + key takeaways

#### 🏗️ **Builder**
- Create professional HR documents from scratch using a 3-step wizard
- Select document type, add key details, choose tone
- 10+ document types supported (Offer Letters, Job Descriptions, Policies, etc)
- Streaming generation with real-time preview

### 2. **100% Stateless Architecture**
- ✅ No database, no server-side storage
- ✅ All file parsing & AI generation happens in-memory
- ✅ Streamed directly to client (Vercel AI SDK `streamText`)
- ✅ Perfect for compliance and privacy requirements

### 3. **Progressive Web App (PWA)**
- 📱 Mobile-first responsive design
- 🏠 "Add to Home Screen" on iOS & Android
- 📴 Offline support with service worker
- ⚡ Desktop sidebar + mobile bottom-tab navigation
- 🎨 Beautiful light/dark theme with Tailwind CSS

### 4. **Client-Side Export**
- 📥 **Download as PDF** — Uses html2pdf.js for instant PDF generation
- 📥 **Download as DOCX** — Uses docx library for Word export
- ✅ All export happens in the browser (no server processing)

### 5. **File Import Support**
- 📤 Drag-and-drop upload interface
- 📄 Supported formats: `.txt`, `.pdf`, `.docx`
- 🔍 Automatic text extraction via a lightweight extraction API

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **AI/LLM** | Vercel AI SDK + OpenAI (gpt-4o-mini) |
| **Runtime** | Edge Runtime (API route) |
| **Export** | html2pdf.js, docx |
| **File Parsing** | mammoth (DOCX), pdf-parse (PDF) |
| **Package Manager** | npm |
| **Language** | TypeScript |
| **Deployment** | Vercel (recommended) |

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ & npm
- OpenAI API key (set as `OPENAI_API_KEY` environment variable)

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
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
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
│   │   ├── layout.tsx         # Root layout with PWA registration
│   │   ├── page.tsx           # Redirect to /formatter
│   │   ├── api/
│   │   │   ├── chat/route.ts  # AI streaming (dynamic system prompts)
│   │   │   └── extract/route.ts  # File text extraction
│   │   ├── formatter/page.tsx # Document formatter tool
│   │   ├── summarizer/page.tsx# Document summarizer tool
│   │   └── builder/page.tsx   # Document builder wizard
│   │
│   ├── components/
│   │   ├── app-nav.tsx        # Sidebar + mobile bottom tabs
│   │   ├── dual-input.tsx     # Upload/Paste tabs
│   │   ├── drop-zone.tsx      # Drag-and-drop upload
│   │   ├── export-buttons.tsx # PDF & DOCX download
│   │   ├── markdown-renderer.tsx # Renders AI output
│   │   ├── pwa-register.tsx   # Service worker registration
│   │   └── ui/                # shadcn-style components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   │
│   ├── lib/
│   │   └── utils.ts           # cn() utility for class merging
│   │
│   └── types/
│       └── modules.d.ts       # Type declarations for pdf-parse, html2pdf
│
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── next.config.js
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
  "tool": "formatter|summarizer|builder",
  "template": "incident-report" // optional, for formatter
}
```

**Response:** Server-sent events with streamed markdown.

**System Prompts:**
- **Formatter**: Restructures text into professional document templates
- **Summarizer**: Creates human-sounding summaries (avoids AI buzzwords)
- **Builder**: Generates complete documents from scratch

### `POST /api/extract`
Extracts plain text from uploaded files (PDF, DOCX, TXT).

**Request:** FormData with `file` field  
**Response:** `{ "text": "..." }`

---

## 🎨 UI Architecture

### Desktop (≥768px)
- **Left Sidebar** (fixed, 256px): Navigation + logo
- **Main Content**: Full width with max-width container
- **Routes**: /formatter, /summarizer, /builder

### Mobile (<768px)
- **Bottom Tab Bar** (fixed, 64px): Icon + label navigation
- **Main Content**: Full width with safe-area padding
- **Routes**: Same as desktop, responsive layout

---

## 💡 Usage Examples

### Format a Messy Interview
1. Go to `/formatter`
2. Select "Interview Notes" template
3. Paste or upload your notes
4. Click "Format Document"
5. Export as PDF or Word

### Summarize a Long Policy
1. Go to `/summarizer`
2. Upload a policy document (.pdf, .docx, .txt)
3. Click "Summarize"
4. Get a concise, human-sounding summary in 10-15 seconds

### Build a New Offer Letter
1. Go to `/builder`
2. Select "Offer Letter", add employee details
3. Choose "Friendly" tone
4. Click "Generate Document"
5. Download as Word (.docx) for final editing

---

## 🔐 Privacy & Security

- ✅ **No data persistence**: All processing happens in real-time, nothing is stored
- ✅ **No tracking**: Fully private by default
- ✅ **HTTPS recommended**: Use on secure connections
- ✅ **API key management**: Keep `OPENAI_API_KEY` secure in `.env.local`
- ✅ **Client-side exports**: PDF/Word generation happens locally

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
vercel
```

### Deploy to Other Platforms
Ensure these environment variables are set:
- `OPENAI_API_KEY`: Your OpenAI API key

The app is optimized for serverless (Vercel, AWS Lambda, etc) thanks to the Edge Runtime on the chat API route.

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
- ✅ ESLint Next.js config
- ✅ Tailwind CSS classes with `cn()` utility
- ✅ Server & client components properly separated

### Adding New Tools
1. Create a new page in `src/app/[toolname]/page.tsx`
2. Add system prompt to `src/app/api/chat/route.ts`
3. Use the `DualInput`, `MarkdownRenderer`, `ExportButtons` components
4. Add navigation item in `src/components/app-nav.tsx`

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
A: No — all processing is stateless. Documents are processed in real-time and never stored.

**Q: Can I use this offline?**  
A: The UI will work offline, but AI generation requires an internet connection and OpenAI API access.

**Q: What happens if I close the browser?**  
A: All in-progress work is lost (by design, for privacy). This is intentional to maintain stateless architecture.

**Q: Can I use Anthropic Claude instead of OpenAI?**  
A: Yes! Modify `/api/chat/route.ts` to use `@ai-sdk/anthropic` instead of `@ai-sdk/openai`.

**Q: Is there a cost per request?**  
A: Yes, you're billed by OpenAI based on tokens used. Typical formatting costs <$0.01 per request.

---

## 📞 Support

For issues, bugs, or feature requests, please open a GitHub Issue.

---

**Built with ❤️ by Samson Eniolorunda**
