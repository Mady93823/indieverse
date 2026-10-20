import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { DeleteSongButton } from "@/components/admin/delete-song-button";
import { SongForm } from "@/components/admin/song-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { deleteSong, saveSong } from "@/lib/songs/actions";
import { getSongForEdit } from "@/lib/songs/admin-queries";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Edit song" };

export default async function EditSongPage({ params }: PageProps<"/admin/songs/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const song = Number.isSafeInteger(id) ? await getSongForEdit(id) : null;
  if (!song) notFound();

  const isPublished = song.status === "PUBLISHED";

  return (
    <div className="space-y-4">
      <div>
        <Button variant="link" size="sm" asChild className="-ml-2.5 text-muted-foreground">
          <Link href="/admin">
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            All songs
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{song.title}</h1>
          {isPublished ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}
          {isPublished && (
            <Button variant="outline" size="sm" asChild className="ml-auto">
              <Link href={`/songs/${song.slug}`} target="_blank">
                View on site
                <ExternalLinkIcon data-icon="inline-end" aria-hidden />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <SongForm song={song} action={saveSong.bind(null, song.id)} />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-background p-4 sm:p-5">
        <div>
          <h2 className="font-semibold">Delete this song</h2>
          <p className="text-sm text-muted-foreground">To hide it for now instead, use Unpublish.</p>
        </div>
        <DeleteSongButton title={song.title} action={deleteSong.bind(null, song.id)} />
      </section>
    </div>
  );
}
