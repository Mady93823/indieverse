import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings/queries";
import { siteUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { seo } = await getSettings();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/search"] },
    // "Hide from search engines" works through a noindex tag on every page (see the root layout).
    // Crawling stays allowed so search engines can see that tag; blocking them here would
    // leave already-indexed pages in their results.
    sitemap: seo.hideFromSearch ? undefined : `${siteUrl()}/sitemap.xml`,
  };
}
