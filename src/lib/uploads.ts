import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// The folder is chosen at runtime, so tell the bundler not to trace (and bundle) what it points at.
const UPLOAD_ROOT = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "uploads");
const COVERS_DIR = "covers";
const COVER_SIZE = 800;

export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export const COVER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export class InvalidImageError extends Error {}

/**
 * Crops the upload to a square, resizes it and stores it as WebP.
 * Returns the public path to save on the song, e.g. "/uploads/covers/<uuid>.webp".
 */
export async function saveCover(file: File): Promise<string> {
  let output: Buffer;
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 })
      .rotate() // respect phone camera orientation
      .resize(COVER_SIZE, COVER_SIZE, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new InvalidImageError("This file couldn't be read as an image. Use JPG, PNG or WebP.");
  }

  const name = `${randomUUID()}.webp`;
  await mkdir(path.join(UPLOAD_ROOT, COVERS_DIR), { recursive: true });
  await writeFile(path.join(UPLOAD_ROOT, COVERS_DIR, name), output);
  return `/uploads/${COVERS_DIR}/${name}`;
}

export async function deleteCover(publicPath: string | null | undefined) {
  if (!publicPath) return;
  const file = resolveUploadPath(publicPath.replace(/^\/uploads\//, "").split("/"));
  if (file) await unlink(file).catch(() => {});
}

/** The cover's main colour as "#rrggbb", used to tint the song page. Null when there's no cover. */
export async function getCoverColor(publicPath: string | null): Promise<string | null> {
  const file = publicPath && resolveUploadPath(publicPath.replace(/^\/uploads\//, "").split("/"));
  if (!file) return null;
  try {
    const { dominant } = await sharp(file).stats();
    return `#${[dominant.r, dominant.g, dominant.b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  } catch {
    return null;
  }
}

/**
 * Maps URL segments to a file on disk. Only names this module generates
 * ("covers/<uuid>.webp") are accepted, so "../" and other paths can't escape the folder.
 */
export function resolveUploadPath(segments: string[]): string | null {
  const [dir, name] = segments;
  if (segments.length !== 2 || dir !== COVERS_DIR || !/^[0-9a-f-]{36}\.webp$/.test(name)) {
    return null;
  }
  return path.join(UPLOAD_ROOT, dir, name);
}
