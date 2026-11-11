"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { uniqueArtistSlug } from "@/lib/artists/helpers";
import { artistFormSchema } from "@/lib/artists/schema";
import { db } from "@/lib/db";
import { errorsFrom, type FormState } from "@/lib/form-state";
import { REDIRECTS_TAG, addRedirect, clearRedirect } from "@/lib/redirects";
import { slugify } from "@/lib/slug";
import { SONGS_TAG } from "@/lib/songs/queries";
import { InvalidImageError, checkImageFile, deleteUpload, saveArtistPhoto } from "@/lib/uploads";

const PROFILE_FIELDS = ["nameTamil", "bio", "photo", "instagramUrl", "youtubeUrl", "spotifyUrl"] as const;

export async function saveArtist(artistId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const text = (key: string) => String(formData.get(key) ?? "");
  const parsed = artistFormSchema.safeParse({
    name: text("name"),
    nameTamil: text("nameTamil"),
    slug: text("slug"),
    bio: text("bio"),
    instagramUrl: text("instagramUrl"),
    youtubeUrl: text("youtubeUrl"),
    spotifyUrl: text("spotifyUrl"),
  });
  if (!parsed.success) return errorsFrom(parsed.error);
  const input = parsed.data;

  const existing = await db.artist.findUnique({ where: { id: artistId }, select: { slug: true, photo: true } });
  if (!existing) return { error: "This artist no longer exists." };

  const twin = await db.artist.findFirst({
    where: { id: { not: artistId }, name: { equals: input.name, mode: "insensitive" } },
    select: { name: true },
  });
  if (twin) {
    return { fieldErrors: { name: [`Another artist is already called “${twin.name}”. To combine them, use Merge below.`] } };
  }

  const photo = formData.get("photo");
  const hasNewPhoto = photo instanceof File && photo.size > 0;
  const photoProblem = hasNewPhoto && checkImageFile(photo);
  if (photoProblem) return { fieldErrors: { photo: [photoProblem] } };
  let newPhoto: string | null = null;
  if (hasNewPhoto) {
    try {
      newPhoto = await saveArtistPhoto(photo);
    } catch (error) {
      if (error instanceof InvalidImageError) return { fieldErrors: { photo: [error.message] } };
      throw error;
    }
  }
  const photoPath = newPhoto ?? (formData.get("photoRemove") === "on" ? null : existing.photo);

  try {
    await db.$transaction(async (tx) => {
      const slug = await uniqueArtistSlug(tx, slugify(input.slug || input.name) || "artist", artistId);
      await tx.artist.update({ where: { id: artistId }, data: { ...input, slug, photo: photoPath } });
      await clearRedirect(tx, `/artists/${slug}`);
      if (slug !== existing.slug) await addRedirect(tx, `/artists/${existing.slug}`, `/artists/${slug}`);
    });
  } catch (error) {
    await deleteUpload(newPhoto);
    throw error;
  }
  if (existing.photo && existing.photo !== photoPath) await deleteUpload(existing.photo);

  updateTag(SONGS_TAG);
  updateTag(REDIRECTS_TAG);
  return { ok: Date.now() };
}

/**
 * Moves every credit of one artist to another (for duplicates like "Sid Sriram" and "Sid Sriraam"),
 * keeps any profile details the target is missing, deletes the duplicate and forwards its page.
 */
export async function mergeArtist(sourceId: number, formData: FormData) {
  await requireAdmin();
  const targetId = Number(formData.get("targetId"));
  if (!Number.isSafeInteger(targetId) || targetId === sourceId) return;

  const [source, target] = await Promise.all([
    db.artist.findUnique({ where: { id: sourceId } }),
    db.artist.findUnique({ where: { id: targetId } }),
  ]);
  if (!source || !target) return;

  const filled = Object.fromEntries(PROFILE_FIELDS.filter((f) => !target[f] && source[f]).map((f) => [f, source[f]]));
  await db.$transaction(async (tx) => {
    const credits = await tx.songCredit.findMany({ where: { artistId: sourceId } });
    // Songs both artists are credited on (in the same role) keep a single credit.
    await tx.songCredit.createMany({
      data: credits.map((credit) => ({ ...credit, artistId: targetId })),
      skipDuplicates: true,
    });
    await tx.artist.delete({ where: { id: sourceId } });
    if (Object.keys(filled).length > 0) await tx.artist.update({ where: { id: targetId }, data: filled });
    await addRedirect(tx, `/artists/${source.slug}`, `/artists/${target.slug}`);
  });
  if (source.photo && filled.photo !== source.photo) await deleteUpload(source.photo);

  updateTag(SONGS_TAG);
  updateTag(REDIRECTS_TAG);
  redirect(`/admin/artists/${targetId}?toast=merged`);
}

/** Only for artists without songs; others need their songs edited or a merge. */
export async function deleteArtist(artistId: number) {
  await requireAdmin();
  const artist = await db.artist.findUnique({
    where: { id: artistId },
    select: { photo: true, _count: { select: { credits: true } } },
  });
  if (artist && artist._count.credits === 0) {
    await db.artist.delete({ where: { id: artistId } });
    await deleteUpload(artist.photo);
    updateTag(SONGS_TAG);
  }
  redirect("/admin/artists?toast=artist-deleted");
}
