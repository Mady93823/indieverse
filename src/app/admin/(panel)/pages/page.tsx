import type { Metadata } from "next";
import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { fillTokens } from "@/lib/pages/defaults";
import { getPagesForAdmin } from "@/lib/pages/queries";
import { getSettings } from "@/lib/settings/queries";
import { siteUrl } from "@/lib/site-url";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Pages" };

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminPagesPage() {
  await requireAdmin();
  const [pages, { general }] = await Promise.all([getPagesForAdmin(), getSettings()]);
  const tokens = { site: general.siteName, email: general.contactEmail, url: siteUrl() };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
        <p className="text-sm text-muted-foreground">
          Each page starts from a template. Read it, adjust it to your site, and publish it. Published pages are linked in
          the footer.
        </p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {pages.map((page) => (
          <li key={page.slug} className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{fillTokens(page.title, tokens)}</h2>
                <p className="text-sm text-muted-foreground">/{page.slug}</p>
              </div>
              {page.published ? <Badge>Published</Badge> : <Badge variant="secondary">Not published</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{page.purpose}</p>
            <div className="mt-auto flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {page.updatedAt ? `Edited ${dateFormat.format(page.updatedAt)}` : "Not edited yet"}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/pages/${page.slug}`}>
                  <PencilIcon data-icon="inline-start" aria-hidden />
                  {page.updatedAt ? "Edit" : "Review & publish"}
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
