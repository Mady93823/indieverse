import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArtistMonogram } from "@/components/site/artist-chip";
import { Container } from "@/components/site/container";
import { SongRow } from "@/components/site/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getArtistBySlug } from "@/lib/songs/queries";
import type { CreditRole } from "@/generated/prisma/client";

const ROLE_NOUNS: Record<CreditRole, string> = { SINGER: "singer", MUSIC: "composer", LYRICS: "lyricist" };
const ROLE_ORDER: CreditRole[] = ["SINGER", "MUSIC", "LYRICS"];
const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

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

  const roles = ROLE_ORDER.filter((role) => artist.songs.some((song) => song.roles.includes(role)));
  const count = artist.songs.length;

  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <header className="flex items-center gap-5">
        <ArtistMonogram name={artist.name} slug={artist.slug} className="size-20 text-4xl sm:size-24 sm:text-5xl" />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance break-words sm:text-5xl">
            {artist.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {count} {count === 1 ? "song" : "songs"} as {listFormat.format(roles.map((r) => ROLE_NOUNS[r]))}
          </p>
        </div>
      </header>
      <ul className="flex max-w-2xl flex-col gap-1">
        {artist.songs.map((song) => (
          <li key={song.slug}>
            <SongRow
              song={song}
              detail={capitalize(listFormat.format(ROLE_ORDER.filter((r) => song.roles.includes(r)).map((r) => ROLE_NOUNS[r])))}
            />
          </li>
        ))}
      </ul>
    </Container>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ArtistSkeleton() {
  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <div className="flex items-center gap-5">
        <Skeleton className="size-20 rounded-full sm:size-24" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <div className="flex max-w-2xl flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </Container>
  );
}
