import Link from "next/link";
import { ArtistChip } from "@/components/site/artist-chip";
import { Container } from "@/components/site/container";
import { SearchBox } from "@/components/site/search-box";
import { SongRow, SongShelf } from "@/components/site/song-card";
import { getPopularSongs, getRecentSongs, getTopArtists } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

// Every list here comes from a cached query, so the page is prerendered and refreshes
// when an admin publishes or edits a song.
export default async function HomePage() {
  const [recent, popular, artists] = await Promise.all([
    getRecentSongs(6),
    getPopularSongs(5),
    getTopArtists(10),
  ]);
  const suggestions = [
    ...popular.slice(0, 2).map((song) => ({ label: song.title, href: `/songs/${song.slug}` })),
    ...artists.slice(0, 2).map((artist) => ({ label: artist.name, href: `/artists/${artist.slug}` })),
  ];

  return (
    <>
      <Container className="flex flex-col gap-6 py-14 sm:py-20">
        <h1 className="flex max-w-4xl flex-col gap-3">
          <span lang="ta" className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[1.15] font-semibold text-balance">
            பாட்டு வரிகள், உங்கள் மொழியில்
          </span>
          <span className="max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
            Lyrics for Tamil indie and I-pop songs. Read them in Tamil script or in English letters.
          </span>
        </h1>
        <SearchBox size="lg" className="max-w-2xl" />
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Try</span>
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-full border bg-card px-3.5 py-1.5 font-medium transition-colors outline-none hover:border-foreground/25 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {s.label}
              </Link>
            ))}
          </div>
        )}
      </Container>

      {recent.length === 0 ? (
        <Container>
          <p className="text-muted-foreground">No songs yet. New lyrics will appear here as soon as they’re published.</p>
        </Container>
      ) : (
        <div className="flex flex-col gap-16">
          <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {popular.length > 0 && (
              <section aria-labelledby="popular-heading" className="flex min-w-0 flex-col gap-4 lg:col-span-4">
                <SectionHeading id="popular-heading">Most read</SectionHeading>
                <ol className="flex flex-col gap-1">
                  {popular.map((song, i) => (
                    <li key={song.slug}>
                      <SongRow song={song} rank={i + 1} />
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <section
              aria-labelledby="recent-heading"
              className={cn("flex min-w-0 flex-col gap-4", popular.length > 0 ? "lg:col-span-8" : "lg:col-span-12")}
            >
              <SectionHeading id="recent-heading">Just added</SectionHeading>
              <SongShelf songs={recent} columns={popular.length > 0 ? 3 : 6} />
            </section>
          </Container>

          {artists.length > 0 && (
            <Container>
              <section aria-labelledby="artists-heading" className="flex flex-col gap-4">
                <SectionHeading id="artists-heading">Artists</SectionHeading>
                <ul className="flex flex-wrap gap-3">
                  {artists.map((artist) => (
                    <li key={artist.slug}>
                      <ArtistChip {...artist} />
                    </li>
                  ))}
                </ul>
              </section>
            </Container>
          )}
        </div>
      )}
    </>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}
