import Image from "next/image";
import Link from "next/link";
import { ArtistMonogram } from "@/components/site/artist-chip";
import type { ArtistSummary } from "@/lib/songs/queries";

const number = new Intl.NumberFormat("en-IN");

/** A photo card for lyricists and composers: photo, name and how many songs the site has. */
export function ArtistCard({ artist }: { artist: ArtistSummary }) {
  return (
    <Link href={`/artists/${artist.slug}`} className="group flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <span className="relative block aspect-[31/30] overflow-hidden rounded-2xl bg-card">
        {artist.photo ? (
          <Image
            src={artist.photo}
            alt=""
            fill
            sizes="(min-width: 1024px) 310px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 ease-(--ease-snap) group-hover:scale-[1.03]"
          />
        ) : (
          <ArtistMonogram name={artist.name} slug={artist.slug} className="size-full rounded-none text-7xl" />
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-lg">{artist.name}</span>
        <span className="text-xs text-muted-foreground">
          {number.format(artist.songs)} {artist.songs === 1 ? "song" : "songs"} in the archive
        </span>
      </span>
    </Link>
  );
}
