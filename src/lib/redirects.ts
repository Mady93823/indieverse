import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Changes to redirects clear this tag (see the song and artist actions).
export const REDIRECTS_TAG = "redirects";

/**
 * Records that the page at `from` moved to `to`. Older redirects to `from` are pointed straight
 * at `to`, so visitors and search engines never follow a chain.
 */
export async function addRedirect(tx: Prisma.TransactionClient, from: string, to: string) {
  if (from === to) return;
  await tx.redirect.deleteMany({ where: { fromPath: to } });
  await tx.redirect.updateMany({ where: { toPath: from }, data: { toPath: to } });
  await tx.redirect.upsert({ where: { fromPath: from }, create: { fromPath: from, toPath: to }, update: { toPath: to } });
}

/** A page now lives at this address again, so any redirect away from it must go. */
export function clearRedirect(tx: Prisma.TransactionClient, path: string) {
  return tx.redirect.deleteMany({ where: { fromPath: path } });
}

/** Where an old address moved to, or null. */
export async function findRedirect(path: string) {
  "use cache";
  cacheLife("max");
  cacheTag(REDIRECTS_TAG);

  const row = await db.redirect.findUnique({ where: { fromPath: path }, select: { toPath: true } });
  return row?.toPath ?? null;
}
