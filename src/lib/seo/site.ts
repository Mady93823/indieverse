import "server-only";
import { markUrl } from "@/lib/brand";
import { getSettings } from "@/lib/settings/queries";
import { siteUrl } from "@/lib/site-url";

/** The site details structured data needs, from settings. */
export async function getSiteInfo() {
  const { general, branding } = await getSettings();
  const url = siteUrl();
  return { name: general.siteName, nameTamil: general.siteNameTamil, url, logo: `${url}${markUrl(branding.mark, 512)}` };
}
