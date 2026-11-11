"use server";

import { db } from "@/lib/db";

/**
 * Called once per visit from the song page. Adds to the all-time count ("All-time popular")
 * and to today's count ("Trending now" adds up the last 7 days).
 */
export async function recordView(songId: number) {
  if (!Number.isSafeInteger(songId) || songId < 1) return;
  const { count } = await db.song.updateMany({
    where: { id: songId, status: "PUBLISHED" },
    data: { views: { increment: 1 } },
  });
  if (count === 0) return;
  await db.$executeRaw`
    INSERT INTO song_daily_views (song_id, day, views) VALUES (${songId}, CURRENT_DATE, 1)
    ON CONFLICT (song_id, day) DO UPDATE SET views = song_daily_views.views + 1`;
}
