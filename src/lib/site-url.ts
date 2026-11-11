/** The public address of the site from SITE_URL, without a trailing slash. */
export function siteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}
