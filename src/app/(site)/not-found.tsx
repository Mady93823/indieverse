import { Container } from "@/components/site/container";
import { NotFoundMessage } from "@/components/site/not-found-message";

// Shown inside the site layout when a song or artist page calls notFound().
export default function SiteNotFound() {
  return (
    <Container>
      <NotFoundMessage />
    </Container>
  );
}
