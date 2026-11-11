import "server-only";
import { db } from "@/lib/db";

// Admin reads are never cached: the panel always shows the current state.

export async function listArtistsForAdmin(rawQuery: string) {
  const q = rawQuery.trim().slice(0, 100);
  const contains = { contains: q, mode: "insensitive" } as const;
  const artists = await db.artist.findMany({
    where: q ? { OR: [{ name: contains }, { nameTamil: contains }] } : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      nameTamil: true,
      slug: true,
      photo: true,
      bio: true,
      credits: { select: { songId: true, song: { select: { status: true } } } },
    },
  });
  return artists.map(({ credits, bio, ...artist }) => ({
    ...artist,
    hasBio: !!bio,
    songs: new Set(credits.map((c) => c.songId)).size,
    published: new Set(credits.filter((c) => c.song.status === "PUBLISHED").map((c) => c.songId)).size,
  }));
}

export async function getArtistForEdit(id: number) {
  return db.artist.findUnique({
    where: { id },
    include: {
      credits: {
        orderBy: { song: { title: "asc" } },
        select: { role: true, song: { select: { id: true, title: true, status: true } } },
      },
    },
  });
}

/** Everyone else, for "merge into". */
export function listOtherArtists(id: number) {
  return db.artist.findMany({ where: { id: { not: id } }, orderBy: { name: "asc" }, select: { id: true, name: true } });
}
