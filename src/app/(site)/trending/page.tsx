import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { CoverTile } from "@/components/site/song-card";
import { getTrendingSongs } from "@/lib/songs/queries";

export const metadata: Metadata = {
  title: "Trending Tamil Song Lyrics This Week",
  description: "The Tamil song lyrics people are reading most this week.",
  alternates: { canonical: "/trending" },
};

export default async function TrendingPage() {
  const songs = await getTrendingSongs(30);
  return (
    <>
      <PageHeader title="Trending now">
        The songs read most in the last seven days.
      </PageHeader>
      <Container className="pb-20">
        {songs.length === 0 ? (
          <p className="text-muted-foreground">No songs yet.</p>
        ) : (
          <ol className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {songs.map((song, i) => (
              <li key={song.slug}>
                <CoverTile song={song} rank={i + 1} />
              </li>
            ))}
          </ol>
        )}
      </Container>
    </>
  );
}
