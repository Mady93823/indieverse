import { markUrl } from "@/lib/brand";
import { getSettings } from "@/lib/settings/queries";
import { siteUrl } from "@/lib/site-url";

// Browsers and some crawlers ask for /favicon.ico even when the page names other icons.
// Point them at the current logo mark; a temporary redirect, since the logo can change.
export async function GET() {
  const { branding } = await getSettings();
  return Response.redirect(new URL(markUrl(branding.mark, 32), siteUrl()), 307);
}
