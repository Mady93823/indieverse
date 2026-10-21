import Link from "next/link";
import { CoverImage } from "@/components/site/cover-image";
import type { SongCardData } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

/** Cover-first tile for shelves and grids. No box around it: the cover is the card. */
export function SongTile({ song, className }: { song: SongCardData; className?: string }) {
  return (
    <Link href={`/songs/${song.slug}`} className={cn("group flex flex-col gap-2.5 rounded-xl outline-none", className)}>
      <CoverImage
        src={song.coverImage}
        alt=""
        sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 42vw"
        className="transition-[scale,box-shadow] duration-200 ease-(--ease-snap) group-hover:shadow-lg group-focus-visible:ring-3 group-focus-visible:ring-ring/50 motion-safe:group-hover:scale-[1.02]"
      />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold">{song.title}</span>
        {song.titleTamil && (
          <span lang="ta" className="truncate text-sm text-muted-foreground">
            {song.titleTamil}
          </span>
        )}
        {song.singers.length > 0 && (
          <span className="truncate text-sm text-muted-foreground">{song.singers.join(", ")}</span>
        )}
      </div>
    </Link>
  );
}

/**
 * A row in a list: small cover, title, Tamil title, singers.
 * `rank` shows a chart number; `detail` replaces the singers line (e.g. an artist's roles).
 */
export function SongRow({
  song,
  rank,
  detail,
}: {
  song: SongCardData;
  rank?: number;
  detail?: React.ReactNode;
}) {
  return (
    <Link
      href={`/songs/${song.slug}`}
      className="-mx-2 flex items-center gap-4 rounded-xl p-2 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {rank !== undefined && (
        <span className="w-7 shrink-0 text-center font-display text-2xl font-semibold text-marigold-text tabular-nums">
          {rank}
        </span>
      )}
      <CoverImage src={song.coverImage} alt="" sizes="56px" className="size-14 shrink-0 rounded-lg" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-semibold">{song.title}</span>
        {song.titleTamil && (
          <span lang="ta" className="truncate text-sm text-muted-foreground">
            {song.titleTamil}
          </span>
        )}
        <span className="truncate text-sm text-muted-foreground">{detail ?? song.singers.join(", ")}</span>
      </span>
    </Link>
  );
}

/**
 * A row of covers that scrolls sideways on phones and becomes a grid on wide screens.
 * `columns` sets how many fit per row on desktop.
 */
export function SongShelf({ songs, columns = 6 }: { songs: SongCardData[]; columns?: 3 | 6 }) {
  return (
    <ul
      className={cn(
        // scroll-px keeps snapped covers off the screen edge (snapping ignores normal padding).
        "scroll-fade-x -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6",
        "lg:scroll-fade-none lg:mx-0 lg:grid lg:snap-none lg:gap-x-5 lg:gap-y-8 lg:overflow-visible lg:px-0 lg:pb-0",
        columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-6",
      )}
    >
      {songs.map((song) => (
        <li key={song.slug} className="w-36 shrink-0 snap-start sm:w-44 lg:w-auto">
          <SongTile song={song} />
        </li>
      ))}
    </ul>
  );
}
