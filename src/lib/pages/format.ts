// A deliberately small text format for the editable pages, so no Markdown library is needed:
//   "## Heading"     a heading
//   "- item"         a list item (consecutive ones form a list)
//   blank line       starts a new paragraph; single line breaks are kept
// Links and email addresses become clickable when the page is shown (see PageBody).

export type PageBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; items: string[] };

export function parsePageBody(body: string): PageBlock[] {
  const blocks: PageBlock[] = [];
  let last: PageBlock | undefined;

  for (const raw of body.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      last = undefined;
    } else if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: line.slice(3).trim() });
      last = undefined;
    } else if (/^[-*] /.test(line)) {
      if (last?.type !== "list") blocks.push((last = { type: "list", items: [] }));
      last.items.push(line.slice(2).trim());
    } else {
      if (last?.type !== "paragraph") blocks.push((last = { type: "paragraph", lines: [] }));
      last.lines.push(line);
    }
  }
  return blocks;
}

/** The first paragraph as plain text, used as the page's meta description. */
export function pageSummary(body: string, max = 160) {
  const first = parsePageBody(body).find((block) => block.type === "paragraph");
  const text = first?.type === "paragraph" ? first.lines.join(" ") : "";
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

const LINK = /(https?:\/\/[^\s<>]*[^\s<>.,;:!?)\]'"]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** Splits text into plain parts and links (web addresses and email addresses). */
export function splitLinks(text: string): { text: string; href?: string }[] {
  return text
    .split(LINK)
    .filter(Boolean)
    .map((part) =>
      /^https?:\/\//.test(part)
        ? { text: part, href: part }
        : /^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(part)
          ? { text: part, href: `mailto:${part}` }
          : { text: part },
    );
}
