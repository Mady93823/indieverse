import "server-only";
import { db } from "@/lib/db";
import { isDemoSong } from "@/lib/demo";
import { getSettings } from "@/lib/settings/queries";

/** Not a Google rule: a sensible amount of real content before asking AdSense to review the site. */
export const MIN_SONGS_FOR_ADSENSE = 30;

const REQUIRED_PAGES = [
  ["about", "About"],
  ["contact", "Contact"],
  ["privacy", "Privacy"],
  ["copyright", "Copyright"],
] as const;

export type LaunchCheck = { id: string; label: string; done: boolean; detail: string; href?: string };

/** What the site needs before going live and applying for AdSense, worked out from the data. */
export async function getLaunchChecks(): Promise<LaunchCheck[]> {
  const complete = { status: "PUBLISHED", lyricsTamil: { not: "" }, lyricsTanglish: { not: "" } } as const;
  const [{ general, seo }, songsWithCovers, completeSongs, withAbout, pages] = await Promise.all([
    getSettings(),
    db.song.findMany({ where: { coverImage: { not: null } }, select: { slug: true, coverImage: true } }),
    db.song.count({ where: complete }),
    db.song.count({ where: { ...complete, about: { not: null } } }),
    db.page.findMany({ where: { published: true }, select: { slug: true } }),
  ]);

  const siteUrl = process.env.SITE_URL ?? "";
  const url = URL.canParse(siteUrl) ? new URL(siteUrl) : null;
  const onOwnDomain =
    url?.protocol === "https:" && url.hostname !== "localhost" && !/^[\d.]+$|^\[/.test(url.hostname);
  const demoSongs = songsWithCovers.filter(isDemoSong).length;
  const missingPages = REQUIRED_PAGES.filter(([slug]) => !pages.some((p) => p.slug === slug)).map(([, name]) => name);

  return [
    {
      id: "domain",
      label: "The site runs on its own domain with HTTPS",
      done: onOwnDomain,
      detail: onOwnDomain
        ? url!.host
        : `SITE_URL is ${siteUrl ? `“${siteUrl}”` : "not set"}. Set it to https://your-domain in the server's .env file.`,
    },
    {
      id: "demo",
      label: "Demo songs are removed",
      done: demoSongs === 0,
      detail: demoSongs === 0 ? "No demo songs left." : `${demoSongs} demo songs remain. Run npm run demo:remove on the server.`,
    },
    {
      id: "songs",
      label: `At least ${MIN_SONGS_FOR_ADSENSE} published songs with both lyrics`,
      done: completeSongs >= MIN_SONGS_FOR_ADSENSE,
      detail: `${completeSongs} of ${MIN_SONGS_FOR_ADSENSE} so far. Demo songs count here too, so remove them first.`,
      href: "/admin/songs/new",
    },
    {
      id: "about",
      label: "At least half of those songs have About text",
      done: completeSongs > 0 && withAbout * 2 >= completeSongs,
      detail: `${withAbout} of ${completeSongs} songs. A few lines of your own about each song is what makes the site original in Google's eyes.`,
      href: "/admin/songs?filter=published",
    },
    {
      id: "pages",
      label: "About, Contact, Privacy and Copyright pages are published",
      done: missingPages.length === 0,
      detail: missingPages.length === 0 ? "All published." : `Not published yet: ${missingPages.join(", ")}.`,
      href: "/admin/pages",
    },
    {
      id: "email",
      label: "A contact email is set",
      done: !!general.contactEmail,
      detail: general.contactEmail || "Shown on the Contact, Privacy and Copyright pages.",
      href: "/admin/settings",
    },
    {
      id: "visible",
      label: "The site is visible to search engines",
      done: !seo.hideFromSearch,
      detail: seo.hideFromSearch ? "“Hide from search engines” is on." : "Search engines may index the site.",
      href: "/admin/settings/seo",
    },
    {
      id: "search-console",
      label: "Google Search Console is verified",
      done: !!seo.googleVerification,
      detail: seo.googleVerification
        ? "Verification code added."
        : "Add the HTML-tag code from Search Console. If you verified with DNS instead, you can ignore this.",
      href: "/admin/settings/seo",
    },
  ];
}
