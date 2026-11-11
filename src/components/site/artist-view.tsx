import { ExternalLinkIcon } from "lucide-react";
import { AdPlacement } from "@/components/site/ad-placement";
import { ArtistMonogram } from "@/components/site/artist-chip";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";
import { LyricCard, songMeta } from "@/components/site/song-card";
import type { ArtistDetail } from "@/lib/songs/queries";
import type { CreditRole } from "@/generated/prisma/client";

const ROLE_NOUNS: Record<CreditRole, string> = { SINGER: "singer", MUSIC: "composer", LYRICS: "lyricist" };
const ROLE_ORDER: CreditRole[] = ["SINGER", "MUSIC", "LYRICS"];
const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** An artist's page content. `adPreview` shows a numbered box where the ad goes (the admin's ad preview). */
export function ArtistView({ artist, adPreview = false }: { artist: ArtistDetail; adPreview?: boolean }) {
  const roles = ROLE_ORDER.filter((role) => artist.songs.some((song) => song.roles.includes(role)));
  const count = artist.songs.length;
  const links = [
    artist.instagramUrl && { label: "Instagram", href: artist.instagramUrl },
    artist.youtubeUrl && { label: "YouTube", href: artist.youtubeUrl },
    artist.spotifyUrl && { label: "Spotify", href: artist.spotifyUrl },
  ].filter((link) => !!link);

  return (
    <div>
      <Container className="flex flex-col gap-14 py-12 sm:py-16">
        <header className="grid items-end gap-6 sm:grid-cols-[180px_1fr] sm:gap-8 lg:grid-cols-[240px_1fr]">
          <ArtistMonogram
            name={artist.name}
            slug={artist.slug}
            photo={artist.photo}
            size={240}
            className="size-32 rounded-3xl text-6xl sm:size-[180px] sm:text-7xl lg:size-60"
          />
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground capitalize">{roles.map((r) => ROLE_NOUNS[r]).join(" · ")}</p>
            <h1 className="text-4xl leading-tight font-normal tracking-tight text-balance break-words sm:text-5xl">
              {artist.name}
            </h1>
            {artist.nameTamil && (
              <p lang="ta" className="text-xl text-foreground/75">
                {artist.nameTamil}
              </p>
            )}
            <p className="text-muted-foreground">
              {count} {count === 1 ? "song" : "songs"} in the archive as {listFormat.format(roles.map((r) => ROLE_NOUNS[r]))}
            </p>
            {links.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/25"
                  >
                    {link.label}
                    <ExternalLinkIcon className="size-3.5" aria-hidden />
                  </a>
                ))}
              </div>
            )}
          </div>
        </header>

        {artist.bio && (
          <section aria-labelledby="artist-bio" className="max-w-3xl">
            <h2 id="artist-bio" className="mb-2 text-lg font-semibold">
              About {artist.name}
            </h2>
            {artist.bio.split(/\n{2,}/).map((paragraph, i) => (
              <p key={i} className="mb-3 text-base leading-relaxed text-pretty whitespace-pre-line text-foreground/90 sm:text-lg">
                {paragraph}
              </p>
            ))}
          </section>
        )}

        <section aria-labelledby="artist-songs">
          <SectionHeading id="artist-songs" title="Song lyrics" />
          <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {artist.songs.map((song) => (
              <li key={song.slug}>
                <LyricCard
                  song={song}
                  detail={[
                    capitalize(listFormat.format(ROLE_ORDER.filter((r) => song.roles.includes(r)).map((r) => ROLE_NOUNS[r]))),
                    songMeta(song),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </li>
            ))}
          </ul>
        </section>
        <AdPlacement id="artistAfterSongs" preview={adPreview} className="my-0" />
      </Container>
    </div>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
