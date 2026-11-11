import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import type { DecadeSummary } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

/** "1990s" → 1990–1999, "2026" → that year only. Null for anything else. */
export function parsePeriod(value: string) {
  const decade = value.match(/^(\d{3}0)s$/);
  if (decade) {
    const from = Number(decade[1]);
    return { from, to: from + 9, label: `${from}s` };
  }
  if (/^\d{4}$/.test(value)) {
    const year = Number(value);
    return { from: year, to: year, label: value };
  }
  return null;
}

/**
 * Decades that have songs, oldest first. Empty decades are left out so no tile leads to an empty page.
 * `year` keeps the signature stable for callers; the current decade appears once it has songs.
 */
export function periods(decades: DecadeSummary[], year: number) {
  return decades
    .filter((d) => d.songs > 0 && d.decade <= year)
    .map((d) => ({ label: `${d.decade}s`, songs: d.songs }));
}

export function DecadeGrid({ decades, year, className }: { decades: DecadeSummary[]; year: number; className?: string }) {
  const shown = periods(decades, year);
  if (shown.length === 0) {
    return <p className="text-muted-foreground">Songs appear here by decade once they have a release year.</p>;
  }
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", className)}>
      {shown.map((period) => (
        <li key={period.label}>
          <Link
            href={`/decades/${period.label}`}
            className="group flex h-24 flex-col justify-between rounded-2xl border bg-card p-4 transition-[border-color,box-shadow] outline-none hover:border-pink hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex items-start justify-between text-xl font-semibold">
              {period.label}
              <ArrowUpRightIcon className="size-4 text-muted-foreground group-hover:text-pink" aria-hidden />
            </span>
            <span className="text-sm text-muted-foreground">
              {period.songs} {period.songs === 1 ? "song" : "songs"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
