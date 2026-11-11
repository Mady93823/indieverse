import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { Container } from "@/components/site/container";
import { CoverImage } from "@/components/site/cover-image";
import { LyricsReader } from "@/components/site/lyrics-reader";
import { SectionHeading } from "@/components/site/section-heading";
import { CoverTile } from "@/components/site/song-card";
import { CreditsTable, PlayAndShare, albumLine } from "@/components/site/song-meta";
import { pairLyrics } from "@/lib/lyrics";
import type { ArtistLink, SongCardData, SongDetail } from "@/lib/songs/queries";

/** Ads or other blocks placed around the lyrics. */
export type SongSlots = { beforeLyrics?: React.ReactNode; inLyrics?: React.ReactNode; afterLyrics?: React.ReactNode };

/**
 * A song page's content: the song's details beside its lyrics (Tamil with Tanglish under each line),
 * the About text, then more songs. Used by the public song page and the admin previews.
 */
export function SongView({
  song,
  more,
  slots = {},
}: {
  song: SongDetail;
  more?: { artist: ArtistLink | null; byArtist: SongCardData[]; others: SongCardData[] };
  slots?: SongSlots;
}) {
  const mainArtist = song.singers[0] ?? song.music[0] ?? null;
  const album = albumLine(song);

  return (
    <article>
      <Container className="pt-6 pb-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            {mainArtist && (
              <li className="flex items-center gap-1">
                <ChevronRightIcon className="size-3.5" aria-hidden />
                <Link href={`/artists/${mainArtist.slug}`} className="hover:text-foreground">
                  {mainArtist.name}
                </Link>
              </li>
            )}
            <li className="flex min-w-0 items-center gap-1">
              <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden />
              <span aria-current="page" className="truncate text-foreground">
                {song.title}
              </span>
            </li>
          </ol>
        </nav>

        {/* Compact on phones, so the lyrics start on the first screen. */}
        <header className="mt-5 grid grid-cols-[5.5rem_1fr] items-center gap-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
          <CoverImage
            src={song.coverImage}
            alt={`${song.title} song cover`}
            sizes="(min-width: 640px) 144px, 88px"
            priority
            className="rounded-xl shadow-sm"
          />
          <div className="flex min-w-0 flex-col gap-1">
            {album && <p className="truncate text-sm text-muted-foreground">{album}</p>}
            <h1 className="text-2xl leading-tight font-semibold tracking-tight text-balance break-words sm:text-4xl">
              {song.titleTamil ? (
                <>
                  <span lang="ta" className="block">
                    {song.titleTamil}
                  </span>
                  <span className="mt-0.5 block text-base font-normal text-muted-foreground sm:text-xl">{song.title}</span>
                </>
              ) : (
                song.title
              )}
            </h1>
            <PlayAndShare song={song} className="mt-2 hidden max-w-xs sm:flex" />
          </div>
        </header>
        <PlayAndShare song={song} className="mt-4 sm:hidden" />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-8">
            {slots.beforeLyrics}
            <section aria-label="Lyrics">
              <LyricsReader verses={pairLyrics(song.lyricsTamil, song.lyricsTanglish)} interlude={slots.inLyrics} />
            </section>
            {song.about && (
              <section aria-labelledby="about-song" className="max-w-2xl rounded-2xl bg-maroon p-6">
                <h2 id="about-song" className="text-lg font-semibold">
                  About this song
                </h2>
                {song.about.split(/\n{2,}/).map((paragraph, i) => (
                  <p key={i} className="mt-2 leading-relaxed text-pretty whitespace-pre-line text-foreground/85">
                    {paragraph}
                  </p>
                ))}
              </section>
            )}
            {slots.afterLyrics}
          </div>
          <aside aria-label="Credits" className="self-start rounded-2xl border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="mb-3 font-semibold">Credits</h2>
            <CreditsTable song={song} />
          </aside>
        </div>
      </Container>

      {more && (more.byArtist.length > 0 || more.others.length > 0) && (
        <Container className="flex flex-col gap-12 border-t pt-10 pb-16">
          {more.byArtist.length > 0 && more.artist && (
            <section aria-labelledby="more-by-artist">
              <SectionHeading
                id="more-by-artist"
                title={`More by ${more.artist.name}`}
                href={`/artists/${more.artist.slug}`}
                linkLabel="See all"
              />
              <TileGrid songs={more.byArtist} />
            </section>
          )}
          {more.others.length > 0 && (
            <section aria-labelledby="more-songs">
              <SectionHeading id="more-songs" title="You might also like" />
              <TileGrid songs={more.others} />
            </section>
          )}
        </Container>
      )}
    </article>
  );
}

function TileGrid({ songs }: { songs: SongCardData[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
      {songs.slice(0, 6).map((song) => (
        <li key={song.slug}>
          <CoverTile song={song} />
        </li>
      ))}
    </ul>
  );
}
