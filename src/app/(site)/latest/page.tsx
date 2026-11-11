import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { LyricCard } from "@/components/site/song-card";
import { getRecentSongs } from "@/lib/songs/queries";

export const metadata: Metadata = {
  title: "Latest Tamil Song Lyrics",
  description: "The newest Tamil song lyrics on the site, in Tamil script with Tanglish under every line.",
  alternates: { canonical: "/latest" },
};

const SHOWN = 60;

export default async function LatestPage() {
  const songs = await getRecentSongs(SHOWN);
  return (
    <>
      <PageHeader title="Latest lyrics">
        The newest songs, in Tamil with Tanglish under every line.
      </PageHeader>
      <Container className="pb-20">
        {songs.length === 0 ? (
          <p className="text-muted-foreground">No songs yet.</p>
        ) : (
          <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <li key={song.slug}>
                <LyricCard song={song} />
              </li>
            ))}
          </ul>
        )}
        {songs.length === SHOWN && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Looking for something older?{" "}
            <Link href="/songs" className="text-pink hover:underline hover:underline-offset-4">
              Browse every song A–Z
            </Link>
          </p>
        )}
      </Container>
    </>
  );
}
