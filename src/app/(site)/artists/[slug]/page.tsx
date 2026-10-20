import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SongCard, SongGrid } from "@/components/site/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getArtistBySlug } from "@/lib/songs/queries";
import type { CreditRole } from "@/generated/prisma/client";

const ROLE_LABELS: Record<CreditRole, string> = {
  SINGER: "Singer",
  MUSIC: "Music",
  LYRICS: "Lyrics",
};

export async function generateMetadata({ params }: PageProps<"/artists/[slug]">): Promise<Metadata> {
  const artist = await getArtistBySlug((await params).slug);
  if (!artist) return { title: "Artist not found" };
  return {
    title: `${artist.name} Song Lyrics`,
    description: `Lyrics of songs by ${artist.name}, in Tamil and English.`,
    alternates: { canonical: `/artists/${artist.slug}` },
  };
}

export default function ArtistPage({ params }: PageProps<"/artists/[slug]">) {
  return (
    <Suspense fallback={<ArtistSkeleton />}>
      <ArtistContent params={params} />
    </Suspense>
  );
}

async function ArtistContent({ params }: Pick<PageProps<"/artists/[slug]">, "params">) {
  const artist = await getArtistBySlug((await params).slug);
  if (!artist) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Artist</p>
        <h1 className="text-3xl font-semibold tracking-tight">{artist.name}</h1>
        <p className="mt-1 text-muted-foreground">
          {artist.songs.length} {artist.songs.length === 1 ? "song" : "songs"}
        </p>
      </div>
      <SongGrid>
        {artist.songs.map((song) => (
          <SongCard
            key={song.slug}
            song={song}
            footer={
              <p className="text-xs text-muted-foreground">
                {song.roles.map((role) => ROLE_LABELS[role]).join(" · ")}
              </p>
            }
          />
        ))}
      </SongGrid>
    </div>
  );
}

function ArtistSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <SongGrid>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </SongGrid>
    </div>
  );
}
