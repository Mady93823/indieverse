import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/songs/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.SITE_URL || "http://localhost:3000";
  const { songs, artists } = await getSitemapData();

  return [
    { url: site, changeFrequency: "daily", priority: 1 },
    ...songs.map((song) => ({
      url: `${site}/songs/${song.slug}`,
      lastModified: song.updatedAt,
      priority: 0.8,
    })),
    ...artists.map((artist) => ({ url: `${site}/artists/${artist.slug}`, priority: 0.5 })),
  ];
}
