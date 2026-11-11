import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { CoverImage } from "@/components/site/cover-image";
import type { SongCardData } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

/** "Album · Composer · Year" under a song title, falling back to the singers. */
export function songMeta(song: SongCardData) {
  const by = song.music[0] ?? song.singers[0];
  return [song.album, by, song.releaseYear].filter(Boolean).join(" · ");
}

const row =
  "group -mx-2 flex items-center gap-4 rounded-xl px-2 py-2 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

/** A list row: small cover, title, and album, composer and year. */
export function LyricCard({ song, detail }: { song: SongCardData; detail?: string }) {
  return (
    <Link href={`/songs/${song.slug}`} className={row}>
      <CoverImage src={song.coverImage} alt="" sizes="56px" className="size-14 shrink-0 rounded-lg" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{song.title}</span>
        {song.titleTamil && (
          <span lang="ta" className="truncate text-sm text-muted-foreground">
            {song.titleTamil}
          </span>
        )}
        <span className="truncate text-sm text-muted-foreground">{detail ?? songMeta(song)}</span>
      </span>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
    </Link>
  );
}

/** A square cover with the title underneath. Covers are square, so they're never cropped. */
export function CoverTile({ song, rank, className }: { song: SongCardData; rank?: number; className?: string }) {
  return (
    <Link href={`/songs/${song.slug}`} className={cn("group flex flex-col gap-2.5 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}>
      <span className="relative block">
        <CoverImage
          src={song.coverImage}
          alt=""
          sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
          className="rounded-xl shadow-sm transition-[scale,box-shadow] duration-200 ease-(--ease-snap) group-hover:shadow-md motion-safe:group-hover:scale-[1.02]"
        />
        {rank !== undefined && (
          <span className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-foreground tabular-nums shadow-sm">
            {rank}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{song.title}</span>
        <span className="truncate text-sm text-muted-foreground">{song.singers.join(", ") || song.album}</span>
      </span>
    </Link>
  );
}

/** A numbered row, for charts. The top three numbers are pink. */
export function RankCard({ song, rank }: { song: SongCardData; rank: number }) {
  return (
    <Link href={`/songs/${song.slug}`} className={row}>
      <span className={cn("w-7 shrink-0 text-center text-lg font-semibold tabular-nums", rank <= 3 ? "text-pink" : "text-muted-foreground")}>
        {rank}
      </span>
      <CoverImage src={song.coverImage} alt="" sizes="48px" className="size-12 shrink-0 rounded-lg" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{song.title}</span>
        <span className="truncate text-sm text-muted-foreground">{songMeta(song)}</span>
      </span>
    </Link>
  );
}
