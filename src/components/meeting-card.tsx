"use client";

import { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Download, ExternalLink } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface MeetingSchedule {
  type: "meeting_schedule";
  title: string;
  description: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Format ISO date to a human-friendly display string */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Format ISO date to a human-friendly time string */
function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Convert ISO string to Google Calendar date format: YYYYMMDDTHHmmssZ */
function toGCalDate(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/** Build a Google Calendar template URL */
function buildGoogleCalendarUrl(meeting: MeetingSchedule): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meeting.title,
    dates: `${toGCalDate(meeting.startTime)}/${toGCalDate(meeting.endTime)}`,
    details: meeting.description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Generate a standards-compliant .ics file string */
function buildIcsContent(meeting: MeetingSchedule): string {
  const dtStart = toGCalDate(meeting.startTime);
  const dtEnd = toGCalDate(meeting.endTime);
  const now = toGCalDate(new Date().toISOString());

  // Fold long description lines per RFC 5545 (max 75 chars per line)
  const escapedDesc = meeting.description
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PureDraftHR//Meeting Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `DTSTAMP:${now}`,
    `UID:${crypto.randomUUID()}@puredrafthr`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:${escapedDesc}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/* ------------------------------------------------------------------ */
/*  Parsing utility — exported for use in the Assistant page           */
/* ------------------------------------------------------------------ */

/**
 * Attempt to extract a MeetingSchedule JSON block from AI response text.
 * Returns { meeting, remainingText } if found, or null if none detected.
 */
export function parseMeetingFromResponse(text: string): {
  meeting: MeetingSchedule;
  remainingText: string;
} | null {
  // Match ```json ... ``` blocks containing "meeting_schedule"
  const regex = /```json\s*\n?([\s\S]*?)\n?\s*```/;
  const match = text.match(regex);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]);
    if (parsed?.type !== "meeting_schedule") return null;
    if (!parsed.title || !parsed.startTime || !parsed.endTime) return null;

    const meeting: MeetingSchedule = {
      type: "meeting_schedule",
      title: parsed.title,
      description: parsed.description || "",
      startTime: parsed.startTime,
      endTime: parsed.endTime,
    };

    // Strip the JSON block from the text to get any surrounding prose
    const remaining = text.replace(match[0], "").trim();
    return { meeting, remainingText: remaining };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface MeetingCardProps {
  meeting: MeetingSchedule;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const googleCalUrl = useMemo(
    () => buildGoogleCalendarUrl(meeting),
    [meeting],
  );

  const handleDownloadIcs = useCallback(() => {
    const icsContent = buildIcsContent(meeting);
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invite.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [meeting]);

  const isSameDay =
    formatDate(meeting.startTime) === formatDate(meeting.endTime);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          {meeting.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date & Time */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{formatDate(meeting.startTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              {formatTime(meeting.startTime)} &ndash;{" "}
              {isSameDay
                ? formatTime(meeting.endTime)
                : `${formatDate(meeting.endTime)}, ${formatTime(meeting.endTime)}`}
            </span>
          </div>
        </div>

        {/* Description */}
        {meeting.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {meeting.description}
          </p>
        )}

        {/* Calendar Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Add to Google Calendar
          </a>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 flex-1"
            onClick={handleDownloadIcs}
          >
            <Download className="h-4 w-4" />
            Download Outlook Invite (.ics)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
