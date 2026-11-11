import { z } from "zod";

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

export const artistFormSchema = z.object({
  name: z.string().trim().min(1, "Enter the artist's name").max(100),
  nameTamil: optionalText(100),
  slug: z.string().trim().max(80),
  bio: z
    .string()
    .max(3000, "Keep this under 3000 characters")
    .transform((v) => v.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim() || null),
  instagramUrl: optionalLink,
  youtubeUrl: optionalLink,
  spotifyUrl: optionalLink,
});
