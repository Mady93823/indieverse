import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { PAGE_SLUGS, PAGE_TEMPLATES, type PageSlug } from "@/lib/pages/defaults";

// Saving a page clears this tag, so the page, the footer links and the sitemap update together.
export const PAGES_TAG = "pages";

export type PublishedPage = { slug: PageSlug; title: string; body: string; updatedAt: Date };

/** Published pages in their fixed order. Pages that were never saved aren't published. */
export async function getPublishedPages(): Promise<PublishedPage[]> {
  "use cache";
  cacheLife("max");
  cacheTag(PAGES_TAG);

  const rows = await db.page.findMany({ where: { published: true } });
  return PAGE_SLUGS.flatMap((slug) => {
    const row = rows.find((r) => r.slug === slug);
    return row ? [{ slug, title: row.title, body: row.body, updatedAt: row.updatedAt }] : [];
  });
}

export async function getPublishedPage(slug: PageSlug) {
  return (await getPublishedPages()).find((page) => page.slug === slug) ?? null;
}

/** Every page for the admin, falling back to its template when it was never saved. Not cached. */
export async function getPagesForAdmin() {
  const rows = await db.page.findMany();
  return PAGE_SLUGS.map((slug) => {
    const row = rows.find((r) => r.slug === slug);
    const template = PAGE_TEMPLATES[slug];
    return {
      slug,
      purpose: template.purpose,
      title: row?.title ?? template.title,
      body: row?.body ?? template.body,
      published: row?.published ?? false,
      updatedAt: row?.updatedAt ?? null,
    };
  });
}
