import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { AdPlacement } from "@/components/site/ad-placement";
import { Container } from "@/components/site/container";
import { JsonLd } from "@/components/site/json-ld";
import { SongView } from "@/components/site/song-view";
import { ViewTracker } from "@/components/site/view-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import { findRedirect } from "@/lib/redirects";
import { songJsonLd } from "@/lib/seo/json-ld";
import { getSiteInfo } from "@/lib/seo/site";
import { songSeoDefaults } from "@/lib/seo/song-seo";
import { getSettings } from "@/lib/settings/queries";
import { getMoreSongs, getSongBySlug } from "@/lib/songs/queries";

export async function generateMetadata({ params }: PageProps<"/songs/[slug]">): Promise<Metadata> {
  const [song, { general }] = await Promise.all([getSongBySlug((await params).slug), getSettings()]);
  if (!song) return { title: "Song not found" };

  const auto = songSeoDefaults({
    ...song,
    singers: song.singers.map((a) => a.name),
    music: song.music.map((a) => a.name),
  });
  const title = song.seoTitle || auto.title;
  const description = song.seoDescription || auto.description;

  return {
    title,
    description,
    alternates: { canonical: `/songs/${song.slug}` },
    openGraph: {
      title,
      description,
      siteName: general.siteName,
      type: "music.song",
      url: `/songs/${song.slug}`,
      images: song.shareImage
        ? [{ url: song.shareImage, width: 1200, height: 630 }]
        : song.coverImage
          ? [{ url: song.coverImage, width: 800, height: 800 }]
          : undefined,
    },
    twitter: { card: song.shareImage ? "summary_large_image" : "summary" },
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
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) {
    // The song's address may have changed; old links forward to the new one.
    const moved = await findRedirect(`/songs/${slug}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }

  const mainArtist = song.singers[0] ?? song.music[0] ?? null;
  const [{ byArtist, more }, site] = await Promise.all([
    getMoreSongs(song.id, mainArtist?.slug ?? null),
    getSiteInfo(),
  ]);

  return (
    <>
      <JsonLd data={songJsonLd(song, site)} />
      <SongView
        song={song}
        more={{ artist: mainArtist, byArtist, others: more }}
        slots={
          song.hideAds
            ? undefined
            : {
                beforeLyrics: <AdPlacement id="songBeforeLyrics" className="my-0" />,
                inLyrics: <AdPlacement id="songInLyrics" className="mt-0 mb-8" />,
                afterLyrics: <AdPlacement id="songAfterLyrics" className="my-0" />,
              }
        }
      />
      <ViewTracker songId={song.id} />
    </>
  );
}

function SongSkeleton() {
  return (
    <div>
      <div className="bg-muted/60">
        <Container className="grid grid-cols-[7.5rem_1fr] items-end gap-x-5 pt-14 pb-10 sm:grid-cols-[11rem_1fr] sm:gap-x-8 md:grid-cols-[15rem_1fr] md:pt-16 md:pb-14">
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
