"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { REDIRECTS_TAG, addRedirect, clearRedirect } from "@/lib/redirects";
import { findOrCreateArtist, removeOrphanArtists } from "@/lib/artists/helpers";
import { slugify } from "@/lib/slug";
import { SONGS_TAG } from "@/lib/songs/queries";
import { songFormSchema, type SongFormState } from "@/lib/songs/schema";
import type { CreditRole, Prisma } from "@/generated/prisma/client";
import { InvalidImageError, checkImageFile, deleteCover, saveCover } from "@/lib/uploads";

/** Creates a song (songId null) or updates one. Bound with the id by the edit page. */
export async function saveSong(
  songId: number | null,
  _prev: SongFormState,
  formData: FormData,
): Promise<SongFormState> {
  await requireAdmin();

  const text = (key: string) => String(formData.get(key) ?? "");
  const parsed = songFormSchema.safeParse({
    intent: text("intent"),
    title: text("title"),
    titleTamil: text("titleTamil"),
    slug: text("slug"),
    singers: text("singers"),
    music: text("music"),
    lyricists: text("lyricists"),
    album: text("album"),
    releaseYear: text("releaseYear"),
    youtubeUrl: text("youtubeUrl"),
    spotifyUrl: text("spotifyUrl"),
    lyricsTamil: text("lyricsTamil"),
    lyricsTanglish: text("lyricsTanglish"),
    about: text("about"),
    seoTitle: text("seoTitle"),
    seoDescription: text("seoDescription"),
    featured: formData.get("featured") === "on",
    hideAds: formData.get("hideAds") === "on",
    adminNote: text("adminNote"),
    removeCover: formData.get("coverRemove") === "on",
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const input = parsed.data;

  const existing = songId
    ? await db.song.findUnique({ where: { id: songId }, select: { slug: true, coverImage: true, publishedAt: true } })
    : null;
  if (songId && !existing) return { error: "This song no longer exists." };

  const cover = formData.get("cover");
  const hasNewCover = cover instanceof File && cover.size > 0;
  const coverProblem = hasNewCover && checkImageFile(cover);
  if (coverProblem) return { fieldErrors: { cover: [coverProblem] } };

  let newCover: string | null = null;
  if (hasNewCover) {
    try {
      newCover = await saveCover(cover);
    } catch (error) {
      if (error instanceof InvalidImageError) return { fieldErrors: { cover: [error.message] } };
      throw error;
    }
  }

  const coverImage = newCover ?? (input.removeCover ? null : existing?.coverImage ?? null);
  const publishing = input.intent === "publish";
  const data = {
    slug: await uniqueSlug(input.slug || input.title, songId),
    title: input.title,
    titleTamil: input.titleTamil,
    album: input.album,
    releaseYear: input.releaseYear,
    youtubeUrl: input.youtubeUrl,
    spotifyUrl: input.spotifyUrl,
    coverImage,
    lyricsTamil: input.lyricsTamil,
    lyricsTanglish: input.lyricsTanglish,
    about: input.about,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    featured: input.featured,
    hideAds: input.hideAds,
    adminNote: input.adminNote,
    status: publishing ? "PUBLISHED" : "DRAFT",
    // Keep the first publish date, so fixing a typo doesn't bump the song back to "recent".
    publishedAt: publishing ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
  } satisfies Prisma.SongUncheckedCreateInput;

  try {
    await db.$transaction(async (tx) => {
      const song = songId
        ? await tx.song.update({ where: { id: songId }, data })
        : await tx.song.create({ data });

      // Once a song has been public, its old address keeps working after the link changes.
      await clearRedirect(tx, `/songs/${song.slug}`);
      if (existing?.publishedAt && existing.slug !== song.slug) {
        await addRedirect(tx, `/songs/${existing.slug}`, `/songs/${song.slug}`);
      }

      await tx.songCredit.deleteMany({ where: { songId: song.id } });
      const roles: [CreditRole, string[]][] = [
        ["SINGER", input.singers],
        ["MUSIC", input.music],
        ["LYRICS", input.lyricists],
      ];
      for (const [role, names] of roles) {
        for (const [position, name] of names.entries()) {
          const artist = await findOrCreateArtist(tx, name);
          if (!artist) continue;
          await tx.songCredit.upsert({
            where: { songId_artistId_role: { songId: song.id, artistId: artist.id, role } },
            update: {},
            create: { songId: song.id, artistId: artist.id, role, position },
          });
        }
      }
      await removeOrphanArtists(tx);
    });
  } catch (error) {
    await deleteCover(newCover);
    throw error;
  }

  if (existing?.coverImage && existing.coverImage !== coverImage) {
    await deleteCover(existing.coverImage);
  }

  updateTag(SONGS_TAG);
  updateTag(REDIRECTS_TAG);
  redirect(`/admin/songs?toast=${publishing ? "published" : "saved"}`);
}

export async function deleteSong(songId: number) {
  await requireAdmin();

  const song = await db.song.findUnique({ where: { id: songId }, select: { coverImage: true } });
  if (song) {
    await db.$transaction(async (tx) => {
      await tx.song.delete({ where: { id: songId } });
      await removeOrphanArtists(tx);
    });
    await deleteCover(song.coverImage);
    updateTag(SONGS_TAG);
  }
  redirect("/admin/songs?toast=deleted");
}

/** "kannaana-kanne", or "kannaana-kanne-2" if another song already uses that. */
async function uniqueSlug(source: string, songId: number | null) {
  const base = slugify(source) || "song";
  const taken = await db.song.findMany({
    where: { slug: { startsWith: base }, ...(songId ? { id: { not: songId } } : {}) },
    select: { slug: true },
  });
  const used = new Set(taken.map((s) => s.slug));
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}
