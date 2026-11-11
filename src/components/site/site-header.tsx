import Link from "next/link";
import { Suspense } from "react";
import { SearchIcon } from "lucide-react";
import { Container } from "@/components/site/container";
import { ScriptToggle } from "@/components/site/lyrics-mode";
import { DesktopNav, DesktopNavLinks, MobileNav, MobileNavPlaceholder } from "@/components/site/site-nav";
import { SiteLogo } from "@/components/site/site-logo";
import { getPublishedPages } from "@/lib/pages/queries";
import { getSettings } from "@/lib/settings/queries";
import { getCurrentYear } from "@/lib/songs/queries";

/** Sticky, with a frosted background so the page shows faintly behind it. */
export async function SiteHeader() {
  const { general, branding } = await getSettings();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <Container className="relative flex h-18 items-center gap-6">
        <Link
          href="/"
          className="mr-auto flex min-w-0 shrink items-center rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <SiteLogo name={general.siteName} nameTamil={general.siteNameTamil} branding={branding} scheme="light" />
        </Link>
        <Suspense fallback={<DesktopNavLinks pathname="" />}>
          <DesktopNav />
        </Suspense>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-10 items-center justify-center rounded-full text-foreground/80 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <SearchIcon className="size-5" aria-hidden />
          </Link>
          <div className="hidden sm:block">
            <ScriptToggle />
          </div>
          <Suspense fallback={<MobileNavPlaceholder />}>
            <MobileNav />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}

const SOCIAL = [
  ["instagramUrl", "Instagram"],
  ["youtubeUrl", "YouTube"],
  ["xUrl", "X"],
  ["facebookUrl", "Facebook"],
] as const;

export async function SiteFooter() {
  const [{ general }, pages, year] = await Promise.all([getSettings(), getPublishedPages(), getCurrentYear()]);
  const page = (slug: string) => pages.find((p) => p.slug === slug);
  const social = SOCIAL.filter(([key]) => general[key]).map(([key, label]) => ({ href: general[key], label, external: true }));
  const about = [
    page("about") && { href: "/about", label: "Our archive" },
    page("copyright") && { href: "/copyright", label: "Copyright & removals" },
    page("contact") && { href: "/contact", label: "Contact" },
  ].filter((link) => !!link);
  const legal = [
    page("privacy") && { href: "/privacy", label: "Privacy" },
    page("terms") && { href: "/terms", label: "Terms" },
    ...social,
  ].filter((link) => !!link);

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <Container className="grid gap-10 py-16 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_auto] lg:gap-16">
        <div className="flex max-w-sm flex-col gap-4 sm:col-span-3 lg:col-span-1">
          <p className="flex items-center gap-3 text-xl font-semibold">
            <span aria-hidden className="size-8 shrink-0 rounded-full bg-pink" />
            <span>
              {general.siteNameTamil && (
                <>
                  <span lang="ta">{general.siteNameTamil}</span> ·{" "}
                </>
              )}
              <span translate="no">{general.siteName}</span>
            </span>
          </p>
          {general.footerText && <p className="text-sm leading-relaxed text-muted-foreground">{general.footerText}</p>}
          {general.contactEmail && (
            <a href={`mailto:${general.contactEmail}`} className="self-start text-sm text-muted-foreground hover:text-foreground">
              {general.contactEmail}
            </a>
          )}
        </div>
        <FooterLinks
          title="Discover"
          links={[
            { href: "/latest", label: "Latest lyrics" },
            { href: "/trending", label: "Trending songs" },
            { href: "/popular", label: "All-time popular" },
          ]}
        />
        <FooterLinks
          title="Browse"
          links={[
            { href: "/decades", label: "By decade" },
            { href: "/composers", label: "By composer" },
            { href: "/lyricists", label: "By lyricist" },
            { href: "/songs", label: "All songs A–Z" },
          ]}
        />
        {about.length > 0 && <FooterLinks title="About" links={about} />}
      </Container>
      <Container className="flex flex-col gap-3 border-t py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {general.siteName}. Made with love for Tamil music.
        </p>
        {legal.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {legal.map((link) => (
              <li key={link.href}>
                <FooterLink {...link} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </footer>
  );
}

type LinkItem = { href: string; label: string; external?: boolean };

function FooterLinks({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="flex flex-col gap-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterLink({ href, label, external }: LinkItem) {
  const className = "text-muted-foreground transition-colors hover:text-foreground";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer me" className={className}>
      {label}
    </a>
  ) : (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
