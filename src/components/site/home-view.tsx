import Image from "next/image";
import Link from "next/link";
import { ArrowDownIcon, SearchIcon } from "lucide-react";
import { AdPlacement } from "@/components/site/ad-placement";
import { ArtistCard } from "@/components/site/artist-card";
import { ArtistChip } from "@/components/site/artist-chip";
import { Container } from "@/components/site/container";
import { CoverImage } from "@/components/site/cover-image";
import { DecadeGrid, periods } from "@/components/site/decades";
import { JsonLd } from "@/components/site/json-ld";
import { LyricLines } from "@/components/site/lyrics-reader";
import { LyricsModeToggle } from "@/components/site/lyrics-mode";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { Band, SectionHeading } from "@/components/site/section-heading";
import { CoverTile, RankCard } from "@/components/site/song-card";
import { CreditsTable, PlayAndShare, albumLine } from "@/components/site/song-meta";
import { brandImageUrl } from "@/lib/brand";
import { countLines, pairLyrics } from "@/lib/lyrics";
import { siteJsonLd } from "@/lib/seo/json-ld";
import { getSiteInfo } from "@/lib/seo/site";
import { getSettings } from "@/lib/settings/queries";
import {
  getArtistsByRole,
  getCurrentYear,
  getDecades,
  getPopularSongs,
  getRecentSongs,
  getSpotlightSong,
  getTrendingSongs,
  type ArtistSummary,
  type DecadeSummary,
} from "@/lib/songs/queries";
import { cn } from "@/lib/utils";
import defaultHero from "../../../public/Neon Lights Over a Rock Concert.png";

const SPOTLIGHT_LINES = 6;
/** Phones show this many of the latest covers; wider screens show them all. */
const LATEST_ON_PHONES = 6;

/**
 * The home page: search first, then the newest covers, the charts, a lyrics reader, decades,
 * lyricists and the newsletter. Sections without enough content are left out rather than shown half empty.
 * `adPreview` shows numbered boxes where ads go (the admin's ad preview).
 * Every list comes from a cached query, so the page is prerendered and refreshes
 * when an admin publishes or edits a song.
 */
export async function HomeView({ adPreview = false }: { adPreview?: boolean }) {
  const [latest, trending, popular, spotlight, lyricists, decades, year, settings, site] = await Promise.all([
    getRecentSongs(12),
    getTrendingSongs(5),
    getPopularSongs(5),
    getSpotlightSong(),
    getArtistsByRole("LYRICS", 8),
    getDecades(),
    getCurrentYear(),
    getSettings(),
    getSiteInfo(),
  ]);
  const { home, branding } = settings;

  // The admin's own "Popular" searches, or the two most-read songs and the top two lyricists.
  const custom = home.trySearches.split(",").map((q) => q.trim()).filter(Boolean);
  const chips =
    custom.length > 0
      ? custom.map((q) => ({ label: q, href: `/search?q=${encodeURIComponent(q)}` }))
      : [
          ...popular.slice(0, 2).map((song) => ({ label: song.title, href: `/songs/${song.slug}` })),
          ...lyricists.slice(0, 2).map((artist) => ({ label: artist.name, href: `/artists/${artist.slug}` })),
        ];

  return (
    <>
      <JsonLd data={siteJsonLd(site)} />

      <section aria-labelledby="hero-heading">
        <Container className="grid items-center gap-10 pt-10 pb-12 sm:pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:pb-16">
          <div className="flex flex-col gap-5">
            {home.eyebrow && <p className="eyebrow">{home.eyebrow}</p>}
            <h1 id="hero-heading" className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
              {home.headline}
            </h1>
            {home.intro && <p className="max-w-xl text-lg text-pretty text-muted-foreground">{home.intro}</p>}
            <form
              action="/search"
              role="search"
              className="mt-1 flex max-w-xl items-center gap-2 rounded-full border bg-card p-1.5 pl-5 shadow-sm transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30"
            >
              <SearchIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <label htmlFor="hero-search" className="sr-only">
                Search songs, films, singers or lyricists
              </label>
              <input
                id="hero-search"
                type="search"
                name="q"
                placeholder="Song, film, singer or lyricist"
                autoComplete="off"
                enterKeyHint="search"
                className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-[background-color,scale] outline-none hover:bg-[#c4234d] focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]"
              >
                Search
              </button>
            </form>
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Popular:</span>
                {chips.map((chip) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className="rounded-full border bg-card px-3.5 py-1.5 font-medium transition-colors hover:border-foreground/25"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-3xl shadow-lg lg:block">
            {branding.hero ? (
              <Image src={brandImageUrl("hero", branding.hero.id)} alt="" fill preload sizes="45vw" className="object-cover" />
            ) : (
              <Image src={defaultHero} alt="" fill preload placeholder="blur" sizes="45vw" className="object-cover" />
            )}
          </div>
        </Container>
      </section>

      {latest.length === 0 ? (
        <Container className="pb-16">
          <p className="font-medium">No songs yet</p>
          <p className="text-muted-foreground">New lyrics appear here as soon as they’re published.</p>
        </Container>
      ) : (
        <>
          <Band labelledBy="latest-heading" className="pt-0 sm:pt-0">
            <Container>
              <SectionHeading id="latest-heading" title="Latest lyrics" href="/latest" linkLabel="View all" />
              <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
                {latest.map((song, i) => (
                  <li key={song.slug} className={cn(i >= LATEST_ON_PHONES && "hidden sm:block")}>
                    <CoverTile song={song} />
                  </li>
                ))}
              </ul>
            </Container>
          </Band>

          <Band labelledBy="charts-heading" className="border-y bg-card">
            <Container>
              <h2 id="charts-heading" className="sr-only">
                Charts
              </h2>
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                <Chart id="trending-heading" title="Trending this week" href="/trending" linkLabel="See all" songs={trending} />
                <Chart id="popular-heading" title="All-time popular" href="/popular" linkLabel="Top 100" songs={popular} />
              </div>
            </Container>
          </Band>

          <AdPlacement
            id="homeBetweenShelves"
            preview={adPreview}
            className="mx-auto mt-10 mb-0 w-full max-w-[1440px] px-4 sm:px-8 lg:px-[72px]"
          />

          {spotlight && <Spotlight song={spotlight} />}

          <DecadesBand decades={decades} year={year} />

          <LyricistsBand lyricists={lyricists} />
        </>
      )}

      {home.showNewsletter && (
        <section aria-labelledby="newsletter-heading" className="bg-wine">
          <Container className="grid items-center gap-6 py-12 sm:py-14 lg:grid-cols-[1fr_460px] lg:gap-16">
            <div className="flex flex-col gap-2">
              <h2 id="newsletter-heading" className="max-w-xl text-2xl font-semibold tracking-tight text-balance">
                {home.newsletterTitle}
              </h2>
              {home.newsletterText && <p className="max-w-2xl text-muted-foreground">{home.newsletterText}</p>}
            </div>
            <NewsletterForm />
          </Container>
        </section>
      )}
    </>
  );
}

function Chart({
  id,
  title,
  href,
  linkLabel,
  songs,
}: {
  id: string;
  title: string;
  href: string;
  linkLabel: string;
  songs: Awaited<ReturnType<typeof getPopularSongs>>;
}) {
  return (
    <section aria-labelledby={id}>
      <SectionHeading id={id} title={title} href={href} linkLabel={linkLabel} />
      {songs.length === 0 ? (
        <p className="text-muted-foreground">Songs appear here once people start reading them.</p>
      ) : (
        <ol className="flex flex-col">
          {songs.map((song, i) => (
            <li key={song.slug}>
              <RankCard song={song} rank={i + 1} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** One song's opening lines, with Tamil and Tanglish line by line. */
function Spotlight({ song }: { song: NonNullable<Awaited<ReturnType<typeof getSpotlightSong>>> }) {
  const verses = pairLyrics(song.lyricsTamil, song.lyricsTanglish);
  const total = countLines(verses);
  const href = `/songs/${song.slug}`;
  return (
    <Band labelledBy="spotlight-heading">
      <Container>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <SectionHeading id="spotlight-heading" title="Read along" className="mb-0" />
          <LyricsModeToggle />
        </div>
        <div className="grid overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-[340px_1fr]">
          <div className="flex flex-col gap-5 border-b bg-maroon p-6 lg:border-r lg:border-b-0">
            <div className="grid grid-cols-[6rem_1fr] items-center gap-4 lg:grid-cols-1">
              <Link href={href} className="block rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <CoverImage src={song.coverImage} alt={`${song.title} song cover`} sizes="(min-width: 1024px) 290px, 96px" className="rounded-2xl" />
              </Link>
              <div className="flex min-w-0 flex-col gap-0.5">
                {albumLine(song) && <p className="text-sm text-muted-foreground">{albumLine(song)}</p>}
                <h3 className="text-2xl leading-tight font-semibold text-balance">
                  <Link href={href} className="hover:text-pink">
                    {song.titleTamil ? <span lang="ta">{song.titleTamil}</span> : song.title}
                  </Link>
                </h3>
                {song.titleTamil && <p className="text-muted-foreground">{song.title}</p>}
              </div>
            </div>
            <CreditsTable song={song} />
            <PlayAndShare song={song} shareUrl={href} />
          </div>
          <div className="flex flex-col p-6 sm:p-10">
            <LyricLines
              verses={verses}
              maxLines={SPOTLIGHT_LINES}
              highlightFirst
              className="text-xl sm:text-2xl"
              meta={<span className="tabular-nums">{Math.min(SPOTLIGHT_LINES, total)} of {total} lines</span>}
            />
            <Link href={href} className="mt-2 inline-flex items-center gap-1 self-start font-medium text-pink hover:underline hover:underline-offset-4">
              Read the full lyrics
              <ArrowDownIcon className="size-4 -rotate-90" aria-hidden />
            </Link>
          </div>
        </div>
      </Container>
    </Band>
  );
}

/** Browse by year, once at least two decades have songs. Empty decades are left out. */
function DecadesBand({ decades, year }: { decades: DecadeSummary[]; year: number }) {
  const shown = periods(decades, year);
  if (shown.length < 2) return null;
  return (
    <Band labelledBy="decades-heading" className="pt-0 sm:pt-0">
      <Container>
        <SectionHeading id="decades-heading" title="Browse by year" href="/decades" linkLabel="All decades" />
        <DecadeGrid decades={decades} year={year} />
      </Container>
    </Band>
  );
}

const PHOTO_CARDS = 4;

/** Lyricists with photos get photo cards; without enough photos, a row of name chips. */
function LyricistsBand({ lyricists }: { lyricists: ArtistSummary[] }) {
  if (lyricists.length === 0) return null;
  const withPhotos = lyricists.filter((artist) => artist.photo).slice(0, PHOTO_CARDS);
  return (
    <Band labelledBy="lyricists-heading" className="pt-0 sm:pt-0">
      <Container>
        <SectionHeading id="lyricists-heading" title="Lyricists" href="/lyricists" linkLabel="All lyricists" />
        {withPhotos.length >= 2 ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
            {withPhotos.map((artist) => (
              <li key={artist.slug}>
                <ArtistCard artist={artist} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {lyricists.map((artist) => (
              <li key={artist.slug}>
                <ArtistChip {...artist} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Band>
  );
}
