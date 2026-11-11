import { z } from "zod";

/** Splits "Sid Sriram, Shreya Ghoshal" into names, dropping blanks and repeats. */
export function parseNames(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split(",")
    .map((name) => name.trim().replace(/\s+/g, " "))
    .filter((name) => {
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Unifies line endings, trims trailing spaces and keeps at most one blank line between verses. */
export function normalizeLyrics(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .transform((v) => v || null);

const optionalLink = z
  .string()
  .trim()
  .refine((v) => v === "" || (URL.canParse(v) && /^https?:$/.test(new URL(v).protocol)), {
    message: "Paste the full link, starting with https://",
  })
  .transform((v) => v || null);

const names = z.string().max(500, "Too many names").transform(parseNames);

const lyrics = z.string().max(20_000, "Lyrics are too long").transform(normalizeLyrics);

export const songFormSchema = z
  .object({
    intent: z.enum(["draft", "publish"]),
    title: z.string().trim().min(1, "Enter the song title in English letters").max(150),
    titleTamil: optionalText(150),
    slug: z.string().trim().max(80),
    singers: names,
    music: names,
    lyricists: names,
    album: optionalText(150),
    releaseYear: z
      .string()
      .trim()
      .refine((v) => v === "" || (/^\d{4}$/.test(v) && +v >= 1900 && +v <= 2100), {
        message: "Enter a 4-digit year",
      })
      .transform((v) => (v ? Number(v) : null)),
    youtubeUrl: optionalLink,
    spotifyUrl: optionalLink,
    lyricsTamil: lyrics,
    lyricsTanglish: lyrics,
    about: z.string().max(3000, "Keep this under 3000 characters").transform((v) => normalizeLyrics(v) || null),
    seoTitle: optionalText(70),
    seoDescription: optionalText(200),
    featured: z.boolean(),
    hideAds: z.boolean(),
    adminNote: optionalText(1000),
    removeCover: z.boolean(),
  })
  .superRefine((song, ctx) => {
    // Drafts may be incomplete; a published song needs what the song page shows.
    if (song.intent !== "publish") return;
    const required: [keyof typeof song, boolean, string][] = [
      ["singers", song.singers.length > 0, "Add at least one singer before publishing"],
      ["lyricsTamil", song.lyricsTamil.length > 0, "Add the Tamil lyrics before publishing"],
      ["lyricsTanglish", song.lyricsTanglish.length > 0, "Add the English lyrics before publishing"],
    ];
    for (const [field, ok, message] of required) {
      if (!ok) ctx.addIssue({ code: "custom", path: [field], message });
    }
  });

export type SongFormField = keyof z.input<typeof songFormSchema> | "cover";

export type SongFormState = {
  error?: string;
  fieldErrors?: Partial<Record<SongFormField, string[]>>;
};
