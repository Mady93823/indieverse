import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, SwitchField, TextField } from "@/components/admin/form-parts";
import { PageEditor } from "@/components/admin/page-editor";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { savePage } from "@/lib/pages/actions";
import { PAGE_TEMPLATES, isPageSlug } from "@/lib/pages/defaults";
import { getPagesForAdmin } from "@/lib/pages/queries";
import { getSettings } from "@/lib/settings/queries";
import { siteUrl } from "@/lib/site-url";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Edit page" };

export default async function EditPagePage({ params }: PageProps<"/admin/pages/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  if (!isPageSlug(slug)) notFound();
  const [pages, { general }] = await Promise.all([getPagesForAdmin(), getSettings()]);
  const page = pages.find((p) => p.slug === slug)!;
  const tokens = { site: general.siteName, email: general.contactEmail, url: siteUrl() };

  return (
    <div className="space-y-4">
      <div>
        <Button variant="link" size="sm" asChild className="-ml-2.5 text-muted-foreground">
          <Link href="/admin/pages">
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            All pages
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{page.title.replaceAll("{site}", general.siteName)}</h1>
          {page.published && (
            <Button variant="outline" size="sm" asChild className="ml-auto bg-background">
              <Link href={`/${slug}`} target="_blank">
                View on site
                <ExternalLinkIcon data-icon="inline-end" aria-hidden />
              </Link>
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{page.purpose}</p>
      </div>

      {!general.contactEmail && (
        <p className="rounded-lg border border-marigold/40 bg-marigold/10 p-3 text-sm">
          Add a contact email in{" "}
          <Link href="/admin/settings" className="font-medium underline underline-offset-4">
            Settings
          </Link>{" "}
          first. Until then, <code>{"{email}"}</code> reads “the email address on our Contact page”.
        </p>
      )}

      <AdminForm action={savePage.bind(null, slug)} successMessage="Page saved.">
        <Section title="Page">
          <TextField name="title" label="Title" defaultValue={page.title} hint={<><code>{"{site}"}</code> becomes your site name.</>} required />
          <PageEditor defaultBody={page.body} template={PAGE_TEMPLATES[slug].body} tokens={tokens} />
        </Section>
        <Section title="Visibility">
          <SwitchField
            name="published"
            label="Published"
            hint="Published pages appear at their address and in the footer."
            defaultChecked={page.published}
          />
        </Section>
      </AdminForm>
    </div>
  );
}
