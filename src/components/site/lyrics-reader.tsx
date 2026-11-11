"use client";

import { Fragment } from "react";
import { AArrowDownIcon, AArrowUpIcon } from "lucide-react";
import { LyricsModeToggle, useLyricsMode } from "@/components/site/lyrics-mode";
import { useStoredPreference } from "@/components/site/stored-preference";
import { Button } from "@/components/ui/button";
import { takeLines, type Verse } from "@/lib/lyrics";
import { cn } from "@/lib/utils";

// Text sizes in px. People often read along on a phone while the song plays, so bigger is offered.
const SIZES = ["18", "20", "22", "25", "28"] as const;
const INTERLUDE_AFTER = 3;
const INTERLUDE_MIN_VERSES = 5;

/** The song page's lyrics: a sticky bar with the Tamil/Tanglish switch and text size, then every verse. */
export function LyricsReader({ verses, interlude }: { verses: Verse[]; interlude?: React.ReactNode }) {
  const [size, setSize] = useStoredPreference("lyrics-size", SIZES, "22");
  const sizeIndex = SIZES.indexOf(size);

  return (
    <div>
      {/* Stays at the top while reading, so switching script or size is always one tap away. */}
      <div className="sticky top-18 z-10 -mx-4 flex items-center justify-between gap-2 border-b bg-background/90 px-4 py-2.5 backdrop-blur-md sm:mx-0 sm:px-0">
        <LyricsModeToggle />
        <div role="group" aria-label="Text size" className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Smaller text"
            disabled={sizeIndex === 0}
            onClick={() => setSize(SIZES[sizeIndex - 1])}
          >
            <AArrowDownIcon aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Larger text"
            disabled={sizeIndex === SIZES.length - 1}
            onClick={() => setSize(SIZES[sizeIndex + 1])}
          >
            <AArrowUpIcon aria-hidden />
          </Button>
        </div>
      </div>
      <LyricLines verses={verses} size={size} interlude={interlude} className="max-w-3xl pt-6" />
    </div>
  );
}

/**
 * Verses as Tamil lines with their Tanglish underneath. Both scripts are always in the page
 * (so search engines index both); the chosen mode only hides one with CSS.
 * `maxLines` shows just the start, for the home page.
 */
export function LyricLines({
  verses,
  size,
  maxLines,
  highlightFirst = false,
  meta,
  interlude,
  className,
}: {
  verses: Verse[];
  size?: string;
  maxLines?: number;
  highlightFirst?: boolean;
  /** Shown at the right of the first verse's label, e.g. "6 of 18 lines". */
  meta?: React.ReactNode;
  interlude?: React.ReactNode;
  className?: string;
}) {
  const [mode] = useLyricsMode();
  const shown = maxLines ? takeLines(verses, maxLines) : verses;

  return (
    <div
      data-mode={mode}
      style={size ? { fontSize: `${size}px` } : undefined}
      className={cn("group/lyrics flex flex-col", className)}
    >
      {shown.map((verse, v) => (
        <Fragment key={v}>
          <section aria-label={`Verse ${v + 1}`} className="pb-7">
            <div className="mb-2 flex items-baseline justify-between gap-4 text-xs text-muted-foreground">
              <p className="font-semibold tracking-[0.08em] uppercase">Verse {v + 1}</p>
              {v === 0 && meta}
            </div>
            {verse.map((line, i) => (
              <div
                key={i}
                className="border-b border-border/70 py-[0.55em] last:border-0 group-data-[mode=en]/lyrics:border-0 group-data-[mode=en]/lyrics:py-[0.15em] group-data-[mode=ta]/lyrics:border-0 group-data-[mode=ta]/lyrics:py-[0.15em]"
              >
                {line.ta && (
                  <p lang="ta" className="leading-[1.65] text-pretty group-data-[mode=en]/lyrics:hidden">
                    {line.ta}
                  </p>
                )}
                {line.en && (
                  <p
                    lang="ta-Latn"
                    className={cn(
                      "mt-[0.2em] text-[0.72em] leading-snug text-pretty text-muted-foreground group-data-[mode=ta]/lyrics:hidden",
                      "group-data-[mode=en]/lyrics:mt-0 group-data-[mode=en]/lyrics:text-[1em] group-data-[mode=en]/lyrics:leading-[1.65] group-data-[mode=en]/lyrics:text-foreground",
                      highlightFirst && v === 0 && i === 0 && "text-pink",
                    )}
                  >
                    {line.en}
                  </p>
                )}
              </div>
            ))}
          </section>
          {v === INTERLUDE_AFTER - 1 && verses.length >= INTERLUDE_MIN_VERSES && !maxLines && interlude}
        </Fragment>
      ))}
    </div>
  );
}
