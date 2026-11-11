/**
 * Makes link-preview images (1200×630 JPEG) for song covers uploaded before IndieVerse
 * created them automatically. Safe to run again: covers that already have one are skipped.
 *
 *   npm run covers:share
 */
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { shareImageFrom } from "../src/lib/share-image";

if (existsSync(".env")) process.loadEnvFile(".env");

const { db } = await import("../src/lib/db");

// Same folder the app uses (src/lib/uploads.ts).
const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || "uploads");

try {
  const songs = await db.song.findMany({ where: { coverImage: { not: null } }, select: { coverImage: true } });
  let made = 0;
  for (const { coverImage } of songs) {
    const name = coverImage?.match(/^\/uploads\/covers\/([0-9a-f-]{36})\.webp$/)?.[1];
    if (!name) continue;
    const cover = path.join(UPLOAD_ROOT, "covers", `${name}.webp`);
    const share = path.join(UPLOAD_ROOT, "covers", `${name}-share.jpg`);
    if (!existsSync(cover) || existsSync(share)) continue;
    await writeFile(share, await shareImageFrom(cover));
    made++;
  }
  console.log(`Made ${made} share images (${songs.length} songs have covers).`);
  if (made > 0) {
    console.log("Restart `npm run dev`, or run `npm run build` and restart a production server, so song pages use them.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
