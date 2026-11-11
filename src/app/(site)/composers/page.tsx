import type { Metadata } from "next";
import { ArtistIndex } from "@/components/site/artist-index";
import { getArtistsByRole } from "@/lib/songs/queries";

export const metadata: Metadata = {
  title: "Tamil Music Composers",
  description: "Tamil music composers and the lyrics of the songs they composed.",
  alternates: { canonical: "/composers" },
};

export default async function ComposersPage() {
  return (
    <ArtistIndex
      title="Composers"
      intro="Music directors and composers, with the lyrics of every song of theirs on the site."
      artists={await getArtistsByRole("MUSIC")}
    />
  );
}
