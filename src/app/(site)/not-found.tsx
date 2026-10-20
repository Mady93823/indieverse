import { NotFoundMessage } from "@/components/site/not-found-message";

// Shown inside the site layout when a song or artist page calls notFound().
export default function SiteNotFound() {
  return <NotFoundMessage />;
}
