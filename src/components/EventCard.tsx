"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Hash } from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";
import { ParsedLogLine, getEventCategory, CATEGORY_COLORS } from "@/lib/types";
import { getSanitizedEventData } from "@/lib/parse-log";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "./JsonViewer";

interface EventCardProps {
  event: ParsedLogLine;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const category = getEventCategory(event.event.type);
  const colorClasses = CATEGORY_COLORS[category];
  const sanitizedData = getSanitizedEventData(event.event);

  // Extract useful preview data
  const eventType = String(event.event.type ?? 'unknown');
  const previewData = getPreviewData(event.event);

  return (
    <div
      className={cn(
        "event-card border rounded-lg p-3 bg-card/50 backdrop-blur-sm",
        "hover:bg-card/80 transition-all",
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Expand indicator */}
        <button className="mt-0.5 text-muted-foreground hover:text-foreground">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Event info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Event type badge */}
            <Badge
              variant="outline"
              className={cn("font-mono text-xs border", colorClasses)}
            >
              {eventType}
            </Badge>

            {/* Function name for function calls */}
            {event.event.name && (
              <Badge variant="secondary" className="font-mono text-xs">
                {String(event.event.name)}
              </Badge>
            )}

            {/* Timestamp */}
            {event.timestamp && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(event.timestamp)}
              </span>
            )}

            {/* Line number */}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {event.lineNumber}
            </span>
          </div>

          {/* Preview data */}
          {previewData && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {previewData}
            </p>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t">
          <JsonViewer
            data={sanitizedData}
            initialExpanded={false}
            maxStringLength={200}
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
}

// Helper to extract preview data based on event type
function getPreviewData(event: Record<string, unknown>): string | null {
  const type = event.type as string;

  // Transcription events
  if (type.includes("transcription") && event.transcript) {
    return `"${(event.transcript as string).slice(0, 100)}${
      (event.transcript as string).length > 100 ? "..." : ""
    }"`;
  }

  // Audio transcript delta/done
  if (type.includes("audio_transcript") && event.delta) {
    return `"${event.delta as string}"`;
  }

  if (type.includes("audio_transcript.done") && event.transcript) {
    return `"${(event.transcript as string).slice(0, 100)}${
      (event.transcript as string).length > 100 ? "..." : ""
    }"`;
  }

  // Function call arguments
  if (type === "response.function_call_arguments.done" && event.arguments) {
    try {
      const args = JSON.parse(event.arguments as string);
      return JSON.stringify(args);
    } catch {
      return event.arguments as string;
    }
  }

  // Response done - show usage
  if (type === "response.done" && event.response) {
    const response = event.response as Record<string, unknown>;
    const usage = response.usage as Record<string, unknown> | undefined;
    if (usage) {
      return `Tokens: ${usage.total_tokens} (in: ${usage.input_tokens}, out: ${usage.output_tokens})`;
    }
  }

  // Session events - show model/voice
  if (type.includes("session") && event.session) {
    const session = event.session as Record<string, unknown>;
    const parts = [];
    if (session.model) parts.push(`Model: ${session.model}`);
    if (session.voice) parts.push(`Voice: ${session.voice}`);
    return parts.join(" | ");
  }

  // Rate limits
  if (type === "rate_limits.updated" && event.rate_limits) {
    const limits = event.rate_limits as Array<Record<string, unknown>>;
    return limits.map((l) => `${l.name}: ${l.remaining}/${l.limit}`).join(", ");
  }

  // Error events
  if (type === "error" && event.error) {
    const error = event.error as Record<string, unknown>;
    return error.message as string || "Unknown error";
  }

  return null;
}
