import { NotFoundMessage } from "@/components/site/not-found-message";
import { SiteFooter, SiteHeader } from "@/components/site/site-header";

// Shown for URLs that match no route; it renders outside the site layout, so it adds the header itself.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        <NotFoundMessage />
      </main>
      <SiteFooter />
    </>
  );
}
