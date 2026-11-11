// Pairs the Tamil and Tanglish lyrics line by line. Both are written verse by verse, with an
// empty line between verses, so the n-th line of a verse in one matches the n-th in the other.

export type LyricLine = { ta?: string; en?: string };
export type Verse = LyricLine[];

const split = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((verse) => verse.split("\n").map((line) => line.trim()).filter(Boolean))
    .filter((verse) => verse.length > 0);

export function pairLyrics(tamil: string, english: string): Verse[] {
  const ta = split(tamil);
  const en = split(english);
  return Array.from({ length: Math.max(ta.length, en.length) }, (_, v) =>
    Array.from({ length: Math.max(ta[v]?.length ?? 0, en[v]?.length ?? 0) }, (_, i) => ({ ta: ta[v]?.[i], en: en[v]?.[i] })),
  );
}

export function countLines(verses: Verse[]) {
  return verses.reduce((sum, verse) => sum + verse.length, 0);
}

/** The first `max` lines, keeping their verses. */
export function takeLines(verses: Verse[], max: number): Verse[] {
  const taken: Verse[] = [];
  let left = max;
  for (const verse of verses) {
    if (left <= 0) break;
    taken.push(verse.slice(0, left));
    left -= verse.length;
  }
  return taken;
}
