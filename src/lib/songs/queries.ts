import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { findShareImage } from "@/lib/uploads";
import type { CreditRole, Prisma } from "@/generated/prisma/client";

// Every public read is tagged with this, and every admin change clears it,
// so a published or edited song shows up on the site immediately.
export const SONGS_TAG = "songs";

const PUBLISHED = { status: "PUBLISHED" } as const;

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  titleTamil: true,
  album: true,
  releaseYear: true,
  coverImage: true,
  credits: {
    where: { role: { in: ["SINGER", "MUSIC"] } },
    orderBy: { position: "asc" },
    select: { role: true, artist: { select: { name: true } } },
  },
} satisfies Prisma.SongSelect;

export type SongCardData = {
  slug: string;
  title: string;
  titleTamil: string | null;
  album: string | null;
  releaseYear: number | null;
  coverImage: string | null;
  singers: string[];
  /** Composers. */
  music: string[];
};

function toCard(song: Prisma.SongGetPayload<{ select: typeof cardSelect }>): SongCardData {
  const names = (role: CreditRole) => song.credits.filter((c) => c.role === role).map((c) => c.artist.name);
  return {
    slug: song.slug,
    title: song.title,
    titleTamil: song.titleTamil,
    album: song.album,
    releaseYear: song.releaseYear,
    coverImage: song.coverImage,
    singers: names("SINGER"),
    music: names("MUSIC"),
  };
}

/** The year now, for the "this year" decade tile and the footer. Refreshes daily. */
export async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function getRecentSongs(limit = 12) {
  "use cache";
  cacheLife("days");
  cacheTag(SONGS_TAG);

  const songs = await db.song.findMany({
    where: PUBLISHED,
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return songs.map(toCard);
}

export async function getPopularSongs(limit = 8) {
  "use cache";
  // View counts change without admin edits, so this list also refreshes on its own every hour.
  cacheLife("hours");
  cacheTag(SONGS_TAG);

  const songs = await db.song.findMany({
    where: { ...PUBLISHED, views: { gt: 0 } },
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
  return songs.map(toCard);
}

/**
 * Most read in the last 7 days. Before there are enough recent reads (a new site),
 * the all-time most read fill the list.
 */
export async function getTrendingSongs(limit = 5) {
  "use cache";
  cacheLife("hours");
  cacheTag(SONGS_TAG);

  const recent = await db.$queryRaw<{ song_id: number }[]>`
    SELECT d.song_id FROM song_daily_views d
    JOIN songs s ON s.id = d.song_id AND s.status = 'PUBLISHED'
    WHERE d.day >= CURRENT_DATE - 6
    GROUP BY d.song_id
    ORDER BY SUM(d.views) DESC
    LIMIT ${limit}`;
  const ids = recent.map((r) => r.song_id);
  const [trending, fill] = await Promise.all([
    db.song.findMany({ where: { id: { in: ids } }, select: cardSelect }),
    ids.length < limit
      ? db.song.findMany({
          where: { ...PUBLISHED, id: { notIn: ids } },
          orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
          take: limit - ids.length,
          select: cardSelect,
        })
      : [],
  ]);
  return [...ids.map((id) => trending.find((song) => song.id === id)!).filter(Boolean), ...fill].map(toCard);
}

/** The song shown in the home page's lyrics reader: the newest featured song, or the most read. */
export async function getSpotlightSong(): Promise<SongDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(SONGS_TAG);

  const song = await db.song.findFirst({
    where: { ...PUBLISHED, lyricsTamil: { not: "" } },
    orderBy: [{ featured: "desc" }, { views: "desc" }, { publishedAt: "desc" }],
    include: songDetailInclude,
  });
  return song ? toSongDetail(song) : null;
}

export type DecadeSummary = { decade: number; songs: number };

/** How many published songs each decade has, from the release year. */
export async function getDecades(): Promise<DecadeSummary[]> {
  "use cache";
  cacheLife("days");
  cacheTag(SONGS_TAG);

  return db.$queryRaw<DecadeSummary[]>`
    SELECT (release_year / 10) * 10 AS decade, COUNT(*)::int AS songs
    FROM songs
    WHERE status = 'PUBLISHED' AND release_year IS NOT NULL
    GROUP BY 1
    ORDER BY 1`;
}

/** Published songs released between two years (inclusive), newest first. */
export async function getSongsByYears(from: number, to: number) {
  "use cache";
  cacheLife("days");
  cacheTag(SONGS_TAG);

  const songs = await db.song.findMany({
    where: { ...PUBLISHED, releaseYear: { gte: from, lte: to } },
    orderBy: [{ releaseYear: "desc" }, { views: "desc" }],
    select: cardSelect,
  });
  return songs.map(toCard);
}

/** Every published song A–Z, for the /songs index. */
export async function getSongIndex() {
  "use cache";
  cacheLife("days");
  cacheTag(SONGS_TAG);

  const songs = await db.song.findMany({ where: PUBLISHED, orderBy: { title: "asc" }, select: cardSelect });
  return songs.map(toCard);
}

/** Matches song titles (English or Tamil letters), album names and any credited artist. */
export async function searchSongs(rawQuery: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(SONGS_TAG);

  const q = rawQuery.trim().replace(/\s+/g, " ").slice(0, 100);
  if (!q) return [];

  const contains = { contains: q, mode: "insensitive" } as const;
  const songs = await db.song.findMany({
    where: {
      ...PUBLISHED,
      OR: [
        { title: contains },
        { titleTamil: contains },
        { album: contains },
        { credits: { some: { artist: { name: contains } } } },
      ],
    },
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take: 40,
    select: cardSelect,
  });
  return songs.map(toCard);
}

export type ArtistLink = { name: string; slug: string };

export type SongDetail = {
  id: number;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  title: string;
  titleTamil: string | null;
  album: string | null;
  releaseYear: number | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  coverImage: string | null;
  lyricsTamil: string;
  lyricsTanglish: string;
  about: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  hideAds: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  /** A 1200×630 version of the cover for link previews. */
  shareImage: string | null;
  singers: ArtistLink[];
  music: ArtistLink[];
  lyricists: ArtistLink[];
};

export const songDetailInclude = {
  credits: {
    orderBy: { position: "asc" },
    select: { role: true, artist: { select: { name: true, slug: true } } },
  },
} satisfies Prisma.SongInclude;

/** Shapes a song for the song page. Also used by the admin preview, which shows drafts. */
export async function toSongDetail(song: Prisma.SongGetPayload<{ include: typeof songDetailInclude }>): Promise<SongDetail> {
  const byRole = (role: CreditRole) => song.credits.filter((c) => c.role === role).map((c) => c.artist);
  return {
    id: song.id,
    slug: song.slug,
    status: song.status,
    title: song.title,
    titleTamil: song.titleTamil,
    album: song.album,
    releaseYear: song.releaseYear,
    youtubeUrl: song.youtubeUrl,
    spotifyUrl: song.spotifyUrl,
    coverImage: song.coverImage,
    lyricsTamil: song.lyricsTamil,
    lyricsTanglish: song.lyricsTanglish,
    about: song.about,
    seoTitle: song.seoTitle,
    seoDescription: song.seoDescription,
    hideAds: song.hideAds,
    publishedAt: song.publishedAt,
    updatedAt: song.updatedAt,
    shareImage: findShareImage(song.coverImage),
    singers: byRole("SINGER"),
    music: byRole("MUSIC"),
    lyricists: byRole("LYRICS"),
  };
}

export async function getSongBySlug(slug: string): Promise<SongDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(SONGS_TAG);

  const song = await db.song.findFirst({ where: { slug, ...PUBLISHED }, include: songDetailInclude });
  return song ? toSongDetail(song) : null;
}

/**
 * Suggestions for the end of a song page: other songs by the same artist,
 * then the most-read songs the reader hasn't just seen.
 */
export async function getMoreSongs(songId: number, artistSlug: string | null) {
  "use cache";
  cacheLife("hours");
  cacheTag(SONGS_TAG);

  const byArtist = artistSlug
    ? await db.song.findMany({
        where: { ...PUBLISHED, id: { not: songId }, credits: { some: { artist: { slug: artistSlug } } } },
        orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
        take: 6,
        select: cardSelect,
      })
    : [];
  const more = await db.song.findMany({
    where: { ...PUBLISHED, id: { notIn: [songId, ...byArtist.map((s) => s.id)] } },
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take: 6,
    select: cardSelect,
  });
  return { byArtist: byArtist.map(toCard), more: more.map(toCard) };
}

export type ArtistSummary = { name: string; slug: string; photo: string | null; songs: number };

/** Artists with the most published songs. */
export async function getTopArtists(limit = 12): Promise<ArtistSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SONGS_TAG);

  return (await getAllArtists()).toSorted((a, b) => b.songs - a.songs || a.name.localeCompare(b.name)).slice(0, limit);
}

/** Every artist with a published song, A–Z, with their song counts. */
export async function getAllArtists(): Promise<ArtistSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SONGS_TAG);

  // Counted per song, so an artist who sang and composed the same song counts it once.
  return db.$queryRaw<ArtistSummary[]>`
    SELECT a.name, a.slug, a.photo, COUNT(DISTINCT c.song_id)::int AS songs
    FROM artists a
    JOIN song_credits c ON c.artist_id = a.id
    JOIN songs s ON s.id = c.song_id
    WHERE s.status = 'PUBLISHED'
    GROUP BY a.id
    ORDER BY a.name ASC`;
}

/** Artists credited in one role (lyricists, composers), most songs first. */
export async function getArtistsByRole(role: CreditRole, limit = 500): Promise<ArtistSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SONGS_TAG);

  return db.$queryRaw<ArtistSummary[]>`
    SELECT a.name, a.slug, a.photo, COUNT(DISTINCT c.song_id)::int AS songs
    FROM artists a
    JOIN song_credits c ON c.artist_id = a.id AND c.role = ${role}::"CreditRole"
    JOIN songs s ON s.id = c.song_id
    WHERE s.status = 'PUBLISHED'
    GROUP BY a.id
    ORDER BY songs DESC, a.name ASC
    LIMIT ${limit}`;
}

export async function searchArtists(rawQuery: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(SONGS_TAG);

  const q = rawQuery.trim().replace(/\s+/g, " ").slice(0, 100);
  if (!q) return [];
  return db.artist.findMany({
    where: { name: { contains: q, mode: "insensitive" }, credits: { some: { song: PUBLISHED } } },
    orderBy: { name: "asc" },
    take: 8,
    select: { name: true, slug: true, photo: true },
  });
}

export type ArtistDetail = {
  name: string;
  slug: string;
  nameTamil: string | null;
  bio: string | null;
  photo: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  updatedAt: Date;
  songs: (SongCardData & { roles: CreditRole[] })[];
};

/** Returns null when the artist has no published songs, so draft-only artists stay hidden. */
export async function getArtistBySlug(slug: string): Promise<ArtistDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(SONGS_TAG);

  const artist = await db.artist.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      nameTamil: true,
      bio: true,
      photo: true,
      instagramUrl: true,
      youtubeUrl: true,
      spotifyUrl: true,
      updatedAt: true,
      credits: {
        where: { song: PUBLISHED },
        orderBy: { song: { publishedAt: "desc" } },
        select: { role: true, song: { select: cardSelect } },
      },
    },
  });
  if (!artist || artist.credits.length === 0) return null;
  const { credits, ...profile } = artist;

  // One artist can be singer and composer on the same song: show the song once with both roles.
  const songs = new Map<string, SongCardData & { roles: CreditRole[] }>();
  for (const credit of credits) {
    const existing = songs.get(credit.song.slug);
    if (existing) existing.roles.push(credit.role);
    else songs.set(credit.song.slug, { ...toCard(credit.song), roles: [credit.role] });
  }

  return { ...profile, songs: [...songs.values()] };
}

export async function getSitemapData() {
  "use cache";
  cacheLife("hours");
  cacheTag(SONGS_TAG);

  const [songs, artists] = await Promise.all([
    db.song.findMany({ where: PUBLISHED, select: { slug: true, updatedAt: true, coverImage: true } }),
    db.artist.findMany({
      where: { credits: { some: { song: PUBLISHED } } },
      select: {
        slug: true,
        updatedAt: true,
        photo: true,
        credits: {
          where: { song: PUBLISHED },
          orderBy: { song: { updatedAt: "desc" } },
          take: 1,
          select: { song: { select: { updatedAt: true } } },
        },
      },
    }),
  ]);
  return {
    songs,
    // An artist page changes when the artist or one of their songs does.
    artists: artists.map(({ credits, updatedAt, ...artist }) => {
      const songUpdated = credits[0]?.song.updatedAt;
      return { ...artist, updatedAt: songUpdated && songUpdated > updatedAt ? songUpdated : updatedAt };
    }),
  };
}
