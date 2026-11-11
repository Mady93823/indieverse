import Link from "next/link";
import { ExternalLinkIcon, LogOutIcon } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings/queries";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const [admin, { general }] = await Promise.all([requireAdmin(), getSettings()]);
  const isOwner = admin.role === "OWNER";

  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 lg:px-6">
          <Link href="/admin" className="mr-auto font-semibold">
            {general.siteName} <span className="font-normal text-muted-foreground">Admin</span>
          </Link>
          <span className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            {admin.name}
            {!isOwner && <Badge variant="secondary">Editor</Badge>}
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" target="_blank">
              View site
              <ExternalLinkIcon data-icon="inline-end" aria-hidden />
            </Link>
          </Button>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOutIcon data-icon="inline-start" aria-hidden />
              Log out
            </Button>
          </form>
        </div>
        <div className="lg:hidden">
          <AdminNav isOwner={isOwner} variant="tabs" />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 lg:px-6">
        <aside className="hidden w-48 shrink-0 lg:block">
          <AdminNav isOwner={isOwner} variant="sidebar" />
        </aside>
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
