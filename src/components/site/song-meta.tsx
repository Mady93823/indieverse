import Link from "next/link";
import { PlayIcon } from "lucide-react";
import { ShareButton } from "@/components/site/share-button";
import type { ArtistLink, SongDetail } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

/** "ALBUM · YEAR" above a song's title. */
export function albumLine(song: Pick<SongDetail, "album" | "releaseYear">) {
  return [song.album, song.releaseYear].filter(Boolean).join(" · ");
}

/** Music, lyrics and vocals credits as label/name rows, each name linking to the artist. */
export function CreditsTable({ song }: { song: SongDetail }) {
  const rows: [string, ArtistLink[]][] = [
    ["Music", song.music],
    ["Lyrics", song.lyricists],
    ["Vocals", song.singers],
  ];
  return (
    <dl className="flex flex-col gap-2.5 text-sm">
      {rows
        .filter(([, artists]) => artists.length > 0)
        .map(([label, artists]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right">
              {artists.map((artist, i) => (
                <span key={artist.slug}>
                  {i > 0 && ", "}
                  <Link href={`/artists/${artist.slug}`} className="hover:text-pink hover:underline hover:underline-offset-4">
                    {artist.name}
                  </Link>
                </span>
              ))}
            </dd>
          </div>
        ))}
    </dl>
  );
}

/** "Play song" (YouTube, else Spotify) and a share button. */
export function PlayAndShare({ song, shareUrl, className }: { song: SongDetail; shareUrl?: string; className?: string }) {
  const play = song.youtubeUrl
    ? { href: song.youtubeUrl, label: "Play song" }
    : song.spotifyUrl
      ? { href: song.spotifyUrl, label: "Listen on Spotify" }
      : null;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {play && (
        <a
          href={play.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-[background-color,scale] outline-none hover:bg-[#c4234d] focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]"
        >
          <PlayIcon className="size-4 fill-current" aria-hidden />
          {play.label}
        </a>
      )}
      <ShareButton title={song.title} url={shareUrl} />
    </div>
  );
}
