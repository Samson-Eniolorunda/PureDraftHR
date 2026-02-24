# Changelog

All notable changes to PureDraft HR will be documented in this file.

## [Unreleased]

### Fixed

- 🔧 Service Worker message listener to prevent "message channel closed" errors
- 📱 Mobile textarea keyboard coverage by adding focus-scroll with delay
- 🎨 Select dropdown arrow behavior (up when closed, down when open)
- 🔗 Footer layout on mobile: prevent bottom nav bar overlap (pb-24), center links/social, copyright last
- ♿ ARIA accessibility violations: convert boolean attributes to strings ("true"/"false")
- 🔍 Favicon caching on Vercel by adding cache-bust query params (?v=v2)
- 📝 Escaped apostrophes in contact/page.tsx for ESLint compliance (Lines 78, 137, 250)
- 🔤 UTF-8 encoding issues in API routes by removing special Unicode characters

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

### Changed

- 🔄 Service Worker cache name: v1 → v2 (favicon bust)
- 📝 Footer structure: now responsive with different layouts for mobile vs desktop
- 🎛️ Mobile header styling with improved theme toggle positioning
- 🏗️ Builder, Formatter, and Summarizer pages now use responsive grid layout:
  - Main content on left (1fr)
  - Sticky styling sidebar on right (280px) on lg screens
  - Sidebar stacks below on mobile screens
- 📝 API chat route: reference templates now injected into system prompt
- 🎨 Export buttons now styled as responsive grid (side-by-side on mobile)
- 🔵 Footer now displays "Powered by Google Gemini" attribution with clickable link
- 🗑️ Removed nested PureDraftHR directory and git submodule reference

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

- [ ] Multi-language support
- [ ] Template customization UI
- [ ] Document history (optional client-side storage)
- [ ] Collab edit links with temporary storage
- [ ] AI-powered grammar and tone adjustment
- [ ] Integration with HR systems (ATS, HRIS)
- [ ] Advanced analytics and usage metrics
- [ ] Mobile app versions (React Native)
