import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { CreditRole, Prisma } from "@/generated/prisma/client";

// Every public read is tagged with this, and every admin change clears it,
// so a published or edited song shows up on the site immediately.
export const SONGS_TAG = "songs";

const PUBLISHED = { status: "PUBLISHED" } as const;

const cardSelect = {
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
    singers: byRole("SINGER"),
    music: byRole("MUSIC"),
    lyricists: byRole("LYRICS"),
  };
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
