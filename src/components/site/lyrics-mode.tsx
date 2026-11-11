"use client";

import { useStoredPreference } from "@/components/site/stored-preference";
import { cn } from "@/lib/utils";

// How lyrics are shown, remembered on the device and shared by every reader on the site:
// Tamil with Tanglish under each line, Tamil only, or Tanglish only.
export const LYRICS_MODES = ["both", "ta", "en"] as const;
export type LyricsMode = (typeof LYRICS_MODES)[number];

const LABELS: Record<LyricsMode, string> = { both: "Tamil + Tanglish", ta: "Tamil only", en: "Tanglish only" };
// Shorter labels on phones, so the switch and the text size buttons fit on one row.
const SHORT: Record<LyricsMode, string> = { both: "Both", ta: "Tamil", en: "Tanglish" };

export function useLyricsMode() {
  return useStoredPreference("lyrics-mode", LYRICS_MODES, "both");
}

/** The pill switch above lyrics (the shown choice in pink). */
export function LyricsModeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useLyricsMode();
  return (
    <div role="group" aria-label="Show lyrics in" className={cn("flex rounded-full border bg-card p-1 shadow-xs", className)}>
      {LYRICS_MODES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={mode === option}
          onClick={() => setMode(option)}
          className={cn(
            "min-h-10 rounded-full px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-8 sm:px-3.5",
            mode === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="sm:hidden">{SHORT[option]}</span>
          <span className="hidden sm:inline">{LABELS[option]}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * The header's "தமிழ் · EN" switch: which script to read lyrics in. Tamil keeps Tanglish under
 * each line (the default); EN shows Tanglish only.
 */
export function ScriptToggle() {
  const [mode, setMode] = useLyricsMode();
  const english = mode === "en";
  const segment = "min-h-8 rounded-full px-2.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
  return (
    <div
      role="group"
      aria-label="Lyrics script"
      className="flex items-center rounded-full border bg-card p-0.5 text-sm"
    >
      <button
        type="button"
        lang="ta"
        aria-pressed={!english}
        onClick={() => english && setMode("both")}
        className={cn(segment, english ? "text-muted-foreground hover:text-foreground" : "bg-muted font-medium text-foreground")}
      >
        தமிழ்
      </button>
      <button
        type="button"
        aria-pressed={english}
        aria-label="English letters"
        onClick={() => setMode("en")}
        className={cn(segment, english ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        EN
      </button>
    </div>
  );
}
