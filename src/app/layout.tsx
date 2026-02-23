import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppNav } from "@/components/app-nav";
import { PwaRegister } from "@/components/pwa-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

/* ------------------------------------------------------------------ */
/*  Metadata — includes PWA meta tags for iOS & Android                */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: "HR Document Utility",
  description:
    "3-in-1 HR Document Processing Utility — Format, Summarize, and Build HR documents with AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HR Docs",
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
    <html lang="en" className="dark">
      <head>
        {/* PWA iOS splash */}
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppNav />

        {/* Main content area — offset for sidebar on desktop, bottom-bar on mobile */}
        <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <PwaRegister />
      </body>
    </html>
  );
}
