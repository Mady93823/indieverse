import type { Metadata } from "next";
import { Suspense } from "react";
import { ArtistChip } from "@/components/site/artist-chip";
import { Container } from "@/components/site/container";
import { LiveSearchInput } from "@/components/site/live-search-input";
import { SongRow } from "@/components/site/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPopularSongs, searchArtists, searchSongs } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Search</h1>
        <Suspense fallback={<Skeleton className="h-14 rounded-2xl" />}>
          <LiveSearchInput />
        </Suspense>
      </div>
      <Suspense fallback={<ResultsSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  if (!query) {
    const popular = await getPopularSongs(5);
    if (popular.length === 0) return null;
    return (
      <section aria-labelledby="popular-heading" className="flex max-w-2xl flex-col gap-3">
        <h2 id="popular-heading" className="font-display text-2xl font-semibold tracking-tight">
          Most read
        </h2>
        <ol className="flex flex-col gap-1">
          {popular.map((song, i) => (
            <li key={song.slug}>
              <SongRow song={song} rank={i + 1} />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const [songs, artists] = await Promise.all([searchSongs(query), searchArtists(query)]);
  const summary =
    songs.length === 0 && artists.length === 0
      ? `No songs or artists found for “${query}”.`
      : `${songs.length} ${songs.length === 1 ? "song" : "songs"} found for “${query}”.`;

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      {/* Announced to screen readers as results update while typing. */}
      <p role="status" className={cn(songs.length || artists.length ? "sr-only" : "font-medium")}>
        {summary}
      </p>
      {songs.length === 0 && artists.length === 0 && (
        <p className="-mt-8 text-muted-foreground">
          Try fewer letters or another spelling. Tamil words are often spelled several ways in English letters,
          for example “kanne” and “kannae”.
        </p>
      )}
      {artists.length > 0 && (
        <section aria-labelledby="artist-results" className="flex flex-col gap-3">
          <h2 id="artist-results" className="font-display text-2xl font-semibold tracking-tight">
            Artists
          </h2>
          <ul className="flex flex-wrap gap-3">
            {artists.map((artist) => (
              <li key={artist.slug}>
                <ArtistChip {...artist} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {songs.length > 0 && (
        <section aria-labelledby="song-results" className="flex flex-col gap-3">
          <h2 id="song-results" className="font-display text-2xl font-semibold tracking-tight">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </h2>
          <ul className="flex flex-col gap-1">
            {songs.map((song) => (
              <li key={song.slug}>
                <SongRow song={song} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
