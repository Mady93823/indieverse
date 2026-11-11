// schema.org descriptions of pages, so search engines understand songs, artists and the site.
// Each returns plain data for <JsonLd>. Empty values are dropped by JSON.stringify (undefined).

import type { ArtistDetail, ArtistLink, SongDetail } from "@/lib/songs/queries";

type Site = { name: string; nameTamil: string; url: string; logo: string };

const person = (site: Site) => (artist: ArtistLink) => ({
  "@type": "Person",
  name: artist.name,
  url: `${site.url}/artists/${artist.slug}`,
});

export function songJsonLd(song: SongDetail, site: Site) {
  const url = `${site.url}/songs/${song.slug}`;
  const mainArtist = song.singers[0] ?? song.music[0];
  const links = [song.youtubeUrl, song.spotifyUrl].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicRecording",
        "@id": `${url}#recording`,
        name: song.title,
        alternateName: song.titleTamil ?? undefined,
        url,
        image: song.coverImage ? `${site.url}${song.coverImage}` : undefined,
        datePublished: song.publishedAt?.toISOString().slice(0, 10),
        byArtist: song.singers.map((artist) => ({
          "@type": "MusicGroup",
          name: artist.name,
          url: `${site.url}/artists/${artist.slug}`,
        })),
        inAlbum: song.album ? { "@type": "MusicAlbum", name: song.album } : undefined,
        sameAs: links.length > 0 ? links : undefined,
        recordingOf: {
          "@type": "MusicComposition",
          name: song.title,
          inLanguage: "ta",
          composer: song.music.map(person(site)),
          lyricist: song.lyricists.map(person(site)),
          lyrics: { "@type": "CreativeWork", inLanguage: "ta", text: song.lyricsTamil },
        },
      },
      breadcrumbs(site, [
        mainArtist && { name: mainArtist.name, url: `${site.url}/artists/${mainArtist.slug}` },
        { name: song.title, url },
      ]),
    ],
  };
}

export function artistJsonLd(artist: ArtistDetail, site: Site) {
  const url = `${site.url}/artists/${artist.slug}`;
  const links = [artist.instagramUrl, artist.youtubeUrl, artist.spotifyUrl].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        // schema.org uses MusicGroup for solo musicians too.
        "@type": "MusicGroup",
        "@id": `${url}#artist`,
        name: artist.name,
        alternateName: artist.nameTamil ?? undefined,
        url,
        image: artist.photo ? `${site.url}${artist.photo}` : undefined,
        description: artist.bio ?? undefined,
        sameAs: links.length > 0 ? links : undefined,
        track: artist.songs.map((song) => ({
          "@type": "MusicRecording",
          name: song.title,
          url: `${site.url}/songs/${song.slug}`,
        })),
      },
      breadcrumbs(site, [
        { name: "Artists", url: `${site.url}/artists` },
        { name: artist.name, url },
      ]),
    ],
  };
}

/** The site's name and logo, for the name Google shows next to results. */
export function siteJsonLd(site: Site) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        alternateName: site.nameTamil || undefined,
        url: `${site.url}/`,
        inLanguage: ["ta", "en"],
      },
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: `${site.url}/`,
        logo: site.logo,
      },
    ],
  };
}

function breadcrumbs(site: Site, trail: (false | null | undefined | { name: string; url: string })[]) {
  const items = [{ name: "Home", url: `${site.url}/` }, ...trail.filter((item) => !!item)];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}
