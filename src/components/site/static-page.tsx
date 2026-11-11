import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/container";
import { PageBody } from "@/components/site/page-body";
import { fillTokens, type PageSlug } from "@/lib/pages/defaults";
import { pageSummary } from "@/lib/pages/format";
import { getPublishedPage } from "@/lib/pages/queries";
import { getSettings } from "@/lib/settings/queries";
import { siteUrl } from "@/lib/site-url";

// The About, Contact, Privacy, Terms and Copyright pages. Each has its own route file so unknown
// addresses still get a real 404. Unpublished pages are 404s too.

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

async function load(slug: PageSlug) {
  const [page, { general }] = await Promise.all([getPublishedPage(slug), getSettings()]);
  if (!page) return null;
  const tokens = { site: general.siteName, email: general.contactEmail, url: siteUrl() };
  return { ...page, title: fillTokens(page.title, tokens), body: fillTokens(page.body, tokens) };
}

export async function staticPageMetadata(slug: PageSlug): Promise<Metadata> {
  const page = await load(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.title,
    description: pageSummary(page.body),
    alternates: { canonical: `/${slug}` },
  };
}

export async function StaticPage({ slug }: { slug: PageSlug }) {
  const page = await load(slug);
  if (!page) notFound();

  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <article className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{page.title}</h1>
          <p className="text-sm text-muted-foreground">Updated {dateFormat.format(page.updatedAt)}</p>
        </header>
        <PageBody body={page.body} />
      </article>
    </Container>
  );
}
