import type { Metadata } from "next";
import { ArtistIndex } from "@/components/site/artist-index";
import { getArtistsByRole } from "@/lib/songs/queries";

export const metadata: Metadata = {
  title: "Tamil Lyricists",
  description: "The lyricists behind Tamil songs, with the lyrics of every song they wrote on the site.",
  alternates: { canonical: "/lyricists" },
};

export default async function LyricistsPage() {
  return (
    <ArtistIndex
      title="Lyricists"
      intro="The poets behind the songs, with the lyrics of everything they wrote on the site."
      artists={await getArtistsByRole("LYRICS")}
    />
  );
}
