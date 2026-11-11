import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { ArtistView } from "@/components/site/artist-view";
import { Container } from "@/components/site/container";
import { JsonLd } from "@/components/site/json-ld";
import { Skeleton } from "@/components/ui/skeleton";
import { findRedirect } from "@/lib/redirects";
import { artistJsonLd } from "@/lib/seo/json-ld";
import { getSiteInfo } from "@/lib/seo/site";
import { getArtistBySlug } from "@/lib/songs/queries";

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

export async function generateMetadata({ params }: PageProps<"/artists/[slug]">): Promise<Metadata> {
  const artist = await getArtistBySlug((await params).slug);
  if (!artist) return { title: "Artist not found" };

  const name = artist.nameTamil ? `${artist.name} (${artist.nameTamil})` : artist.name;
  const titles = artist.songs.slice(0, 3).map((song) => song.title);
  const description = artist.bio
    ? truncate(artist.bio.replace(/\s+/g, " "), 160)
    : `Lyrics of ${artist.songs.length} ${artist.songs.length === 1 ? "song" : "songs"} by ${name} in Tamil and English, including ${listFormat.format(titles)}.`;

  return {
    title: `${name} Songs Lyrics`,
    description,
    alternates: { canonical: `/artists/${artist.slug}` },
    openGraph: {
      title: `${name} Songs Lyrics`,
      description,
      type: "profile",
      url: `/artists/${artist.slug}`,
      images: artist.photo ? [{ url: artist.photo, width: 480, height: 480 }] : undefined,
    },
  };
}

export default function ArtistPage({ params }: PageProps<"/artists/[slug]">) {
  return (
    <Suspense fallback={<ArtistSkeleton />}>
      <ArtistContent params={params} />
    </Suspense>
  );
}

async function ArtistContent({ params }: Pick<PageProps<"/artists/[slug]">, "params">) {
  const { slug } = await params;
  const [artist, site] = await Promise.all([getArtistBySlug(slug), getSiteInfo()]);
  if (!artist) {
    // Renamed or merged artists forward to their current page.
    const moved = await findRedirect(`/artists/${slug}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }

  return (
    <>
      <JsonLd data={artistJsonLd(artist, site)} />
      <ArtistView artist={artist} />
    </>
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function ArtistSkeleton() {
  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <div className="flex items-center gap-5">
        <Skeleton className="size-20 rounded-full sm:size-24" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <div className="flex max-w-2xl flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </Container>
  );
}
