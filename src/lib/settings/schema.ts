import { z } from "zod";

// Site settings are stored as one JSON value per group (see the Setting model).
// Each group has a schema, used to check the admin's input, and defaults, used for anything
// not saved yet. That way a new setting needs no database migration.

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);

const link = z
  .string()
  .trim()
  .refine((v) => v === "" || (URL.canParse(v) && /^https?:$/.test(new URL(v).protocol)), {
    message: "Paste the full link, starting with https://",
  });

/** Accepts the code on its own or the whole <meta> tag Google and Bing show, and keeps only the code. */
const verificationCode = z
  .string()
  .trim()
  .transform((v) => v.match(/content=["']([^"']*)["']/)?.[1] ?? v)
  .pipe(z.string().max(100).regex(/^[\w-]*$/, "Paste the code from the verification tag"));

/** An uploaded brand image: its id and pixel size. See saveBrandImage in src/lib/uploads.ts for its files. */
const brandImage = z
  .object({ id: z.string().regex(/^[0-9a-f-]{36}$/), width: z.number().int().positive(), height: z.number().int().positive() })
  .nullable();

export const generalSchema = z.object({
  siteName: text(40).min(1, "Enter the site name"),
  siteNameTamil: text(40),
  tagline: text(80),
  contactEmail: z.string().trim().pipe(z.union([z.literal(""), z.email("Enter a valid email address")])),
  footerText: text(200),
  instagramUrl: link,
  youtubeUrl: link,
  xUrl: link,
  facebookUrl: link,
});

export const homeSchema = z.object({
  eyebrow: text(60),
  headline: text(90).min(1, "Enter a headline"),
  intro: text(220),
  // Comma-separated searches shown as "Popular" chips. Empty means popular songs and artists.
  trySearches: text(200),
  showNewsletter: z.boolean(),
  newsletterTitle: text(90),
  newsletterText: text(220),
});

export const brandingSchema = z.object({
  mark: brandImage,
  logo: brandImage,
  logoDark: brandImage,
  shareImage: brandImage,
  hero: brandImage,
});

export const seoSchema = z.object({
  homeTitle: text(70),
  homeDescription: text(200),
  googleVerification: verificationCode,
  bingVerification: verificationCode,
  hideFromSearch: z.boolean(),
});

// The fixed places where ads can appear. Their order gives each one its number in the admin's ad map.
export const AD_PLACEMENTS = [
  {
    id: "songAfterLyrics",
    page: "song",
    short: "After the lyrics",
    label: "Song page, after the lyrics",
    hint: "Recommended first. Readers see it once they've finished the song.",
  },
  {
    id: "homeBetweenShelves",
    page: "home",
    short: "Between the lists",
    label: "Home page, between the lists",
    hint: "Recommended first.",
  },
  {
    id: "songBeforeLyrics",
    page: "song",
    short: "Before the lyrics",
    label: "Song page, before the lyrics",
    hint: "Add after a couple of weeks if the page still loads fast.",
  },
  {
    id: "artistAfterSongs",
    page: "artist",
    short: "After the songs",
    label: "Artist page, after the song list",
    hint: "",
  },
  {
    id: "songInLyrics",
    page: "song",
    short: "Inside long lyrics",
    label: "Song page, inside long lyrics",
    hint: "After the 3rd verse, only in songs with 5 or more verses. It interrupts reading, so use it sparingly.",
  },
] as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[number]["id"];
export type AdPage = (typeof AD_PLACEMENTS)[number]["page"];

/** 1 for the first place in AD_PLACEMENTS, and so on. */
export function placementNumber(id: AdPlacement) {
  return AD_PLACEMENTS.findIndex((p) => p.id === id) + 1;
}

const placement = z.object({
  enabled: z.boolean(),
  slot: z.string().trim().regex(/^\d{0,20}$/, "The slot ID is a number, e.g. 1234567890"),
});

export const adsSchema = z
  .object({
    enabled: z.boolean(),
    // Accepts "pub-…", "ca-pub-…" or a pasted ads.txt line or script tag, and stores "ca-pub-…".
    publisherId: z
      .string()
      .trim()
      .transform((v) => {
        const id = v.match(/pub-\d{16}/)?.[0];
        return id ? `ca-${id}` : v;
      })
      .pipe(z.union([z.literal(""), z.string().regex(/^ca-pub-\d{16}$/)], "Paste the ID from AdSense, e.g. ca-pub-1234567890123456")),
    placements: z.object({
      songAfterLyrics: placement,
      homeBetweenShelves: placement,
      songBeforeLyrics: placement,
      artistAfterSongs: placement,
      songInLyrics: placement,
    }),
  })
  .superRefine((ads, ctx) => {
    if (ads.enabled && !ads.publisherId) {
      ctx.addIssue({ code: "custom", path: ["enabled"], message: "Add your publisher ID before turning ads on" });
    }
    for (const { id } of AD_PLACEMENTS) {
      if (ads.placements[id].enabled && !ads.placements[id].slot) {
        ctx.addIssue({ code: "custom", path: ["placements", id, "slot"], message: "Add the ad unit's slot ID" });
      }
    }
  });

export const SETTINGS_SCHEMAS = {
  general: generalSchema,
  home: homeSchema,
  branding: brandingSchema,
  seo: seoSchema,
  ads: adsSchema,
};

export type SettingsGroup = keyof typeof SETTINGS_SCHEMAS;

export type SiteSettings = { [K in SettingsGroup]: z.output<(typeof SETTINGS_SCHEMAS)[K]> };

const placementOff = { enabled: false, slot: "" };

export const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    siteName: "Isai Varigal",
    siteNameTamil: "இசை வரிகள்",
    tagline: "Tamil Song Lyrics in Tamil & Tanglish",
    contactEmail: "",
    footerText: "A living archive of Tamil song lyrics, preserved in Tamil and made accessible through Tanglish.",
    instagramUrl: "",
    youtubeUrl: "",
    xUrl: "",
    facebookUrl: "",
  },
  home: {
    eyebrow: "Tamil music, line by line",
    headline: "Every Tamil song lyric, beautifully archived.",
    intro:
      "Read original Tamil lyrics alongside clear Tanglish transliterations. Search by song, film, singer, composer or lyricist.",
    trySearches: "",
    showNewsletter: true,
    newsletterTitle: "New lyrics, old favourites, one thoughtful email.",
    newsletterText: "Get the week's new lyrics and forgotten gems, and help us correct and preserve the archive.",
  },
  branding: { mark: null, logo: null, logoDark: null, shareImage: null, hero: null },
  seo: {
    homeTitle: "",
    homeDescription: "",
    googleVerification: "",
    bingVerification: "",
    hideFromSearch: false,
  },
  ads: {
    enabled: false,
    publisherId: "",
    placements: {
      songAfterLyrics: placementOff,
      homeBetweenShelves: placementOff,
      songBeforeLyrics: placementOff,
      artistAfterSongs: placementOff,
      songInLyrics: placementOff,
    },
  },
};

/**
 * Reads a stored group field by field, so one value that no longer passes
 * (say, after a rule changed) falls back to its default without losing the rest.
 */
export function readGroup<K extends SettingsGroup>(group: K, stored: unknown): SiteSettings[K] {
  const defaults = DEFAULT_SETTINGS[group];
  if (!stored || typeof stored !== "object") return defaults;

  const shape = SETTINGS_SCHEMAS[group].shape as Record<string, z.ZodType>;
  const result: Record<string, unknown> = { ...defaults };
  for (const [key, field] of Object.entries(shape)) {
    if (!(key in stored)) continue;
    const parsed = field.safeParse((stored as Record<string, unknown>)[key]);
    if (parsed.success) result[key] = parsed.data;
  }
  return result as SiteSettings[K];
}
