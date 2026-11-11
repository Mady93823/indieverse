import type { Metadata } from "next";
import { ArtistChip } from "@/components/site/artist-chip";
import { Container } from "@/components/site/container";
import { LetterNav } from "@/components/site/letter-nav";
import { groupByLetter } from "@/lib/alphabet";
import { getAllArtists } from "@/lib/songs/queries";

export const metadata: Metadata = {
  title: "Artists",
  description: "Tamil indie and I-pop singers, composers and lyricists, with the lyrics of their songs.",
  alternates: { canonical: "/artists" },
};

export default async function ArtistIndexPage() {
  const artists = await getAllArtists();
  const groups = groupByLetter(artists, (artist) => artist.name);

  return (
    <Container className="flex flex-col gap-6 py-10 sm:py-14">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Artists</h1>
        <p className="text-lg text-muted-foreground">Singers, composers and lyricists, A to Z.</p>
      </header>
      {groups.length > 1 && <LetterNav letters={groups.map(([letter]) => letter)} idPrefix="artists" />}
      <div className="flex flex-col gap-10">
        {groups.map(([letter, items]) => (
          <section key={letter} id={`artists-${letter === "#" ? "other" : letter}`} aria-label={letter} className="scroll-mt-16">
            <h2 aria-hidden className="mb-3 text-3xl text-pink">
              {letter}
            </h2>
            <ul className="flex flex-wrap gap-3">
              {items.map((artist) => (
                <li key={artist.slug}>
                  <ArtistChip {...artist} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
