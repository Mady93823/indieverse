import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { Container } from "@/components/site/container";
import { CoverImage } from "@/components/site/cover-image";
import { LyricsReader } from "@/components/site/lyrics-reader";
import { ShareButton } from "@/components/site/share-button";
import { SongShelf } from "@/components/site/song-card";
import { ViewTracker } from "@/components/site/view-tracker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMoreSongs, getSongBySlug, type ArtistLink, type SongCardData, type SongDetail } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/songs/[slug]">): Promise<Metadata> {
  const song = await getSongBySlug((await params).slug);
  if (!song) return { title: "Song not found" };

  const by = song.singers.map((s) => s.name).join(", ");
  const title = `${song.title} Lyrics${by ? ` – ${by}` : ""}`;
  const firstLines = song.lyricsTanglish.split("\n").filter(Boolean).slice(0, 2).join(" / ");
  const description = [song.titleTamil, firstLines].filter(Boolean).join(": ");

  return {
    title,
    description,
    alternates: { canonical: `/songs/${song.slug}` },
    openGraph: {
      title,
      description,
      type: "music.song",
      images: song.coverImage ? [{ url: song.coverImage, width: 800, height: 800 }] : undefined,
    },
  };
}

export default function SongPage({ params }: PageProps<"/songs/[slug]">) {
  return (
    <Suspense fallback={<SongSkeleton />}>
      <SongContent params={params} />
    </Suspense>
  );
}

async function SongContent({ params }: Pick<PageProps<"/songs/[slug]">, "params">) {
  const song = await getSongBySlug((await params).slug);
  if (!song) notFound();

  const mainArtist = song.singers[0] ?? song.music[0] ?? null;
  const { byArtist, more } = await getMoreSongs(song.id, mainArtist?.slug ?? null);
  const links = [
    song.youtubeUrl && { label: "Watch on YouTube", href: song.youtubeUrl },
    song.spotifyUrl && { label: "Listen on Spotify", href: song.spotifyUrl },
  ].filter((link) => !!link);

  return (
    <article>
      {/* The header takes its tint from the cover, so every song page has its own colour. */}
      <header className="song-band" style={{ "--song-color": song.coverColor ?? undefined } as React.CSSProperties}>
        <Container className="grid grid-cols-[7.5rem_1fr] items-end gap-x-5 gap-y-6 pt-8 pb-10 sm:grid-cols-[11rem_1fr] sm:gap-x-8 md:grid-cols-[15rem_1fr] md:pt-12 md:pb-14">
          <CoverImage
            src={song.coverImage}
            alt={`Cover of ${song.title}`}
            sizes="(min-width: 768px) 240px, (min-width: 640px) 176px, 120px"
            priority
            className="song-cover-glow rounded-2xl"
          />
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance break-words sm:text-4xl md:text-5xl">
                {song.title}
              </h1>
              {song.titleTamil && (
                <p lang="ta" className="font-display text-lg text-foreground/75 sm:text-2xl">
                  {song.titleTamil}
                </p>
              )}
            </div>
            <Credits song={song} className="hidden sm:flex" />
          </div>
          <Credits song={song} className="col-span-2 sm:hidden" />
          <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:col-start-2">
            {links.map((link) => (
              <Button key={link.label} variant="outline" size="lg" asChild className="rounded-full bg-card/70">
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <ExternalLinkIcon data-icon="inline-end" aria-hidden />
                </a>
              </Button>
            ))}
            <ShareButton title={song.title} />
          </div>
        </Container>
      </header>

      <Container>
        <section aria-label="Lyrics">
          <LyricsReader tamil={song.lyricsTamil} english={song.lyricsTanglish} />
        </section>
      </Container>

      <Container className="mt-16 flex flex-col gap-14">
        {byArtist.length > 0 && mainArtist && (
          <MoreSection id="more-by-artist" title={`More by ${mainArtist.name}`} href={`/artists/${mainArtist.slug}`} songs={byArtist} />
        )}
        {more.length > 0 && <MoreSection id="more-songs" title="You might also like" songs={more} />}
      </Container>

      <ViewTracker songId={song.id} />
    </article>
  );
}

function Credits({ song, className }: { song: SongDetail; className?: string }) {
  const album = song.album && (song.releaseYear ? `${song.album} (${song.releaseYear})` : song.album);
  return (
    <div className={cn("flex-col gap-1 text-base", className)}>
      <CreditLine label="Sung by" artists={song.singers} />
      <p className="flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground">
        <CreditLine label="Music by" artists={song.music} inline />
        <CreditLine label="Lyrics by" artists={song.lyricists} inline />
      </p>
      {album ? (
        <p className="text-muted-foreground">From the album {album}</p>
      ) : (
        song.releaseYear && <p className="text-muted-foreground">Released in {song.releaseYear}</p>
      )}
    </div>
  );
}

function CreditLine({ label, artists, inline }: { label: string; artists: ArtistLink[]; inline?: boolean }) {
  if (artists.length === 0) return null;
  const Tag = inline ? "span" : "p";
  return (
    <Tag className={inline ? undefined : "font-medium"}>
      {label}{" "}
      {artists.map((artist, i) => (
        <span key={artist.slug}>
          {i > 0 && ", "}
          <Link
            href={`/artists/${artist.slug}`}
            className="text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {artist.name}
          </Link>
        </span>
      ))}
    </Tag>
  );
}

function MoreSection({
  id,
  title,
  href,
  songs,
}: {
  id: string;
  title: string;
  href?: string;
  songs: SongCardData[];
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={id} className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            See all songs
          </Link>
        )}
      </div>
      <SongShelf songs={songs} />
    </section>
  );
}

function SongSkeleton() {
  return (
    <div>
      <div className="bg-muted/60">
        <Container className="grid grid-cols-[7.5rem_1fr] items-end gap-x-5 pt-8 pb-10 sm:grid-cols-[11rem_1fr] sm:gap-x-8 md:grid-cols-[15rem_1fr] md:pt-12 md:pb-14">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </Container>
      </div>
      <Container className="flex max-w-2xl flex-col gap-3 pt-8 sm:max-w-6xl">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-6 max-w-2xl" style={{ width: `${55 + ((i * 17) % 35)}%` }} />
        ))}
      </Container>
    </div>
  );
}
