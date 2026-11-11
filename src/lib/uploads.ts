import "server-only";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { MARK_SIZES, brandImageUrl, type BrandImage, type BrandKind } from "@/lib/brand";
import { shareImageFrom } from "@/lib/share-image";

// The folder is chosen at runtime, so tell the bundler not to trace (and bundle) what it points at.
const UPLOAD_ROOT = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "uploads");
const COVERS_DIR = "covers";
const BRAND_DIR = "brand";
const ARTISTS_DIR = "artists";
const COVER_SIZE = 800;
const ARTIST_PHOTO_SIZE = 480;

export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export const COVER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export class InvalidImageError extends Error {}

/** Checks type and size before decoding. Returns an error message, or null when the file is fine. */
export function checkImageFile(file: File): string | null {
  if (!COVER_TYPES.includes(file.type)) return "Use a JPG, PNG or WebP image";
  if (file.size > MAX_COVER_BYTES) return "The image must be 5 MB or smaller";
  return null;
}

/** Decodes the upload, failing with a readable message for files that aren't images. */
async function readImage(file: File) {
  const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 }).rotate(); // respect phone camera orientation
  try {
    await input.clone().stats(); // decodes every pixel, so broken files fail here
    return input;
  } catch {
    throw new InvalidImageError("This file couldn't be read as an image. Use JPG, PNG or WebP.");
  }
}

async function write(dir: string, name: string, data: Buffer) {
  await mkdir(path.join(UPLOAD_ROOT, dir), { recursive: true });
  await writeFile(path.join(UPLOAD_ROOT, dir, name), data);
}

/**
 * Crops the upload to a square, resizes it and stores it as WebP, plus a share image next to it.
 * Returns the public path to save on the song, e.g. "/uploads/covers/<uuid>.webp".
 */
export async function saveCover(file: File): Promise<string> {
  const image = await readImage(file);
  const cover = await image.resize(COVER_SIZE, COVER_SIZE, { fit: "cover" }).webp({ quality: 82 }).toBuffer();

  const id = randomUUID();
  await write(COVERS_DIR, `${id}.webp`, cover);
  await write(COVERS_DIR, `${id}-share.jpg`, await shareImageFrom(cover));
  return `/uploads/${COVERS_DIR}/${id}.webp`;
}

/** Deletes a cover and its share image. */
export async function deleteCover(publicPath: string | null | undefined) {
  if (!publicPath) return;
  await deleteUpload(publicPath);
  await deleteUpload(coverShareImage(publicPath));
}

/** "/uploads/covers/<id>.webp" → "/uploads/covers/<id>-share.jpg" (see saveCover). */
export function coverShareImage(coverPath: string) {
  return coverPath.replace(/\.webp$/, "-share.jpg");
}

/** The cover's share image if it exists (covers uploaded before share images need `npm run covers:share`). */
export function findShareImage(coverPath: string | null) {
  const share = coverPath && coverShareImage(coverPath);
  const file = share && resolvePublicPath(share);
  return file && existsSync(/*turbopackIgnore: true*/ file) ? share : null;
}

export async function saveArtistPhoto(file: File): Promise<string> {
  const image = await readImage(file);
  const photo = await image.resize(ARTIST_PHOTO_SIZE, ARTIST_PHOTO_SIZE, { fit: "cover" }).webp({ quality: 82 }).toBuffer();
  const name = `${randomUUID()}.webp`;
  await write(ARTISTS_DIR, name, photo);
  return `/uploads/${ARTISTS_DIR}/${name}`;
}

/**
 * Stores a brand image and returns its id and size:
 * - mark: a square PNG at each MARK_SIZES ("<id>-32.png" …), letterboxed, never cropped
 * - logo, logoDark: a PNG 96 px tall (shown at 48 px), up to 640 px wide ("<id>.png")
 * - shareImage: a 1200×630 JPEG for link previews ("<id>.jpg")
 * - hero: the home page background, up to 2400 px wide, as WebP ("<id>.webp")
 */
export async function saveBrandImage(kind: BrandKind, file: File): Promise<BrandImage> {
  const image = await readImage(file);
  const id = randomUUID();
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

  if (kind === "mark") {
    for (const size of MARK_SIZES) {
      const png = await image.clone().resize(size, size, { fit: "contain", background: transparent }).png().toBuffer();
      await write(BRAND_DIR, `${id}-${size}.png`, png);
    }
    return { id, width: 512, height: 512 };
  }
  if (kind === "hero") {
    const { data, info } = await image
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer({ resolveWithObject: true });
    await write(BRAND_DIR, `${id}.webp`, data);
    return { id, width: info.width, height: info.height };
  }
  if (kind === "shareImage") {
    await write(BRAND_DIR, `${id}.jpg`, await image.resize(1200, 630, { fit: "cover" }).jpeg({ quality: 86, mozjpeg: true }).toBuffer());
    return { id, width: 1200, height: 630 };
  }
  const { data, info } = await image
    .resize({ height: 96, width: 640, fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer({ resolveWithObject: true });
  await write(BRAND_DIR, `${id}.png`, data);
  return { id, width: info.width, height: info.height };
}

/** Deletes every file saveBrandImage wrote for this image. */
export async function deleteBrandImage(kind: BrandKind, image: BrandImage | null) {
  if (!image) return;
  const sizes = kind === "mark" ? MARK_SIZES : [undefined];
  for (const size of sizes) await deleteUpload(brandImageUrl(kind, image.id, size));
}

/** Deletes any file this module wrote, given its public path. Unknown paths are ignored. */
export async function deleteUpload(publicPath: string | null | undefined) {
  const file = publicPath && resolvePublicPath(publicPath);
  if (file) await unlink(file).catch(() => {});
}

function resolvePublicPath(publicPath: string) {
  return resolveUploadPath(publicPath.replace(/^\/uploads\//, "").split("/"));
}

const UPLOAD_NAMES: Record<string, RegExp> = {
  [COVERS_DIR]: /^[0-9a-f-]{36}(?:\.webp|-share\.jpg)$/,
  [ARTISTS_DIR]: /^[0-9a-f-]{36}\.webp$/,
  [BRAND_DIR]: /^[0-9a-f-]{36}(?:-\d{2,3})?\.(?:png|jpg|webp)$/,
};

/**
 * Maps URL segments to a file on disk. Only names this module generates
 * (e.g. "covers/<uuid>.webp") are accepted, so "../" and other paths can't escape the folder.
 */
export function resolveUploadPath(segments: string[]): string | null {
  const [dir, name] = segments;
  if (segments.length !== 2 || !Object.hasOwn(UPLOAD_NAMES, dir) || !UPLOAD_NAMES[dir].test(name)) {
    return null;
  }
  return path.join(UPLOAD_ROOT, dir, name);
}
