import type { MetadataRoute } from "next";
import { markUrl } from "@/lib/brand";
import { getSettings } from "@/lib/settings/queries";

// Lets phones add the site to the home screen with its name and logo.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { general, home, branding } = await getSettings();
  return {
    name: `${general.siteName} – ${general.tagline}`,
    short_name: general.siteName,
    description: home.intro,
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbfe",
    theme_color: "#fbfbfe",
    icons: [
      { src: markUrl(branding.mark, 192), sizes: "192x192", type: "image/png" },
      { src: markUrl(branding.mark, 512), sizes: "512x512", type: "image/png" },
    ],
  };
}
