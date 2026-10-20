import "server-only";
import { db } from "@/lib/db";
import type { CreditRole } from "@/generated/prisma/client";

// Admin reads are never cached: the panel always shows the current state.

export async function listSongsForAdmin(rawQuery: string) {
  const q = rawQuery.trim().slice(0, 100);
  const contains = { contains: q, mode: "insensitive" } as const;

  const songs = await db.song.findMany({
    where: q
      ? {
          OR: [
            { title: contains },
            { titleTamil: contains },
            { credits: { some: { artist: { name: contains } } } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      slug: true,
      title: true,
      titleTamil: true,
      coverImage: true,
      status: true,
      views: true,
      updatedAt: true,
      credits: {
        where: { role: "SINGER" },
        orderBy: { position: "asc" },
        select: { artist: { select: { name: true } } },
      },
    },
  });

  return songs.map(({ credits, ...song }) => ({
    ...song,
    singers: credits.map((c) => c.artist.name),
  }));
}

export type SongFormValues = {
  id: number;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  title: string;
  titleTamil: string;
  singers: string;
  music: string;
  lyricists: string;
  album: string;
  releaseYear: string;
  youtubeUrl: string;
  spotifyUrl: string;
  coverImage: string | null;
  lyricsTamil: string;
  lyricsTanglish: string;
};

/** Loads a song shaped for the edit form (names joined with commas, empty strings for blanks). */
export async function getSongForEdit(id: number): Promise<SongFormValues | null> {
  const song = await db.song.findUnique({
    where: { id },
    include: {
      credits: {
        orderBy: { position: "asc" },
        select: { role: true, artist: { select: { name: true } } },
      },
    },
  });
  if (!song) return null;

  const names = (role: CreditRole) =>
    song.credits
      .filter((c) => c.role === role)
      .map((c) => c.artist.name)
      .join(", ");

  return {
    id: song.id,
    slug: song.slug,
    status: song.status,
    title: song.title,
    titleTamil: song.titleTamil ?? "",
    singers: names("SINGER"),
    music: names("MUSIC"),
    lyricists: names("LYRICS"),
    album: song.album ?? "",
    releaseYear: song.releaseYear?.toString() ?? "",
    youtubeUrl: song.youtubeUrl ?? "",
    spotifyUrl: song.spotifyUrl ?? "",
    coverImage: song.coverImage,
    lyricsTamil: song.lyricsTamil,
    lyricsTanglish: song.lyricsTanglish,
  };
}
