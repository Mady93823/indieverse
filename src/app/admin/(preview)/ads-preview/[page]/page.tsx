import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { AdPlacement } from "@/components/site/ad-placement";
import { ArtistView } from "@/components/site/artist-view";
import { Container } from "@/components/site/container";
import { HomeView } from "@/components/site/home-view";
import { SongView } from "@/components/site/song-view";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings/queries";
import { getSongForAdPreview } from "@/lib/songs/admin-queries";
import { getArtistBySlug, getMoreSongs, getTopArtists } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Ad preview" };

const PAGES = { song: "Song page", home: "Home page", artist: "Artist page" } as const;
type PreviewPage = keyof typeof PAGES;

/**
 * A real page with a numbered box wherever an ad can appear, at the size of a real ad.
 * Nothing is loaded from Google here.
 */
export default async function AdPreviewPage({ params }: PageProps<"/admin/ads-preview/[page]">) {
  await requireAdmin("OWNER");
  const { page } = await params;
  if (!Object.hasOwn(PAGES, page)) notFound();
  const { ads } = await getSettings();

  let content: React.ReactNode;
  let note: string | null = null;
  if (page === "song") {
    const song = await getSongForAdPreview();
    if (!song) {
      content = <Empty>Publish a song to preview ads on a song page.</Empty>;
    } else {
      const verses = song.lyricsTamil.split(/\n{2,}/).length;
      if (verses < 5) note = `Box 5 only appears in songs with 5 or more verses. The longest song so far has ${verses}.`;
      const mainArtist = song.singers[0] ?? song.music[0] ?? null;
      const { byArtist, more } = await getMoreSongs(song.id, mainArtist?.slug ?? null);
      content = (
        <SongView
          song={song}
          more={{ artist: mainArtist, byArtist, others: more }}
          slots={{
            beforeLyrics: <AdPlacement id="songBeforeLyrics" preview className="my-0" />,
            inLyrics: <AdPlacement id="songInLyrics" preview className="mt-0 mb-8" />,
            afterLyrics: <AdPlacement id="songAfterLyrics" preview className="my-0" />,
          }}
        />
      );
    }
  } else if (page === "home") {
    content = <HomeView adPreview />;
  } else {
    const [top] = await getTopArtists(1);
    const artist = top && (await getArtistBySlug(top.slug));
    content = artist ? <ArtistView artist={artist} adPreview /> : <Empty>Publish a song to preview ads on an artist page.</Empty>;
  }

  return (
    <>
      <div className="border-b bg-wine">
        <Container className="flex flex-col gap-3 py-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <p className="mr-auto text-base font-semibold">Where ads appear</p>
            <Button variant="outline" size="sm" asChild className="bg-background">
              <Link href="/admin/ads/settings">
                <ArrowLeftIcon data-icon="inline-start" aria-hidden />
                Back to ad settings
              </Link>
            </Button>
          </div>
          <p>
            The numbered boxes show each place an ad can go, at the size of a real ad. Pink boxes are switched on,
            grey ones are off. No real ads load in this preview.
            {!ads.enabled && " Ads are switched off for the whole site right now, so visitors see none of these."}
            {note && ` ${note}`}
          </p>
          <nav aria-label="Preview page" className="flex flex-wrap gap-1">
            {(Object.keys(PAGES) as PreviewPage[]).map((key) => (
              <Link
                key={key}
                href={`/admin/ads-preview/${key}`}
                aria-current={key === page ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1 font-medium transition-colors",
                  key === page ? "border-transparent bg-foreground text-background" : "bg-background hover:bg-muted",
                )}
              >
                {PAGES[key]}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
      {content}
    </>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-16">
      <p className="text-muted-foreground">{children}</p>
    </Container>
  );
}
