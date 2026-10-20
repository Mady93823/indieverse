"use client";

import { useSyncExternalStore } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Lang = "ta" | "en";

// Remembers the reader's last choice across songs and visits.
const STORAGE_KEY = "lyrics-lang";
const listeners = new Set<() => void>();

function readLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ta";
  } catch {
    return "ta";
  }
}

function saveLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Private mode or storage blocked: the toggle still works, it just isn't remembered.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function LyricsToggle({ tamil, english }: { tamil: string; english: string }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => "ta" as const);

  return (
    <Tabs value={lang} onValueChange={(value) => saveLang(value as Lang)}>
      <TabsList className="h-11! w-full max-w-xs" aria-label="Lyrics language">
        <TabsTrigger value="ta" lang="ta" className="text-base">
          தமிழ்
        </TabsTrigger>
        <TabsTrigger value="en" className="text-base">
          English
        </TabsTrigger>
      </TabsList>
      {/* Both versions stay in the page (forceMount) so search engines index them; CSS hides the other one. */}
      <TabsContent
        value="ta"
        forceMount
        lang="ta"
        className="mt-4 text-lg leading-loose whitespace-pre-line data-[state=inactive]:hidden"
      >
        {tamil}
      </TabsContent>
      <TabsContent
        value="en"
        forceMount
        lang="ta-Latn"
        className="mt-4 text-lg leading-loose whitespace-pre-line data-[state=inactive]:hidden"
      >
        {english}
      </TabsContent>
    </Tabs>
  );
}
