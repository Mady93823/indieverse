import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { RankCard } from "@/components/site/song-card";
import { getPopularSongs } from "@/lib/songs/queries";

export const metadata: Metadata = {
  title: "Top 100 Tamil Song Lyrics of All Time",
  description: "The most-read Tamil song lyrics of all time, with Tamil script and Tanglish.",
  alternates: { canonical: "/popular" },
};

export default async function PopularPage() {
  const songs = await getPopularSongs(100);
  return (
    <>
      <PageHeader title="All-time popular songs">
        The top 100 by all-time reads.
      </PageHeader>
      <Container className="pb-20">
        {songs.length === 0 ? (
          <p className="text-muted-foreground">No reads yet. Songs appear here once people start reading them.</p>
        ) : (
          <ol className="grid gap-3.5 lg:grid-cols-2">
            {songs.map((song, i) => (
              <li key={song.slug}>
                <RankCard song={song} rank={i + 1} />
              </li>
            ))}
          </ol>
        )}
      </Container>
    </>
  );
}
