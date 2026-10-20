import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MusicIcon, PencilIcon, PlusIcon } from "lucide-react";
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
import { listSongsForAdmin } from "@/lib/songs/admin-queries";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Songs" };

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminSongsPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const { q, toast } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const songs = await listSongsForAdmin(query);

  return (
    <div className="space-y-4">
      <FlashToast kind={typeof toast === "string" ? toast : undefined} />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold tracking-tight">Songs</h1>
        <form className="w-full sm:w-64" role="search">
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Filter by title or artist"
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

      {songs.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center">
          <p className="font-medium">{query ? `No songs match “${query}”.` : "No songs yet."}</p>
          {!query && (
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first song with its Tamil and English lyrics.
            </p>
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
                        <span className="block truncate font-medium">{song.title}</span>
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
                  <TableCell className="pr-4 text-right">
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
    </div>
  );
}
