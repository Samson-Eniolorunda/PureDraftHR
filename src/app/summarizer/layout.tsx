import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Summarizer",
  description:
    "Paste or upload a lengthy HR document and get a clear, human-sounding summary in seconds — powered by Google Gemini AI.",
  alternates: { canonical: "/summarizer" },
};

export default function SummarizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
