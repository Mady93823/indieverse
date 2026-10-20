import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBox } from "@/components/site/search-box";
import { SongCard, SongGrid } from "@/components/site/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import { searchSongs } from "@/lib/songs/queries";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="space-y-8">
      <h1 className="sr-only">Search</h1>
      <Suspense fallback={<SearchFallback />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const songs = await searchSongs(query);

  return (
    <>
      {/* key: reset the field when the query changes through navigation */}
      <SearchBox key={query} size="lg" defaultValue={query} autoFocus={!query} className="max-w-xl" />
      {query === "" ? (
        <p className="text-muted-foreground">Type a song name or an artist name.</p>
      ) : songs.length === 0 ? (
        <div className="space-y-1">
          <p className="font-medium">No songs found for “{query}”.</p>
          <p className="text-sm text-muted-foreground">
            Try a shorter word or another spelling, such as the artist’s name.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {songs.length} {songs.length === 1 ? "song" : "songs"} for “{query}”
          </p>
          <SongGrid>
            {songs.map((song) => (
              <SongCard key={song.slug} song={song} />
            ))}
          </SongGrid>
        </section>
      )}
    </>
  );
}

function SearchFallback() {
  return (
    <>
      <Skeleton className="h-12 max-w-xl rounded-xl" />
      <SongGrid>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </SongGrid>
    </>
  );
}
