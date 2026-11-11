import type { Viewport } from "next";
import { AdsenseScript } from "@/components/site/ad-placement";
import { SiteFooter, SiteHeader } from "@/components/site/site-header";

// The public site has its own light look (see .site in globals.css); phones tint their bars to match.
export const viewport: Viewport = { themeColor: "#ffffff" };

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="site flex flex-1 flex-col">
      <AdsenseScript />
      <SiteHeader />
      {/* Pages set their own width (see Container) so bands can span the full screen. */}
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
