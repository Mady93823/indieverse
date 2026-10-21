import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { getCoverColor } from "@/lib/uploads";
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
  coverImage: true,
  credits: {
    where: { role: "SINGER" },
    orderBy: { position: "asc" },
    select: { artist: { select: { name: true } } },
  },
} satisfies Prisma.SongSelect;

export type SongCardData = {
  slug: string;
  title: string;
  titleTamil: string | null;
  coverImage: string | null;
  singers: string[];
};

function toCard(song: Prisma.SongGetPayload<{ select: typeof cardSelect }>): SongCardData {
  return {
    slug: song.slug,
    title: song.title,
    titleTamil: song.titleTamil,
    coverImage: song.coverImage,
    singers: song.credits.map((c) => c.artist.name),
  };
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
  title: string;
  titleTamil: string | null;
  album: string | null;
  releaseYear: number | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  coverImage: string | null;
  lyricsTamil: string;
  lyricsTanglish: string;
  updatedAt: Date;
  /** Main colour of the cover, used to tint the page header. */
  coverColor: string | null;
  singers: ArtistLink[];
  music: ArtistLink[];
  lyricists: ArtistLink[];
};

export async function getSongBySlug(slug: string): Promise<SongDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(SONGS_TAG);

  const song = await db.song.findFirst({
    where: { slug, ...PUBLISHED },
    include: {
      credits: {
        orderBy: { position: "asc" },
        select: { role: true, artist: { select: { name: true, slug: true } } },
      },
    },
  });
  if (!song) return null;

  const byRole = (role: CreditRole) =>
    song.credits.filter((c) => c.role === role).map((c) => c.artist);

  return {
    id: song.id,
    slug: song.slug,
    title: song.title,
    titleTamil: song.titleTamil,
    album: song.album,
    releaseYear: song.releaseYear,
    youtubeUrl: song.youtubeUrl,
    spotifyUrl: song.spotifyUrl,
    coverImage: song.coverImage,
    lyricsTamil: song.lyricsTamil,
    lyricsTanglish: song.lyricsTanglish,
    updatedAt: song.updatedAt,
    coverColor: await getCoverColor(song.coverImage),
    singers: byRole("SINGER"),
    music: byRole("MUSIC"),
    lyricists: byRole("LYRICS"),
  };
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

export type ArtistSummary = { name: string; slug: string; songs: number };

/** Artists with the most published songs. */
export async function getTopArtists(limit = 12): Promise<ArtistSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SONGS_TAG);

  // Counted per song, so an artist who sang and composed the same song counts it once.
  return db.$queryRaw<ArtistSummary[]>`
    SELECT a.name, a.slug, COUNT(DISTINCT c.song_id)::int AS songs
    FROM artists a
    JOIN song_credits c ON c.artist_id = a.id
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
    select: { name: true, slug: true },
  });
}

export type ArtistDetail = {
  name: string;
  slug: string;
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
      credits: {
        where: { song: PUBLISHED },
        orderBy: { song: { publishedAt: "desc" } },
        select: { role: true, song: { select: cardSelect } },
      },
    },
  });
  if (!artist || artist.credits.length === 0) return null;

  // One artist can be singer and composer on the same song: show the song once with both roles.
  const songs = new Map<string, SongCardData & { roles: CreditRole[] }>();
  for (const credit of artist.credits) {
    const existing = songs.get(credit.song.slug);
    if (existing) existing.roles.push(credit.role);
    else songs.set(credit.song.slug, { ...toCard(credit.song), roles: [credit.role] });
  }

  return { name: artist.name, slug: artist.slug, songs: [...songs.values()] };
}

export async function getSitemapData() {
  "use cache";
  cacheLife("hours");
  cacheTag(SONGS_TAG);

  const [songs, artists] = await Promise.all([
    db.song.findMany({ where: PUBLISHED, select: { slug: true, updatedAt: true } }),
    db.artist.findMany({
      where: { credits: { some: { song: PUBLISHED } } },
      select: { slug: true },
    }),
  ]);
  return { songs, artists };
}
