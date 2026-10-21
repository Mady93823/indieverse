import Link from "next/link";
import { cn } from "@/lib/utils";

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Each artist gets a steady hue from their slug, so their monogram always looks the same. */
function hueFor(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.codePointAt(0)!) % 360;
  return hash;
}

/** A coloured circle with the artist's first letter (a whole Tamil letter, not half of one). */
export function ArtistMonogram({ name, slug, className }: { name: string; slug: string; className?: string }) {
  const first = segmenter.segment(name).containing(0)?.segment.toUpperCase() ?? "?";
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-full font-display font-semibold", className)}
      style={{
        backgroundColor: `color-mix(in oklab, oklch(0.72 0.14 ${hueFor(slug)}) var(--song-tint), var(--background))`,
      }}
    >
      {first}
    </span>
  );
}

export function ArtistChip({ name, slug, songs }: { name: string; slug: string; songs?: number }) {
  return (
    <Link
      href={`/artists/${slug}`}
      className="inline-flex items-center gap-3 rounded-full border bg-card py-1.5 pr-4 pl-1.5 transition-colors outline-none hover:border-foreground/25 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArtistMonogram name={name} slug={slug} className="size-9 text-base" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-medium">{name}</span>
        {songs !== undefined && (
          <span className="text-xs text-muted-foreground">
            {songs} {songs === 1 ? "song" : "songs"}
          </span>
        )}
      </span>
    </Link>
  );
}
