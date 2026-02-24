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

### Added

- 🎣 `useDevSkeletonPreview` hook for dev-mode skeleton UI testing via ?devSkeletons=true URL param
- 🪵 Comprehensive console logging with structured prefixes ([API/chat], [SW], [Layout])
- 📊 Service Worker logging at lifecycle events (install, activate, fetch, message)
- 🏷️ API request/response logging with validation error traces
- 🎨 Monitor icon for system theme toggle (lucide-react)
- 🧩 Skeleton loaders integrated into Builder, Formatter, and Summarizer result sections
- ✅ Title attributes on form inputs for accessibility

### Changed

- 🔄 Service Worker cache name: v1 → v2 (favicon bust)
- 📝 Footer structure: now responsive with different layouts for mobile vs desktop
- 🎛️ Mobile header styling with improved theme toggle positioning

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
