import { parseLogFile } from "@/lib/parse-log";
import { SessionCard } from "@/components/SessionCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import fs from "fs/promises";
import path from "path";

export default async function Home() {
  // Read the log file
  const logPath = path.join(process.cwd(), "src/docs/openai.log");
  let logContent = "";
  let error = null;

  try {
    logContent = await fs.readFile(logPath, "utf-8");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to read log file";
  }

  // Parse the log file into sessions
  const sessions = logContent ? parseLogFile(logContent) : [];

  // Calculate total stats
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
              <Badge variant="outline" className="text-sm">
                {sessions.length} Sessions
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {totalEvents.toLocaleString()} Events
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Error Loading Log File
            </h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure the file exists at: <code className="font-mono">{logPath}</code>
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">No Events Found</h2>
            <p className="text-muted-foreground">
              The log file appears to be empty or contains no valid events.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="text-muted-foreground font-medium">Event Categories:</span>
              <Badge variant="outline" className="bg-violet-500/20 text-violet-300 border-violet-500/30">session</Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">conversation</Badge>
              <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">audio_buffer</Badge>
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">response</Badge>
              <Badge variant="outline" className="bg-pink-500/20 text-pink-300 border-pink-500/30">audio</Badge>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">function_call</Badge>
              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">error</Badge>
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
