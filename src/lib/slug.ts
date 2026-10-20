/**
 * Turns a name into a URL slug: "Kannaana Kanne!" -> "kannaana-kanne".
 * Accents on Latin letters are dropped, but Tamil letters and vowel signs are kept,
 * so a Tamil-only artist name still gets a readable slug.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
