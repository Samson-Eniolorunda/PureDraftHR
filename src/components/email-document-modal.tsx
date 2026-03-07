"use client";

import { useState, useCallback, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Mail, ExternalLink } from "lucide-react";

interface EmailDocumentModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  defaultSubject?: string;
}

interface EmailProvider {
  name: string;
  icon: string;
  color: string;
  buildUrl: (to: string, subject: string, body: string) => string;
}

const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    name: "Default Email App",
    icon: "💻",
    color:
      "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 dark:border-gray-700",
    buildUrl: (to, subject, body) =>
      `mailto:${to}?subject=${e(subject)}&body=${e(body)}`,
  },
  {
    name: "Gmail",
    icon: "📧",
    color:
      "bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:border-red-800",
    buildUrl: (to, subject, body) =>
      `https://mail.google.com/mail/?view=cm&to=${e(to)}&su=${e(subject)}&body=${e(body)}`,
  },
  {
    name: "Outlook",
    icon: "📬",
    color:
      "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:border-blue-800",
    buildUrl: (to, subject, body) =>
      `https://outlook.live.com/mail/0/deeplink/compose?to=${e(to)}&subject=${e(subject)}&body=${e(body)}`,
  },
  {
    name: "Yahoo Mail",
    icon: "📨",
    color:
      "bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 dark:border-purple-800",
    buildUrl: (to, subject, body) =>
      `https://compose.mail.yahoo.com/?to=${e(to)}&subject=${e(subject)}&body=${e(body)}`,
  },
  {
    name: "Zoho Mail",
    icon: "✉️",
    color:
      "bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950/30 dark:hover:bg-green-950/50 dark:border-green-800",
    buildUrl: (to, subject, body) =>
      `https://mail.zoho.com/zm/#compose?to=${e(to)}&subject=${e(subject)}&body=${e(body)}`,
  },
  {
    name: "ProtonMail",
    icon: "🔒",
    color:
      "bg-violet-50 hover:bg-violet-100 border-violet-200 dark:bg-violet-950/30 dark:hover:bg-violet-950/50 dark:border-violet-800",
    buildUrl: (to, subject, body) =>
      `https://mail.proton.me/u/0/compose?to=${e(to)}&subject=${e(subject)}&body=${e(body)}`,
  },
];

/** URL-encode helper */
function e(str: string) {
  return encodeURIComponent(str);
}

/** Strip markdown formatting for plain-text email body */
function markdownToPlainText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, (m) => m)
    .replace(/^>\s?/gm, "")
    .replace(/---+/g, "────────────────")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function EmailDocumentModal({
  open,
  onClose,
  content,
  defaultSubject = "HR Document from PureDraftHR",
}: EmailDocumentModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [selectedProvider, setSelectedProvider] = useState(
    EMAIL_PROVIDERS[0].name,
  );

  const plainBody = useMemo(() => markdownToPlainText(content), [content]);

  const handleSendEmail = useCallback(() => {
    const provider =
      EMAIL_PROVIDERS.find((p) => p.name === selectedProvider) ??
      EMAIL_PROVIDERS[0];
    const url = provider.buildUrl(
      recipientEmail.trim(),
      subject.trim() || defaultSubject,
      plainBody,
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }, [recipientEmail, subject, defaultSubject, plainBody, selectedProvider]);

  return (
    <Modal open={open} onClose={onClose} title="Send via Email">
      <div className="space-y-5">
        {/* Recipient & Subject */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email-recipient" className="text-sm">
              Recipient Email (optional)
            </Label>
            <Input
              id="email-recipient"
              type="email"
              placeholder="colleague@company.com"
              value={recipientEmail}
              onChange={(ev) => setRecipientEmail(ev.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email-subject" className="text-sm">
              Subject
            </Label>
            <Input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(ev) => setSubject(ev.target.value)}
            />
          </div>
        </div>

        {/* Provider dropdown + Send button */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="email-provider"
              className="text-sm flex items-center gap-1.5"
            >
              <Mail className="h-4 w-4" />
              Email Provider
            </Label>
            <Select
              id="email-provider"
              value={selectedProvider}
              onChange={(ev) => setSelectedProvider(ev.target.value)}
            >
              {EMAIL_PROVIDERS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.icon} {p.name}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={handleSendEmail} className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            Open in {selectedProvider}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            This will open your email provider with the document pre-filled.
          </p>
        </div>
      </div>
    </Modal>
  );
}
