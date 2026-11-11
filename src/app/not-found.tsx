import { Container } from "@/components/site/container";
import { NotFoundMessage } from "@/components/site/not-found-message";
import { SiteFooter, SiteHeader } from "@/components/site/site-header";

// Shown for URLs that match no route; it renders outside the site layout, so it adds the header itself.
export default function NotFound() {
  return (
    <div className="site flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Container>
          <NotFoundMessage />
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
