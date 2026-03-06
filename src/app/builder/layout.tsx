import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Builder",
  description:
    "Build complete HR documents from scratch. Offer letters, policies, performance reviews, and more — with AI-powered drafting and bulk CSV generation.",
  alternates: { canonical: "/builder" },
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
