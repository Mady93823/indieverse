"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

const TYPING_PAUSE_MS = 250;

/** Search field for the search page: results update as you type, and the URL keeps the query. */
export function LiveSearchInput() {
  const router = useRouter();
  const initial = useSearchParams().get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Focus the field on desktop when there's nothing searched yet. Not on phones,
  // where it would pop the keyboard over the page.
  useEffect(() => {
    if (!initial && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, [initial]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function search(query: string) {
    clearTimeout(timer.current);
    const q = query.trim();
    startTransition(() => {
      router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false });
    });
  }

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();
        search(value);
      }}
    >
      <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          clearTimeout(timer.current);
          const next = event.target.value;
          timer.current = setTimeout(() => search(next), TYPING_PAUSE_MS);
        }}
        placeholder="Song, film, singer, composer or lyricist…"
        aria-label="Search songs, films and artists"
        autoComplete="off"
        enterKeyHint="search"
        className="h-14 rounded-full bg-card pr-12 pl-12 text-lg shadow-sm md:text-lg"
      />
      {pending && (
        <Loader2Icon
          aria-label="Searching…"
          className="absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin text-muted-foreground"
        />
      )}
    </form>
  );
}
