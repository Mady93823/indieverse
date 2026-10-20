import Link from "next/link";
import { CoverImage } from "@/components/site/cover-image";
import type { SongCardData } from "@/lib/songs/queries";

export function SongCard({ song, footer }: { song: SongCardData; footer?: React.ReactNode }) {
  return (
    <Link href={`/songs/${song.slug}`} className="group block rounded-xl outline-none">
      <CoverImage
        src={song.coverImage}
        alt=""
        sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
        className="transition group-hover:opacity-90 group-focus-visible:ring-3 group-focus-visible:ring-ring/50"
      />
      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-1 font-medium group-hover:underline">{song.title}</p>
        {song.titleTamil && (
          <p lang="ta" className="line-clamp-1 text-sm text-muted-foreground">
            {song.titleTamil}
          </p>
        )}
        {song.singers.length > 0 && (
          <p className="line-clamp-1 text-sm text-muted-foreground">{song.singers.join(", ")}</p>
        )}
        {footer}
      </div>
    </Link>
  );
}

export function SongGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">{children}</div>
  );
}
