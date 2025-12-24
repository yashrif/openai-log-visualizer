"use client";

import { useState } from "react";
import { parseLogFile } from "@/lib/parse-log";
import { SessionCard } from "@/components/SessionCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Session } from "@/lib/types";
import { FileText, ClipboardPaste, Trash2 } from "lucide-react";

export function LogViewer() {
  const [logContent, setLogContent] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isParsed, setIsParsed] = useState(false);

  const handleParse = () => {
    if (!logContent.trim()) return;
    const parsed = parseLogFile(logContent);
    setSessions(parsed);
    setIsParsed(true);
  };

  const handleClear = () => {
    setLogContent("");
    setSessions([]);
    setIsParsed(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLogContent(text);
    } catch {
      // Clipboard access denied, user can still paste manually
    }
  };

  const totalEvents = sessions.reduce((sum, s) => sum + s.events.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                OpenAI Realtime Log Visualizer
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Visualize and analyze OpenAI Realtime API events
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isParsed && (
                <>
                  <Badge variant="outline" className="text-sm">
                    {sessions.length} Sessions
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    {totalEvents.toLocaleString()} Events
                  </Badge>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {!isParsed ? (
          /* Log Input Section */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Paste Your Logs</h2>
              <p className="text-muted-foreground">
                Paste your OpenAI Realtime API logs below to visualize and analyze them
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  placeholder="Paste your OpenAI Realtime logs here...&#10;&#10;Example:&#10;2024-01-15T10:30:00.000Z - {&quot;type&quot;: &quot;session.created&quot;, ...}"
                  className="w-full h-80 p-4 rounded-lg border border-border bg-card text-foreground
                           placeholder:text-muted-foreground resize-none font-mono text-sm
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           transition-all duration-200"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={handlePaste}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleParse}
                  disabled={!logContent.trim()}
                  className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium
                           hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Visualize Logs
                </button>
                {logContent && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-2.5 rounded-lg bg-muted text-muted-foreground font-medium
                             hover:bg-destructive/10 hover:text-destructive
                             transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          /* No events found */
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">No Events Found</h2>
            <p className="text-muted-foreground mb-4">
              The log content contains no valid events.
            </p>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-medium
                       hover:bg-muted/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          /* Parsed Events View */
          <div className="space-y-6">
            {/* Back button and Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-medium
                         hover:bg-muted/80 transition-colors text-sm"
              >
                ← Paste New Logs
              </button>

              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="text-muted-foreground font-medium">Categories:</span>
                <Badge variant="outline" className="bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/40 dark:border-violet-500/30">session</Badge>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40 dark:border-blue-500/30">conversation</Badge>
                <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 dark:border-amber-500/30">audio_buffer</Badge>
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 dark:border-emerald-500/30">response</Badge>
                <Badge variant="outline" className="bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/40 dark:border-pink-500/30">audio</Badge>
                <Badge variant="outline" className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40 dark:border-orange-500/30">function_call</Badge>
                <Badge variant="outline" className="bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 dark:border-red-500/30">error</Badge>
              </div>
            </div>

            {/* Sessions */}
            {sessions.map((session, index) => (
              <SessionCard
                key={session.id}
                session={session}
                defaultExpanded={index === 0}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            OpenAI Realtime API Log Visualizer • Built with Next.js & shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
}
