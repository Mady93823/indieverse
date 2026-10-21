import Link from "next/link";
import { ExternalLinkIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/session";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Link href="/admin" className="mr-auto font-semibold">
            IndieVerse <span className="font-normal text-muted-foreground">Admin</span>
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">{admin.name}</span>
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
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
