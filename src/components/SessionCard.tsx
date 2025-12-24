"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Zap, Clock, MessageSquare } from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";
import { Session, getEventCategory, CATEGORY_COLORS } from "@/lib/types";
import { getSessionStats } from "@/lib/parse-log";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EventCard } from "./EventCard";

interface SessionCardProps {
  session: Session;
  className?: string;
  defaultExpanded?: boolean;
}

export function SessionCard({
  session,
  className,
  defaultExpanded = true,
}: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const stats = useMemo(() => getSessionStats(session), [session]);

  // Get unique event categories for badges
  const categories = useMemo(() => {
    const cats = new Set<string>();
    session.events.forEach((e) => cats.add(getEventCategory(e.event.type)));
    return Array.from(cats);
  }, [session.events]);

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-card to-card/80 border-primary/20",
        className
      )}
    >
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left side - session info */}
          <div className="flex items-start gap-3">
            <button className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{session.id}</h3>
                {session.model && (
                  <Badge variant="secondary" className="text-xs">
                    {session.model}
                  </Badge>
                )}
                {session.voice && (
                  <Badge variant="outline" className="text-xs">
                    🎤 {session.voice}
                  </Badge>
                )}
              </div>

              {/* Session metadata */}
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                {session.startTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimestamp(session.startTime)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {session.events.length} events
                </span>
                {session.sessionId && (
                  <span className="font-mono text-xs truncate max-w-[200px]" title={session.sessionId}>
                    {session.sessionId.slice(0, 12)}...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side - category indicators */}
          <div className="flex flex-wrap gap-1 justify-end">
            {categories.slice(0, 5).map((cat) => (
              <div
                key={cat}
                className={cn(
                  "w-2 h-2 rounded-full",
                  CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]?.split(" ")[0] || "bg-gray-500/20"
                )}
                title={cat}
              />
            ))}
          </div>
        </div>

        {/* Event type stats bar */}
        {!isExpanded && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(stats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([type, count]) => {
                const category = getEventCategory(type);
                const colorClasses = CATEGORY_COLORS[category];
                return (
                  <Badge
                    key={type}
                    variant="outline"
                    className={cn("text-xs font-mono", colorClasses)}
                  >
                    {type.split(".").pop()} <span className="ml-1 opacity-70">×{count}</span>
                  </Badge>
                );
              })}
            {Object.keys(stats).length > 6 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{Object.keys(stats).length - 6} more
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {session.events.map((event, index) => (
              <EventCard
                key={`${event.lineNumber}-${index}`}
                event={event}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
