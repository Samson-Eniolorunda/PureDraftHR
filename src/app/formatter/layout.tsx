import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Formatter",
  description:
    "Turn messy notes into perfectly structured HR documents. Pick a template, provide your text, and let AI do the formatting.",
  alternates: { canonical: "/formatter" },
};

export default function FormatterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
