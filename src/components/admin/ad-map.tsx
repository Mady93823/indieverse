import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { AD_PLACEMENTS, placementNumber, type AdPage, type AdPlacement } from "@/lib/settings/schema";
import { cn } from "@/lib/utils";

/**
 * Small phone-sized sketches of the song, home and artist pages, with each ad place numbered
 * (the same numbers as the settings below) and coloured by whether it's switched on.
 */
export function AdMap({ on }: { on: Record<AdPlacement, boolean> }) {
  const ad = (id: AdPlacement) => <AdBox id={id} on={on[id]} />;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Sketch page="song" title="Song page">
        <Band />
        {ad("songBeforeLyrics")}
        <Card>
          <Pairs count={2} />
          <Pairs count={2} />
          <Pairs count={2} />
        </Card>
        {ad("songInLyrics")}
        <Card>
          <Pairs count={2} />
        </Card>
        <div aria-hidden className="h-6 rounded-md bg-muted" />
        {ad("songAfterLyrics")}
        <Posters />
      </Sketch>
      <Sketch page="home" title="Home page">
        <div aria-hidden className="flex flex-col items-center gap-1.5 rounded-md bg-muted/70 px-2 py-3">
          <Bar width={80} thick />
          <Bar width={55} thick />
          <span className="mt-1 h-3 w-full rounded-full bg-background" />
        </div>
        <Posters />
        <div aria-hidden className="flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex items-center gap-1.5 rounded border p-1">
              <span className="size-3 shrink-0 rounded-sm bg-muted" />
              <Bar width={60} />
            </span>
          ))}
        </div>
        {ad("homeBetweenShelves")}
        <div aria-hidden className="grid grid-cols-[2fr_3fr] gap-1 rounded-md bg-muted/70 p-1.5">
          <span className="aspect-square rounded bg-muted-foreground/25" />
          <span className="flex flex-col justify-center gap-1">
            <Bar width={90} />
            <Bar width={70} />
            <Bar width={80} />
          </span>
        </div>
        <div aria-hidden className="grid grid-cols-4 gap-1">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="h-3 rounded-sm bg-muted" />
          ))}
        </div>
      </Sketch>
      <Sketch page="artist" title="Artist page">
        <div aria-hidden className="flex items-center gap-2">
          <span className="size-10 shrink-0 rounded-lg bg-muted" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Bar width={80} thick />
            <Bar width={50} />
          </div>
        </div>
        <Lines widths={[92, 86, 60]} />
        <div aria-hidden className="flex flex-col gap-1">
          {[66, 74, 58, 70].map((width) => (
            <span key={width} className="flex items-center gap-1.5 rounded border p-1">
              <span className="size-3 shrink-0 rounded-sm bg-muted" />
              <Bar width={width} />
            </span>
          ))}
        </div>
        {ad("artistAfterSongs")}
      </Sketch>
    </div>
  );
}

/** A bordered box, like the lyrics card. */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden className="flex flex-col gap-2 rounded-md border p-1.5">
      {children}
    </div>
  );
}

/** Tamil lines with their Tanglish underneath. */
function Pairs({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="flex flex-col gap-0.5">
          <Bar width={i % 2 ? 70 : 82} />
          <span className="block h-1 w-1/2 rounded-full bg-muted-foreground/15" />
        </span>
      ))}
    </div>
  );
}

/** Square cover tiles. */
function Posters() {
  return (
    <div aria-hidden className="grid grid-cols-4 gap-1">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="aspect-square rounded bg-muted" />
      ))}
    </div>
  );
}

function Sketch({ page, title, children }: { page: AdPage; title: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm font-medium">{title}</figcaption>
      <div className="flex flex-col gap-2.5 rounded-2xl border-4 border-foreground/10 bg-background p-2.5">
        {/* The site header */}
        <div aria-hidden className="flex items-center gap-1.5 border-b pb-2">
          <span className="size-3 rounded-full bg-marigold" />
          <Bar width={35} />
        </div>
        {children}
      </div>
      <Link
        href={`/admin/ads-preview/${page}`}
        className="inline-flex items-center gap-1 self-start text-sm font-medium underline-offset-4 hover:underline"
      >
        See it on a real page
        <ArrowRightIcon className="size-3.5" aria-hidden />
      </Link>
    </figure>
  );
}

function AdBox({ id, on }: { id: AdPlacement; on: boolean }) {
  const { short } = AD_PLACEMENTS.find((p) => p.id === id)!;
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border-2 border-dashed px-1.5 py-2 text-[0.6875rem] leading-tight font-medium",
        on ? "border-marigold bg-marigold/15" : "border-muted-foreground/30 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full font-semibold",
          on ? "bg-marigold text-marigold-foreground" : "bg-muted",
        )}
      >
        {placementNumber(id)}
      </span>
      <span>
        {short}
        <span className="sr-only">{on ? " (on)" : " (off)"}</span>
      </span>
    </div>
  );
}

/** The ad place's number in a circle, for labels in the settings. */
export function PlacementNumber({ id, on }: { id: AdPlacement; on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        on ? "bg-marigold text-marigold-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {placementNumber(id)}
    </span>
  );
}

function Band() {
  return (
    <div aria-hidden className="flex items-end gap-2 rounded-md bg-muted/70 p-2">
      <span className="size-9 shrink-0 rounded bg-muted-foreground/25" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Bar width={80} thick />
        <Bar width={55} />
      </div>
    </div>
  );
}

function Lines({ widths }: { widths: number[] }) {
  return (
    <div aria-hidden className="flex flex-col gap-1">
      {widths.map((width, i) => (
        <Bar key={i} width={width} />
      ))}
    </div>
  );
}

function Bar({ width, thick = false }: { width: number; thick?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("block rounded-full bg-muted-foreground/25", thick ? "h-2" : "h-1.5")}
      style={{ width: `${width}%` }}
    />
  );
}
