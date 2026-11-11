import { SiteFooter, SiteHeader } from "@/components/site/site-header";
import { requireAdmin } from "@/lib/auth/session";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

/** Admin previews show pages exactly as visitors will see them, with the public header and footer. */
export default async function PreviewLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="site flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
