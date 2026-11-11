import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLinkIcon, MusicIcon, PencilIcon, PlusIcon, StarIcon } from "lucide-react";
import { FlashToast } from "@/components/admin/flash-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import {
  ADMIN_PAGE_SIZE,
  SONG_FILTERS,
  SONG_SORTS,
  listSongsForAdmin,
  type SongListOptions,
} from "@/lib/songs/admin-queries";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Songs" };

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

const FILTER_LABELS: Record<SongListOptions["filter"], string> = {
  all: "All",
  published: "Published",
  drafts: "Drafts",
  featured: "Featured",
};
const SORT_LABELS: Record<SongListOptions["sort"], string> = {
  updated: "Recently edited",
  views: "Most read",
  title: "A–Z",
};

function pick<T extends string>(value: unknown, allowed: readonly T[]): T {
  return allowed.includes(value as T) ? (value as T) : allowed[0];
}

export default async function AdminSongsPage({ searchParams }: PageProps<"/admin/songs">) {
  await requireAdmin();
  const params = await searchParams;
  const options: SongListOptions = {
    q: typeof params.q === "string" ? params.q : "",
    filter: pick(params.filter, SONG_FILTERS),
    sort: pick(params.sort, SONG_SORTS),
    page: Math.max(1, Number.parseInt(String(params.page ?? "1"), 10) || 1),
  };
  const { songs, total } = await listSongsForAdmin(options);
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  // Builds a link to this list with one option changed, keeping the others.
  const hrefWith = (change: Partial<SongListOptions>) => {
    const next = { ...options, page: 1, ...change };
    const query = new URLSearchParams();
    if (next.q) query.set("q", next.q);
    if (next.filter !== "all") query.set("filter", next.filter);
    if (next.sort !== "updated") query.set("sort", next.sort);
    if (next.page > 1) query.set("page", String(next.page));
    const search = query.toString();
    return search ? `/admin/songs?${search}` : "/admin/songs";
  };

  return (
    <div className="space-y-4">
      <FlashToast kind={typeof params.toast === "string" ? params.toast : undefined} />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold tracking-tight">Songs</h1>
        <form className="w-full sm:w-64" role="search">
          {options.filter !== "all" && <input type="hidden" name="filter" value={options.filter} />}
          {options.sort !== "updated" && <input type="hidden" name="sort" value={options.sort} />}
          <Input
            type="search"
            name="q"
            defaultValue={options.q}
            placeholder="Filter by title, album or artist"
            aria-label="Filter songs"
            className="h-9 bg-background"
          />
        </form>
        <Button asChild className="h-9">
          <Link href="/admin/songs/new">
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add song
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Show" className="flex gap-1 rounded-lg bg-muted p-1">
          {SONG_FILTERS.map((filter) => (
            <Link
              key={filter}
              href={hrefWith({ filter })}
              aria-current={options.filter === filter ? "page" : undefined}
              className="rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-background aria-[current=page]:text-foreground aria-[current=page]:shadow-xs"
            >
              {FILTER_LABELS[filter]}
            </Link>
          ))}
        </nav>
        <nav aria-label="Sort" className="flex items-center gap-1 text-sm">
          <span className="mr-1 text-muted-foreground">Sort:</span>
          {SONG_SORTS.map((sort) => (
            <Link
              key={sort}
              href={hrefWith({ sort })}
              aria-current={options.sort === sort ? "page" : undefined}
              className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:decoration-marigold aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-4"
            >
              {SORT_LABELS[sort]}
            </Link>
          ))}
        </nav>
      </div>

      {songs.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center">
          <p className="font-medium">
            {options.q ? `No songs match “${options.q}”.` : total === 0 && options.filter === "all" ? "No songs yet." : "Nothing here."}
          </p>
          {!options.q && options.filter === "all" && (
            <p className="mt-1 text-sm text-muted-foreground">Add your first song with its Tamil and English lyrics.</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Song</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Views</TableHead>
                <TableHead className="hidden md:table-cell">Updated</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="pl-4">
                    <Link href={`/admin/songs/${song.id}`} className="flex items-center gap-3">
                      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                        {song.coverImage ? (
                          <Image src={song.coverImage} alt="" fill sizes="40px" className="object-cover" />
                        ) : (
                          <MusicIcon className="size-4 text-muted-foreground" aria-hidden />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="truncate">{song.title}</span>
                          {song.featured && (
                            <StarIcon className="size-3.5 shrink-0 fill-marigold text-marigold" aria-label="Featured" />
                          )}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {song.singers.join(", ") || "No singer yet"}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {song.status === "PUBLISHED" ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">
                    {song.views.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {dateFormat.format(song.updatedAt)}
                  </TableCell>
                  <TableCell className="pr-4 text-right whitespace-nowrap">
                    {song.status === "PUBLISHED" && (
                      <Button variant="ghost" size="icon-sm" asChild className="hidden sm:inline-flex">
                        <Link href={`/songs/${song.slug}`} target="_blank" aria-label={`View ${song.title} on the site`}>
                          <ExternalLinkIcon aria-hidden />
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/songs/${song.id}`}>
                        <PencilIcon data-icon="inline-start" aria-hidden />
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            Page {options.page} of {pages} ({total.toLocaleString("en-IN")} songs)
          </span>
          <span className="flex gap-2">
            <PageLink href={hrefWith({ page: options.page - 1 })} disabled={options.page <= 1}>
              Previous
            </PageLink>
            <PageLink href={hrefWith({ page: options.page + 1 })} disabled={options.page >= pages}>
              Next
            </PageLink>
          </span>
        </nav>
      )}
    </div>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    );
  }
  return (
    <Button variant="outline" size="sm" asChild className="bg-background">
      <Link href={href}>{children}</Link>
    </Button>
  );
}
