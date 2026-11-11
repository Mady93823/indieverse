import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { LetterNav } from "@/components/site/letter-nav";
import { groupByLetter } from "@/lib/alphabet";
import { getSongIndex } from "@/lib/songs/queries";

export const metadata: Metadata = {
  title: "All Song Lyrics A–Z",
  description: "Every Tamil indie and I-pop song on the site, A to Z, with lyrics in Tamil and in English letters.",
  alternates: { canonical: "/songs" },
};

// Every song is one click from here, which also helps search engines find them all.
export default async function SongIndexPage() {
  const songs = await getSongIndex();
  const groups = groupByLetter(songs, (song) => song.title);

  return (
    <Container className="flex flex-col gap-6 py-10 sm:py-14">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All songs</h1>
        <p className="text-lg text-muted-foreground">
          {songs.length} {songs.length === 1 ? "song" : "songs"}, A to Z. <span lang="ta">பாடல் வரிகள்</span> in Tamil and
          English letters.
        </p>
      </header>
      {groups.length > 1 && <LetterNav letters={groups.map(([letter]) => letter)} idPrefix="songs" />}
      <div className="flex flex-col gap-10">
        {groups.map(([letter, items]) => (
          <section key={letter} id={`songs-${letter === "#" ? "other" : letter}`} aria-label={letter} className="scroll-mt-16">
            <h2 aria-hidden className="mb-3 text-3xl text-pink">
              {letter}
            </h2>
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((song) => (
                <li key={song.slug}>
                  <Link href={`/songs/${song.slug}`} className="-mx-2 flex flex-col rounded-lg px-2 py-2 transition-colors hover:bg-muted">
                    <span className="font-semibold">{song.title}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {song.titleTamil && (
                        <span lang="ta" className="mr-2">
                          {song.titleTamil}
                        </span>
                      )}
                      {song.singers.join(", ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
