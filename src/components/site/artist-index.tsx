import { ArtistCard } from "@/components/site/artist-card";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import type { ArtistSummary } from "@/lib/songs/queries";

/** A grid of artist photo cards under a page header, for /lyricists and /composers. */
export function ArtistIndex({
  title,
  intro,
  artists,
}: {
  title: string;
  intro: string;
  artists: ArtistSummary[];
}) {
  return (
    <>
      <PageHeader title={title}>
        {intro}
      </PageHeader>
      <Container className="pb-20">
        {artists.length === 0 ? (
          <p className="text-muted-foreground">No one here yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {artists.map((artist) => (
              <li key={artist.slug}>
                <ArtistCard artist={artist} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
