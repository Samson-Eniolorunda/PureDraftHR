"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, ChevronDown, ChevronUp, Mail } from "lucide-react";

/* ── Brand SVG Icons ── */

function GmailIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
        fill="#EA4335"
      />
      <path
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
        fill="url(#gmail_grad)"
      />
      <defs>
        <linearGradient id="gmail_grad" x1="0" y1="0" x2="24" y2="24">
          <stop stopColor="#EA4335" />
          <stop offset=".5" stopColor="#FBBC05" />
          <stop offset="1" stopColor="#34A853" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function OutlookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M24 7.387v10.478c0 .23-.08.424-.238.583a.793.793 0 0 1-.584.238h-8.322V6.567h8.322c.23 0 .425.08.584.238.159.159.238.352.238.582z"
        fill="#0364B8"
      />
      <path
        d="M16.58 6.567v12.119l-1.784.91L8.322 22.5V1.5l6.474 2.904 1.784.91v1.253z"
        fill="#0A2767"
      />
      <path d="M16.58 6.567H8.322v12.119l8.258-3.373V6.567z" fill="#28A8EA" />
      <path
        d="M10.903 9.322c-.314-.342-.728-.513-1.242-.513-.56 0-1.003.19-1.328.571-.326.38-.489.876-.489 1.487 0 .626.161 1.13.484 1.51.323.38.755.571 1.296.571.527 0 .95-.172 1.27-.516.32-.344.48-.823.48-1.437 0-.638-.157-1.14-.471-1.503v-.17zm.89-.667c.482.506.723 1.182.723 2.03 0 .838-.246 1.52-.738 2.047-.492.526-1.13.79-1.914.79-.77 0-1.39-.26-1.864-.78-.473-.521-.71-1.196-.71-2.027 0-.862.242-1.554.726-2.075.484-.521 1.113-.782 1.886-.782.786 0 1.409.266 1.891.797z"
        fill="white"
      />
    </svg>
  );
}

function YahooIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#6001D2" />
      <path
        d="M7.2 7l3.3 6.9h.1L13.8 7H16l-4.5 9.5V20h-2.1v-3.5L5 7h2.2z"
        fill="white"
      />
      <circle cx="17.5" cy="18.5" r="1.5" fill="white" />
    </svg>
  );
}

function ZohoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#E8382B" />
      <path
        d="M5 8h5.5l-5.5 8h5.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M13.5 8h5.5l-5.5 8h5.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ProtonIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#6D4AFF" />
      <path
        d="M6 10.5L12 7l6 3.5v4L12 18l-6-3.5v-4z"
        fill="white"
        fillOpacity=".2"
        stroke="white"
        strokeWidth="1.2"
      />
      <path d="M12 7v11M6 10.5l6 3.5 6-3.5" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}

function DefaultMailIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <div
      className={`${className} rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center`}
    >
      <Mail className="h-3 w-3 text-white" />
    </div>
  );
}

/* ── Types ── */

interface EmailDocumentModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  defaultSubject?: string;
}

interface EmailProvider {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  appSchemes: { android?: string; ios?: string };
  buildWebUrl: (
    to: string,
    subject: string,
    body: string,
    cc: string,
    bcc: string,
  ) => string;
  isDefault?: boolean;
}

/** URL-encode helper */
function enc(str: string) {
  return encodeURIComponent(str);
}

/** Build a mailto: link (triggers OS email app chooser on mobile) */
function buildMailto(
  to: string,
  subject: string,
  body: string,
  cc: string,
  bcc: string,
) {
  let url = `mailto:${enc(to)}?subject=${enc(subject)}&body=${enc(body)}`;
  if (cc) url += `&cc=${enc(cc)}`;
  if (bcc) url += `&bcc=${enc(bcc)}`;
  return url;
}

const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    id: "default",
    name: "Default Email App",
    icon: DefaultMailIcon,
    isDefault: true,
    appSchemes: {},
    buildWebUrl: buildMailto,
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: GmailIcon,
    appSchemes: {
      android:
        "intent://compose?#Intent;scheme=mailto;package=com.google.android.gm;end",
      ios: "googlegmail://co",
    },
    buildWebUrl: (to, subject, body, cc, bcc) => {
      let url = `https://mail.google.com/mail/?view=cm&to=${enc(to)}&su=${enc(subject)}&body=${enc(body)}`;
      if (cc) url += `&cc=${enc(cc)}`;
      if (bcc) url += `&bcc=${enc(bcc)}`;
      return url;
    },
  },
  {
    id: "outlook",
    name: "Outlook",
    icon: OutlookIcon,
    appSchemes: {
      android:
        "intent://compose?#Intent;scheme=mailto;package=com.microsoft.office.outlook;end",
      ios: "ms-outlook://compose",
    },
    buildWebUrl: (to, subject, body, cc, bcc) => {
      let url = `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(to)}&subject=${enc(subject)}&body=${enc(body)}`;
      if (cc) url += `&cc=${enc(cc)}`;
      if (bcc) url += `&bcc=${enc(bcc)}`;
      return url;
    },
  },
  {
    id: "yahoo",
    name: "Yahoo Mail",
    icon: YahooIcon,
    appSchemes: {
      android:
        "intent://compose?#Intent;scheme=mailto;package=com.yahoo.mobile.client.android.mail;end",
      ios: "ymail://mail/compose",
    },
    buildWebUrl: (to, subject, body, cc, bcc) => {
      let url = `https://compose.mail.yahoo.com/?to=${enc(to)}&subject=${enc(subject)}&body=${enc(body)}`;
      if (cc) url += `&cc=${enc(cc)}`;
      if (bcc) url += `&bcc=${enc(bcc)}`;
      return url;
    },
  },
  {
    id: "zoho",
    name: "Zoho Mail",
    icon: ZohoIcon,
    appSchemes: {
      android:
        "intent://compose?#Intent;scheme=mailto;package=com.zoho.mail;end",
      ios: "zohomail://compose",
    },
    buildWebUrl: (to, subject, body, cc, bcc) => {
      let url = `https://mail.zoho.com/zm/#compose?to=${enc(to)}&subject=${enc(subject)}&body=${enc(body)}`;
      if (cc) url += `&cc=${enc(cc)}`;
      if (bcc) url += `&bcc=${enc(bcc)}`;
      return url;
    },
  },
  {
    id: "proton",
    name: "Proton Mail",
    icon: ProtonIcon,
    appSchemes: {
      android:
        "intent://compose?#Intent;scheme=mailto;package=ch.protonmail.android;end",
      ios: "protonmail://compose",
    },
    buildWebUrl: (to, subject, body, cc, bcc) => {
      let url = `https://mail.proton.me/u/0/compose?to=${enc(to)}&subject=${enc(subject)}&body=${enc(body)}`;
      if (cc) url += `&cc=${enc(cc)}`;
      if (bcc) url += `&bcc=${enc(bcc)}`;
      return url;
    },
  },
];

/** Detect mobile OS */
function getMobileOS(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
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

/** Extract a meaningful subject from the document content */
function extractSubjectFromContent(content: string): string | null {
  // Try first H1 or H2 heading
  const headingMatch = content.match(/^#{1,2}\s+(.+)/m);
  if (headingMatch) {
    const heading = headingMatch[1]
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .trim();
    if (heading.length > 2 && heading.length < 120) return heading;
  }
  // Try first bold phrase
  const boldMatch = content.match(/\*\*(.{3,80})\*\*/);
  if (boldMatch) return boldMatch[1].trim();
  return null;
}

export function EmailDocumentModal({
  open,
  onClose,
  content,
  defaultSubject = "HR Document from PureDraftHR",
}: EmailDocumentModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState("default");
  const [showCcBcc, setShowCcBcc] = useState(false);

  // Auto-fill subject from content when modal opens
  useEffect(() => {
    if (open) {
      const contentSubject = extractSubjectFromContent(content);
      setSubject(contentSubject || defaultSubject);
    }
  }, [open, content, defaultSubject]);

  const plainBody = useMemo(() => markdownToPlainText(content), [content]);
  const os = useMemo(() => getMobileOS(), []);

  const selectedProvider =
    EMAIL_PROVIDERS.find((p) => p.id === selectedProviderId) ??
    EMAIL_PROVIDERS[0];

  const handleSendEmail = useCallback(() => {
    const to = recipientEmail.trim();
    const sub = subject.trim() || defaultSubject;
    const cc = ccEmail.trim();
    const bcc = bccEmail.trim();

    // "Default Email App" — always use mailto: (triggers OS app chooser on mobile)
    if (selectedProvider.isDefault) {
      window.location.href = buildMailto(to, sub, plainBody, cc, bcc);
      return;
    }

    // Specific providers on mobile — try native app deep link, fall back to web
    if (os !== "desktop") {
      const scheme =
        os === "ios"
          ? selectedProvider.appSchemes.ios
          : selectedProvider.appSchemes.android;
      if (scheme) {
        if (os === "ios") {
          const params = `?to=${enc(to)}&subject=${enc(sub)}&body=${enc(plainBody)}${cc ? `&cc=${enc(cc)}` : ""}${bcc ? `&bcc=${enc(bcc)}` : ""}`;
          const appUrl = scheme + params;
          const webUrl = selectedProvider.buildWebUrl(
            to,
            sub,
            plainBody,
            cc,
            bcc,
          );
          // Try app scheme; if it fails after 1.5s, open web
          const timeout = setTimeout(() => {
            window.open(webUrl, "_blank", "noopener,noreferrer");
          }, 1500);
          const onBlur = () => {
            clearTimeout(timeout);
            window.removeEventListener("blur", onBlur);
          };
          window.addEventListener("blur", onBlur);
          window.location.href = appUrl;
          return;
        } else {
          // Android: intent:// with S.browser_fallback_url
          const intentBase = scheme.replace(
            "intent://compose?",
            `intent://compose?to=${enc(to)}&subject=${enc(sub)}&body=${enc(plainBody)}${cc ? `&cc=${enc(cc)}` : ""}${bcc ? `&bcc=${enc(bcc)}` : ""}&`,
          );
          const fallbackUrl = selectedProvider.buildWebUrl(
            to,
            sub,
            plainBody,
            cc,
            bcc,
          );
          const intentUrl = intentBase.replace(
            ";end",
            `;S.browser_fallback_url=${enc(fallbackUrl)};end`,
          );
          window.location.href = intentUrl;
          return;
        }
      }
    }

    // Desktop or no native scheme — open web compose
    window.open(
      selectedProvider.buildWebUrl(to, sub, plainBody, cc, bcc),
      "_blank",
      "noopener,noreferrer",
    );
  }, [
    recipientEmail,
    ccEmail,
    bccEmail,
    subject,
    defaultSubject,
    plainBody,
    selectedProvider,
    os,
  ]);

  return (
    <Modal open={open} onClose={onClose} title="Send via Email">
      <div className="space-y-4">
        {/* Recipient */}
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

        {/* CC / BCC toggle */}
        <button
          type="button"
          onClick={() => setShowCcBcc((p) => !p)}
          className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
        >
          {showCcBcc ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          {showCcBcc ? "Hide CC & BCC" : "Add CC & BCC"}
        </button>

        {showCcBcc && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-1.5">
              <Label htmlFor="email-cc" className="text-sm">
                CC (optional)
              </Label>
              <Input
                id="email-cc"
                type="email"
                placeholder="cc@company.com"
                value={ccEmail}
                onChange={(ev) => setCcEmail(ev.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-bcc" className="text-sm">
                BCC (optional)
              </Label>
              <Input
                id="email-bcc"
                type="email"
                placeholder="bcc@company.com"
                value={bccEmail}
                onChange={(ev) => setBccEmail(ev.target.value)}
              />
            </div>
          </div>
        )}

        {/* Subject */}
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

        {/* Provider selection — card-style grid */}
        <div className="space-y-1.5">
          <Label className="text-sm flex items-center gap-1.5">
            <Mail className="h-4 w-4" />
            Email Provider
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {EMAIL_PROVIDERS.map((p) => {
              const Icon = p.icon;
              const isSelected = p.id === selectedProviderId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProviderId(p.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30 dark:bg-primary/10"
                      : "border-border bg-card hover:bg-accent/50"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={`text-xs font-medium truncate ${isSelected ? "text-primary" : ""}`}
                  >
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Send button */}
        <Button onClick={handleSendEmail} className="w-full gap-2">
          <ExternalLink className="h-4 w-4" />
          Open in {selectedProvider.name}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          {selectedProvider.isDefault
            ? "Opens your device\u2019s email app chooser with the document pre-filled."
            : `Opens ${selectedProvider.name}${os !== "desktop" ? " app (or web if not installed)" : ""} with the document pre-filled.`}
        </p>
      </div>
    </Modal>
  );
}
