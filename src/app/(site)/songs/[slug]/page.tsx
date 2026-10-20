import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { CoverImage } from "@/components/site/cover-image";
import { LyricsToggle } from "@/components/site/lyrics-toggle";
import { ViewTracker } from "@/components/site/view-tracker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSongBySlug, type ArtistLink } from "@/lib/songs/queries";

export async function generateMetadata({ params }: PageProps<"/songs/[slug]">): Promise<Metadata> {
  const song = await getSongBySlug((await params).slug);
  if (!song) return { title: "Song not found" };

  const by = song.singers.map((s) => s.name).join(", ");
  const title = `${song.title} Lyrics${by ? ` – ${by}` : ""}`;
  const firstLines = song.lyricsTanglish.split("\n").filter(Boolean).slice(0, 2).join(" / ");
  const description = [song.titleTamil, firstLines].filter(Boolean).join(" · ");

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

  const links = [
    song.youtubeUrl && { label: "YouTube", href: song.youtubeUrl },
    song.spotifyUrl && { label: "Spotify", href: song.spotifyUrl },
  ].filter((link) => !!link);

  return (
    <article className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-8 sm:grid-cols-[10rem_1fr] md:grid-cols-[260px_1fr] md:gap-x-10">
      <div className="self-start md:sticky md:top-24 md:row-span-2">
        <CoverImage
          src={song.coverImage}
          alt={`${song.title} cover`}
          sizes="(min-width: 768px) 260px, 10rem"
          priority
        />
      </div>

      <header className="space-y-3 self-center md:self-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {song.title}
          </h1>
          {song.titleTamil && (
            <p lang="ta" className="mt-1 text-lg text-muted-foreground">
              {song.titleTamil}
            </p>
          )}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <Credit label="Singers" artists={song.singers} />
          <Credit label="Music" artists={song.music} />
          <Credit label="Lyrics" artists={song.lyricists} />
          {song.album && <Detail label="Album">{song.album}</Detail>}
          {song.releaseYear && <Detail label="Year">{song.releaseYear}</Detail>}
        </dl>
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Button key={link.label} variant="outline" size="sm" asChild>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <ExternalLinkIcon data-icon="inline-end" aria-hidden />
                </a>
              </Button>
            ))}
          </div>
        )}
      </header>

      <section className="col-span-2 md:col-span-1 md:col-start-2" aria-label="Lyrics">
        <LyricsToggle tamil={song.lyricsTamil} english={song.lyricsTanglish} />
      </section>

      <ViewTracker songId={song.id} />
    </article>
  );
}

function Credit({ label, artists }: { label: string; artists: ArtistLink[] }) {
  if (artists.length === 0) return null;
  return (
    <Detail label={label}>
      {artists.map((artist, i) => (
        <span key={artist.slug}>
          {i > 0 && ", "}
          <Link href={`/artists/${artist.slug}`} className="underline-offset-4 hover:underline">
            {artist.name}
          </Link>
        </span>
      ))}
    </Detail>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

function SongSkeleton() {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-8 sm:grid-cols-[10rem_1fr] md:grid-cols-[260px_1fr] md:gap-x-10">
      <Skeleton className="aspect-square rounded-xl md:row-span-2" />
      <div className="space-y-3 self-center">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <div className="col-span-2 space-y-3 md:col-span-1 md:col-start-2">
        <Skeleton className="h-11 w-full max-w-xs" />
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-5" style={{ width: `${60 + ((i * 17) % 35)}%` }} />
        ))}
      </div>
    </div>
  );
}
