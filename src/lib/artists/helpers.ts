import "server-only";
import { slugify } from "@/lib/slug";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Typing an existing artist's name (in any letter case) links to them; a new name creates the artist.
 * Matching by name first keeps working after an admin gives an artist a custom link.
 */
export async function findOrCreateArtist(tx: Prisma.TransactionClient, name: string) {
  const slug = slugify(name);
  if (!slug) return null;
  const byName = await tx.artist.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    orderBy: { id: "asc" },
  });
  if (byName) return byName;
  // Also match spelling variants that make the same link ("Kavin Raj" and "Kavin-Raj").
  const bySlug = await tx.artist.findUnique({ where: { slug } });
  if (bySlug && slugify(bySlug.name) === slug) return bySlug;
  return tx.artist.create({ data: { name, slug: await uniqueArtistSlug(tx, slug) } });
}

/** "kavin-raj", or "kavin-raj-2" if another artist already uses that. */
export async function uniqueArtistSlug(tx: Prisma.TransactionClient, base: string, artistId?: number) {
  const taken = new Set(
    (
      await tx.artist.findMany({
        where: { slug: { startsWith: base }, ...(artistId ? { id: { not: artistId } } : {}) },
        select: { slug: true },
      })
    ).map((a) => a.slug),
  );
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

/**
 * Artists are created from song credits, so drop any left without songs (e.g. after fixing a typo),
 * unless an admin has filled in their profile.
 */
export function removeOrphanArtists(tx: Prisma.TransactionClient) {
  return tx.artist.deleteMany({
    where: {
      credits: { none: {} },
      nameTamil: null,
      bio: null,
      photo: null,
      instagramUrl: null,
      youtubeUrl: null,
      spotifyUrl: null,
    },
  });
}
