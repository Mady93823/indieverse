import { createHash } from "node:crypto";

/**
 * Demo songs (scripts/demo-data.mts) get a cover file name derived from their slug, shaped like
 * a real upload's random UUID. That's how the demo script and the launch checklist recognise them.
 */
export function demoCoverName(slug: string) {
  const h = createHash("sha256").update(`indieverse-demo:${slug}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}.webp`;
}

export function isDemoSong(song: { slug: string; coverImage: string | null }) {
  return song.coverImage === `/uploads/covers/${demoCoverName(song.slug)}`;
}
