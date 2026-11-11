import type { MetadataRoute } from "next";
import { getPublishedPages } from "@/lib/pages/queries";
import { siteUrl } from "@/lib/site-url";
import { getSitemapData } from "@/lib/songs/queries";

// Lists every public page for search engines. Submit /sitemap.xml once in Search Console;
// it updates itself as songs are published.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();
  const [{ songs, artists }, pages] = await Promise.all([getSitemapData(), getPublishedPages()]);
  const latest = songs.reduce<Date | undefined>((max, s) => (!max || s.updatedAt > max ? s.updatedAt : max), undefined);

  return [
    { url: site, lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: `${site}/songs`, lastModified: latest, changeFrequency: "daily", priority: 0.7 },
    { url: `${site}/artists`, lastModified: latest, changeFrequency: "weekly", priority: 0.6 },
    ...songs.map((song) => ({
      url: `${site}/songs/${song.slug}`,
      lastModified: song.updatedAt,
      priority: 0.8,
      images: song.coverImage ? [`${site}${song.coverImage}`] : undefined,
    })),
    ...artists.map((artist) => ({
      url: `${site}/artists/${artist.slug}`,
      lastModified: artist.updatedAt,
      priority: 0.5,
      images: artist.photo ? [`${site}${artist.photo}`] : undefined,
    })),
    ...pages.map((page) => ({ url: `${site}/${page.slug}`, lastModified: page.updatedAt, priority: 0.3 })),
  ];
}
