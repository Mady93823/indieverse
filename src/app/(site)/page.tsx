import { SearchBox } from "@/components/site/search-box";
import { SongCard, SongGrid } from "@/components/site/song-card";
import { getPopularSongs, getRecentSongs } from "@/lib/songs/queries";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-5 py-10 sm:px-10 sm:py-14">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Tamil indie & I-pop lyrics, in <span lang="ta">தமிழ்</span> and English
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Find a song by its name or by the artist, then read the lyrics in the script you prefer.
        </p>
        <SearchBox size="lg" className="mt-6 max-w-xl" />
      </section>

      <RecentSongs />
      <PopularSongs />
    </div>
  );
}

// Both lists come from cached queries, so they're part of the prerendered page
// and refresh when an admin publishes or edits a song.
async function RecentSongs() {
  const songs = await getRecentSongs();
  return (
    <section aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="mb-4 text-xl font-semibold tracking-tight">
        Recently added
      </h2>
      {songs.length === 0 ? (
        <p className="text-muted-foreground">No songs yet. Check back soon.</p>
      ) : (
        <SongGrid>
          {songs.map((song) => (
            <SongCard key={song.slug} song={song} />
          ))}
        </SongGrid>
      )}
    </section>
  );
}

async function PopularSongs() {
  const songs = await getPopularSongs();
  if (songs.length === 0) return null;
  return (
    <section aria-labelledby="popular-heading">
      <h2 id="popular-heading" className="mb-4 text-xl font-semibold tracking-tight">
        Popular
      </h2>
      <SongGrid>
        {songs.map((song) => (
          <SongCard key={song.slug} song={song} />
        ))}
      </SongGrid>
    </section>
  );
}
