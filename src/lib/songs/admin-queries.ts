import "server-only";
import { db } from "@/lib/db";
import { songDetailInclude, toSongDetail } from "@/lib/songs/queries";
import type { CreditRole, Prisma } from "@/generated/prisma/client";

// Admin reads are never cached: the panel always shows the current state.

export const SONG_FILTERS = ["all", "published", "drafts", "featured"] as const;
export const SONG_SORTS = ["updated", "views", "title"] as const;
export const ADMIN_PAGE_SIZE = 50;

export type SongListOptions = {
  q: string;
  filter: (typeof SONG_FILTERS)[number];
  sort: (typeof SONG_SORTS)[number];
  page: number;
};

export async function listSongsForAdmin({ q: rawQuery, filter, sort, page }: SongListOptions) {
  const q = rawQuery.trim().slice(0, 100);
  const contains = { contains: q, mode: "insensitive" } as const;

  const where: Prisma.SongWhereInput = {
    ...(filter === "published" && { status: "PUBLISHED" }),
    ...(filter === "drafts" && { status: "DRAFT" }),
    ...(filter === "featured" && { featured: true }),
    ...(q && {
      OR: [
        { title: contains },
        { titleTamil: contains },
        { album: contains },
        { credits: { some: { artist: { name: contains } } } },
      ],
    }),
  };
  const orderBy: Prisma.SongOrderByWithRelationInput[] =
    sort === "views" ? [{ views: "desc" }, { id: "desc" }] : sort === "title" ? [{ title: "asc" }] : [{ updatedAt: "desc" }];

  const [songs, total] = await Promise.all([
    db.song.findMany({
      where,
      orderBy,
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        titleTamil: true,
        coverImage: true,
        status: true,
        featured: true,
        views: true,
        updatedAt: true,
        credits: {
          where: { role: "SINGER" },
          orderBy: { position: "asc" },
          select: { artist: { select: { name: true } } },
        },
      },
    }),
    db.song.count({ where }),
  ]);

  return {
    total,
    songs: songs.map(({ credits, ...song }) => ({ ...song, singers: credits.map((c) => c.artist.name) })),
  };
}

/** Everything the dashboard shows, in one round of queries. */
export async function getDashboardData() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [byStatus, views, addedThisMonth, latest, drafts, top, incomplete] = await Promise.all([
    db.song.groupBy({ by: ["status"], _count: true }),
    db.song.aggregate({ _sum: { views: true } }),
    db.song.count({ where: { createdAt: { gte: monthStart } } }),
    db.song.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        coverImage: true,
        status: true,
        credits: {
          where: { role: "SINGER" },
          orderBy: { position: "asc" },
          take: 2,
          select: { artist: { select: { name: true } } },
        },
      },
    }),
    db.song.findMany({
      where: { status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, coverImage: true, updatedAt: true },
    }),
    db.song.findMany({
      where: { status: "PUBLISHED", views: { gt: 0 } },
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, slug: true, title: true, coverImage: true, views: true },
    }),
    db.song.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ coverImage: null }, { about: null }, { lyricsTanglish: "" }, { youtubeUrl: null }],
      },
      orderBy: { views: "desc" },
      select: { id: true, title: true, coverImage: true, about: true, lyricsTanglish: true, youtubeUrl: true },
    }),
  ]);

  const count = (status: "PUBLISHED" | "DRAFT") => byStatus.find((row) => row.status === status)?._count ?? 0;
  return {
    published: count("PUBLISHED"),
    drafts: count("DRAFT"),
    views: views._sum.views ?? 0,
    addedThisMonth,
    latest: latest.map(({ credits, ...song }) => ({ ...song, singers: credits.map((c) => c.artist.name) })),
    recentDrafts: drafts,
    topSongs: top,
    needsAttention: incomplete.map((song) => ({
      id: song.id,
      title: song.title,
      missing: [
        !song.coverImage && "cover",
        !song.about && "About text",
        !song.lyricsTanglish && "English lyrics",
        !song.youtubeUrl && "YouTube link",
      ].filter((label): label is string => !!label),
    })),
  };
}

export type SongFormValues = {
  id: number;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  title: string;
  titleTamil: string;
  singers: string;
  music: string;
  lyricists: string;
  album: string;
  releaseYear: string;
  youtubeUrl: string;
  spotifyUrl: string;
  coverImage: string | null;
  lyricsTamil: string;
  lyricsTanglish: string;
  about: string;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  hideAds: boolean;
  adminNote: string;
};

/** Loads a song shaped for the edit form (names joined with commas, empty strings for blanks). */
export async function getSongForEdit(id: number): Promise<SongFormValues | null> {
  const song = await db.song.findUnique({
    where: { id },
    include: {
      credits: {
        orderBy: { position: "asc" },
        select: { role: true, artist: { select: { name: true } } },
      },
    },
  });
  if (!song) return null;

  const names = (role: CreditRole) =>
    song.credits
      .filter((c) => c.role === role)
      .map((c) => c.artist.name)
      .join(", ");

  return {
    id: song.id,
    slug: song.slug,
    status: song.status,
    title: song.title,
    titleTamil: song.titleTamil ?? "",
    singers: names("SINGER"),
    music: names("MUSIC"),
    lyricists: names("LYRICS"),
    album: song.album ?? "",
    releaseYear: song.releaseYear?.toString() ?? "",
    youtubeUrl: song.youtubeUrl ?? "",
    spotifyUrl: song.spotifyUrl ?? "",
    coverImage: song.coverImage,
    lyricsTamil: song.lyricsTamil,
    lyricsTanglish: song.lyricsTanglish,
    about: song.about ?? "",
    seoTitle: song.seoTitle ?? "",
    seoDescription: song.seoDescription ?? "",
    featured: song.featured,
    hideAds: song.hideAds,
    adminNote: song.adminNote ?? "",
  };
}

/** Existing artist and album names, suggested while typing so the same name isn't spelled two ways. */
export async function getNameSuggestions() {
  const [artists, albums] = await Promise.all([
    db.artist.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.song.findMany({
      where: { album: { not: null } },
      distinct: ["album"],
      orderBy: { album: "asc" },
      select: { album: true },
    }),
  ]);
  return { artists: artists.map((a) => a.name), albums: albums.flatMap((s) => (s.album ? [s.album] : [])) };
}

/** Any song, draft or published, shaped like the public song page. For the admin preview. */
export async function getSongForPreview(id: number) {
  const song = await db.song.findUnique({ where: { id }, include: songDetailInclude });
  return song ? toSongDetail(song) : null;
}

/** The published song with the most verses, so the ad preview can show the "inside long lyrics" place. */
export async function getSongForAdPreview() {
  // Verses are separated by a blank line, as in the lyrics reader.
  const [row] = await db.$queryRaw<{ id: number }[]>`
    SELECT id FROM songs
    WHERE status = 'PUBLISHED'
    ORDER BY array_length(regexp_split_to_array(lyrics_tamil, '\\n\\s*\\n'), 1) DESC, views DESC
    LIMIT 1`;
  return row ? getSongForPreview(row.id) : null;
}
