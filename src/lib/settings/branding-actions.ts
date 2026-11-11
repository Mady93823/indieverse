"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import type { BrandImage, BrandKind } from "@/lib/brand";
import { db } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import { SETTINGS_TAG } from "@/lib/settings/queries";
import { readGroup } from "@/lib/settings/schema";
import { InvalidImageError, checkImageFile, deleteBrandImage, saveBrandImage } from "@/lib/uploads";

/** Uploads a logo, dark logo, logo mark or share image, replacing (and deleting) the old one. */
export async function uploadBrandImage(kind: BrandKind, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin("OWNER");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { fieldErrors: { file: ["Choose an image first"] } };
  const problem = checkImageFile(file);
  if (problem) return { fieldErrors: { file: [problem] } };

  let image: BrandImage;
  try {
    image = await saveBrandImage(kind, file);
  } catch (error) {
    if (error instanceof InvalidImageError) return { fieldErrors: { file: [error.message] } };
    throw error;
  }
  await deleteBrandImage(kind, await setBrandImage(kind, image));
  return { ok: Date.now() };
}

export async function removeBrandImage(kind: BrandKind) {
  await requireAdmin("OWNER");
  await deleteBrandImage(kind, await setBrandImage(kind, null));
}

/** Saves the new image in settings and returns the one it replaced. */
async function setBrandImage(kind: BrandKind, image: BrandImage | null) {
  // Read the stored row, not the cached settings, so two quick uploads can't undo each other.
  const row = await db.setting.findUnique({ where: { key: "branding" } });
  const current = readGroup("branding", row?.value);
  const value = { ...current, [kind]: image };
  await db.setting.upsert({ where: { key: "branding" }, create: { key: "branding", value }, update: { value } });
  updateTag(SETTINGS_TAG);
  return current[kind];
}
