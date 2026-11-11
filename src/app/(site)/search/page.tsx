import type { Metadata } from "next";
import { Suspense } from "react";
import { ArtistChip } from "@/components/site/artist-chip";
import { Container } from "@/components/site/container";
import { LiveSearchInput } from "@/components/site/live-search-input";
import { LyricCard, RankCard } from "@/components/site/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPopularSongs, searchArtists, searchSongs } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Container className="flex flex-col gap-10 py-12 sm:py-16">
      <div className="flex max-w-3xl flex-col gap-5">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find a song</h1>
        <Suspense fallback={<Skeleton className="h-14 rounded-full" />}>
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
      <section aria-labelledby="popular-heading" className="flex flex-col gap-4">
        <h2 id="popular-heading" className="text-2xl font-semibold tracking-tight">
          Most read
        </h2>
        <ol className="grid gap-3.5 lg:max-w-[864px] lg:grid-cols-2">
          {popular.map((song, i) => (
            <li key={song.slug}>
              <RankCard song={song} rank={i + 1} />
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
    <div className="flex flex-col gap-10">
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
          <h2 id="artist-results" className="text-2xl font-semibold tracking-tight">
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
          <h2 id="song-results" className="text-2xl font-semibold tracking-tight">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </h2>
          <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <li key={song.slug}>
                <LyricCard song={song} />
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
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-[84px] rounded-2xl" />
      ))}
    </div>
  );
}
