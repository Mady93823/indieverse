"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { errorsFrom, type FormState } from "@/lib/form-state";
import { isPageSlug } from "@/lib/pages/defaults";
import { PAGES_TAG } from "@/lib/pages/queries";

const pageSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(120, "Keep this under 120 characters"),
  body: z
    .string()
    .max(20_000, "This page is too long")
    .transform((v) => v.replace(/\r\n?/g, "\n").trim())
    .pipe(z.string().min(1, "Write something first")),
  published: z.boolean(),
});

export async function savePage(slug: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!isPageSlug(slug)) return { error: "Unknown page." };

  const parsed = pageSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return errorsFrom(parsed.error);

  await db.page.upsert({ where: { slug }, create: { slug, ...parsed.data }, update: parsed.data });
  updateTag(PAGES_TAG);
  return { ok: Date.now() };
}
