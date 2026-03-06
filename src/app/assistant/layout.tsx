import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR Assistant",
  description:
    "Chat with an AI HR assistant. Upload documents, ask policy questions, draft emails, and schedule meetings — powered by Google Gemini.",
  alternates: { canonical: "/assistant" },
};

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
