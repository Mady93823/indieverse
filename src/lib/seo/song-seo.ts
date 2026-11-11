// The automatic search title and description of a song page, used unless the admin writes their own.
// Shared by the page metadata and the editor's search preview.

type SongText = {
  title: string;
  titleTamil: string | null;
  singers: string[];
  music: string[];
  lyricsTamil: string;
  lyricsTanglish: string;
};

const DESCRIPTION_MAX = 160;

export function songSeoDefaults(song: SongText) {
  const name = song.titleTamil ? `${song.title} (${song.titleTamil})` : song.title;
  const by = song.singers.join(", ");
  const firstLine = (song.lyricsTanglish || song.lyricsTamil)
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  const description = [
    `${name} song lyrics in Tamil and English${by ? ` by ${by}` : ""}.`,
    song.music.length > 0 && `Music: ${song.music.join(", ")}.`,
    firstLine && `“${firstLine}…”`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: `${song.title} Lyrics${song.titleTamil ? ` (${song.titleTamil})` : ""}${by ? ` – ${by}` : ""}`,
    description: description.length > DESCRIPTION_MAX ? `${description.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…` : description,
  };
}
