"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";

interface EmailDocumentModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  defaultSubject?: string;
}

export function EmailDocumentModal({
  open,
  onClose,
  content,
  defaultSubject = "HR Document from PureDraftHR",
}: EmailDocumentModalProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [sending, setSending] = useState(false);

  const handleSend = useCallback(async () => {
    if (!email.trim()) {
      toast.error("Please enter a recipient email.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/send-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: email.trim(),
          subject: subject.trim() || defaultSubject,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send email.");
        return;
      }

      toast.success(`Document sent to ${email.trim()}`);
      setEmail("");
      onClose();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }, [email, subject, content, defaultSubject, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Email Document"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-recipient">Recipient Email</Label>
          <Input
            id="email-recipient"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-subject">Subject</Label>
          <Input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          The document will be sent as a styled HTML email.
        </p>
      </div>
    </Modal>
  );
}
