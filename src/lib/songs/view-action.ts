"use server";

import { db } from "@/lib/db";

/** Called once per visit from the song page. Powers the "Popular" list. */
export async function recordView(songId: number) {
  if (!Number.isSafeInteger(songId) || songId < 1) return;
  await db.song.updateMany({
    where: { id: songId, status: "PUBLISHED" },
    data: { views: { increment: 1 } },
  });
}
