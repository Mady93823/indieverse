"use client";

import { Fragment } from "react";
import { AArrowDownIcon, AArrowUpIcon } from "lucide-react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { useStoredPreference } from "@/components/site/stored-preference";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANGS = ["ta", "en"] as const;
// Text sizes in px. People often read along on a phone while the song plays, so bigger is offered.
const SIZES = ["17", "19", "21", "24", "27"] as const;

export function LyricsReader({ tamil, english }: { tamil: string; english: string }) {
  const [lang, setLang] = useStoredPreference("lyrics-lang", LANGS, "ta");
  const [size, setSize] = useStoredPreference("lyrics-size", SIZES, "21");
  const sizeIndex = SIZES.indexOf(size);

  return (
    <TabsPrimitive.Root value={lang} onValueChange={(value) => setLang(value as (typeof LANGS)[number])}>
      {/* Stays at the top while reading, so switching language or size is always one tap away. */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <TabsPrimitive.List
          aria-label="Lyrics language"
          className="relative grid h-11 w-56 grid-cols-2 rounded-full bg-muted p-1"
        >
          {/* The marigold pill slides to the chosen language. */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-marigold shadow-sm",
              "transition-transform duration-200 ease-(--ease-snap) motion-reduce:transition-none",
              lang === "en" && "translate-x-full",
            )}
          />
          <LangTab value="ta" lang="ta">
            தமிழ்
          </LangTab>
          <LangTab value="en">English</LangTab>
        </TabsPrimitive.List>

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

      {/* Both versions stay in the page (forceMount) so search engines index them; CSS hides the other. */}
      <LyricsPanel value="ta" lang="ta" text={tamil} size={size} className="leading-[1.95]" />
      <LyricsPanel value="en" lang="ta-Latn" text={english} size={size} className="leading-[1.8]" />
    </TabsPrimitive.Root>
  );
}

function LangTab({ value, lang, children }: { value: string; lang?: string; children: React.ReactNode }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      lang={lang}
      className={cn(
        "relative z-10 rounded-full text-base font-semibold text-muted-foreground outline-none",
        "transition-colors duration-200 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        "data-[state=active]:text-marigold-foreground",
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

function LyricsPanel({
  value,
  lang,
  text,
  size,
  className,
}: {
  value: string;
  lang: string;
  text: string;
  size: string;
  className?: string;
}) {
  return (
    <TabsPrimitive.Content
      value={value}
      forceMount
      lang={lang}
      style={{ fontSize: `${size}px` }}
      className={cn(
        "max-w-2xl pt-8 outline-none data-[state=inactive]:hidden",
        "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200 motion-reduce:animate-none",
        className,
      )}
    >
      {text.split(/\n{2,}/).map((verse, i) => (
        <p key={i} className="mb-[1.1em] text-pretty">
          {verse.split("\n").map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      ))}
    </TabsPrimitive.Content>
  );
}
