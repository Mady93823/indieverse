import type { Metadata } from "next";
import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { FlashToast } from "@/components/admin/flash-toast";
import { ArtistMonogram } from "@/components/site/artist-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listArtistsForAdmin } from "@/lib/artists/admin-queries";
import { requireAdmin } from "@/lib/auth/session";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Artists" };

export default async function AdminArtistsPage({ searchParams }: PageProps<"/admin/artists">) {
  await requireAdmin();
  const { q, toast } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const artists = await listArtistsForAdmin(query);

  return (
    <div className="space-y-4">
      <FlashToast kind={typeof toast === "string" ? toast : undefined} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-semibold tracking-tight">Artists</h1>
          <p className="text-sm text-muted-foreground">
            Artists are added when you credit them on a song. Add a photo and a short bio to make their page stronger.
          </p>
        </div>
        <form className="w-full sm:w-64" role="search">
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Filter by name"
            aria-label="Filter artists"
            className="h-9 bg-background"
          />
        </form>
      </div>

      {artists.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center">
          <p className="font-medium">{query ? `No artists match “${query}”.` : "No artists yet."}</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Artist</TableHead>
                <TableHead className="text-right">Songs</TableHead>
                <TableHead className="hidden sm:table-cell">Profile</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="pl-4">
                    <Link href={`/admin/artists/${artist.id}`} className="flex items-center gap-3">
                      <ArtistMonogram name={artist.name} slug={artist.slug} photo={artist.photo} className="size-10 text-base" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{artist.name}</span>
                        {artist.nameTamil && (
                          <span lang="ta" className="block truncate text-xs text-muted-foreground">
                            {artist.nameTamil}
                          </span>
                        )}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {artist.songs}
                    {artist.published < artist.songs && (
                      <span className="block text-xs text-muted-foreground">{artist.published} live</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="flex flex-wrap gap-1">
                      {!artist.photo && (
                        <Badge variant="outline" className="font-normal">
                          No photo
                        </Badge>
                      )}
                      {!artist.hasBio && (
                        <Badge variant="outline" className="font-normal">
                          No bio
                        </Badge>
                      )}
                      {artist.photo && artist.hasBio && <span className="text-sm text-muted-foreground">Complete</span>}
                    </span>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/artists/${artist.id}`}>
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
