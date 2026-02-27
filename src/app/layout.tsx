import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { AppNav } from "@/components/app-nav";
import { MobileHeader } from "@/components/mobile-header";
import { PwaRegister } from "@/components/pwa-register";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Cache bust version - increment this when favicon changes
const FAVICON_VERSION = "v2";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://puredrafthr.com";

/* ------------------------------------------------------------------ */
/*  Metadata — SEO + PWA meta tags for iOS & Android                   */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: {
    default: "PureDraft HR — AI-Powered HR Document Generator",
    template: "%s | PureDraft HR",
  },
  description:
    "Generate, format, and summarize professional HR documents in seconds with AI. Offer letters, policies, performance reviews, bulk CSV generation, and more — powered by Google Gemini.",
  keywords: [
    "HR software",
    "AI document generator",
    "HR document formatting",
    "AI offer letters",
    "bulk CSV document generation",
    "human resources tools",
    "policy generator",
    "performance review template",
    "HR assistant",
    "document summarizer",
    "onboarding documents",
    "termination letter generator",
    "PureDraft HR",
    "Google Gemini HR",
  ],
  manifest: "/manifest.json",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  icons: {
    icon: `/favicon.svg?v=${FAVICON_VERSION}`,
    shortcut: `/favicon.svg?v=${FAVICON_VERSION}`,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "PureDraft HR — AI-Powered HR Document Generator",
    description:
      "Generate, format, and summarize professional HR documents in seconds with AI. Offer letters, policies, bulk CSV generation, and more.",
    siteName: "PureDraft HR",
  },
  twitter: {
    card: "summary_large_image",
    title: "PureDraft HR — AI-Powered HR Document Generator",
    description:
      "Generate, format, and summarize professional HR documents in seconds with AI. Powered by Google Gemini.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PureDraft HR",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon cache buster for all browsers */}
        <link
          rel="icon"
          href={`/favicon.svg?v=${FAVICON_VERSION}`}
          type="image/svg+xml"
        />
        {/* PWA iOS splash - with cache bust */}
        <link
          rel="apple-touch-icon"
          href={`/icons/icon-192.svg?v=${FAVICON_VERSION}`}
          type="image/svg+xml"
        />
        {/* Preconnect to Google API for faster AI requests */}
        <link
          rel="preconnect"
          href="https://generativelanguage.googleapis.com"
        />
        {/* Structured Data - JSON-LD for Google Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PureDraft HR",
              url: "https://puredrafthr.com",
              logo: "https://puredrafthr.com/favicon.svg",
              description:
                "Generate, format, and summarize professional HR documents in seconds with AI. Offer letters, policies, bulk CSV generation, and more — powered by Google Gemini.",
              sameAs: ["https://github.com/Samson-Eniolorunda"],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Service",
                email: "eniolorundasamson@gmail.com",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <MobileHeader />
          <AppNav />

          {/* Main content area — offset for sidebar on desktop, header+bottom-bar on mobile */}
          <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-20">
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 min-h-screen">
              {children}
            </div>
          </main>

          <Footer />
          <PwaRegister />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('[Layout] App initialized at:', new Date().toISOString());
              console.log('[Layout] Favicon version:', '${FAVICON_VERSION}');
              if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(() => {
                  console.log('[Layout] Service Worker is ready');
                });
              }
            `,
          }}
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
          />
        )}
      </body>
    </html>
  );
}
