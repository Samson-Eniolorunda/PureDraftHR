import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { AppNav } from "@/components/app-nav";
import { MobileHeader } from "@/components/mobile-header";
import { PwaRegister } from "@/components/pwa-register";
import { ThemeProvider } from "@/components/theme-provider";
import { SonnerToaster } from "@/components/sonner-toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Cache bust version - increment this when favicon changes
const FAVICON_VERSION = "v2";

// FIXED: Now defaults to your actual staging domain
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://puredrafthr.btbcoder.site";

/* ------------------------------------------------------------------ */
/* Metadata — SEO + PWA meta tags for iOS & Android                  */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: {
    default: "PureDraft HR — AI-Powered HR Document Generator",
    template: "%s | PureDraft HR",
  },
  description:
    "Generate, format, and summarize professional HR documents in seconds with AI. Offer letters, policies, performance reviews, bulk CSV generation, and more — powered by Google Gemini.",
  // Removed the old google meta verification tag here since you used the HTML file
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
  viewportFit: "cover",
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
              url: SITE_URL, // FIXED: Now uses the dynamic SITE_URL
              logo: `${SITE_URL}/favicon.svg`, // FIXED: Now uses the dynamic SITE_URL
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
        <ClerkProvider>
          <ThemeProvider>
            {/* Skip to main content — accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium"
            >
              Skip to main content
            </a>
            <MobileHeader />
            <AppNav />

            {/* Main content area — offset for sidebar on desktop, header+bottom-bar on mobile */}
            <main
              id="main-content"
              className="md:ml-64 pt-14 md:pt-0 pb-16 md:pb-0 overflow-x-hidden"
            >
              <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 min-h-screen">
                {children}
              </div>
            </main>

            <PwaRegister />
            <SonnerToaster />
          </ThemeProvider>
        </ClerkProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
