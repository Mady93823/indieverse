import { SiteFooter, SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {/* Pages set their own width (see Container) so song headers can span the full screen. */}
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
