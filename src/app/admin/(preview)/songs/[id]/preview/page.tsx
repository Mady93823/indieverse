import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, EyeIcon } from "lucide-react";
import { Container } from "@/components/site/container";
import { SongView } from "@/components/site/song-view";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { getSongForPreview } from "@/lib/songs/admin-queries";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Preview" };

export default async function SongPreviewPage({ params }: PageProps<"/admin/songs/[id]/preview">) {
  await requireAdmin();
  const id = Number((await params).id);
  const song = Number.isSafeInteger(id) ? await getSongForPreview(id) : null;
  if (!song) notFound();

  return (
    <>
      <div className="border-b bg-wine">
        <Container className="flex flex-wrap items-center gap-3 py-3 text-sm">
          <EyeIcon className="size-4 shrink-0" aria-hidden />
          <p className="mr-auto">
            <strong>Preview.</strong>{" "}
            {song.status === "PUBLISHED"
              ? "This is the saved version of the song page."
              : "This draft isn't on the site yet. Visitors will see it like this once you publish it."}{" "}
            Unsaved changes in the editor don’t show here.
          </p>
          <Button variant="outline" size="sm" asChild className="bg-background">
            <Link href={`/admin/songs/${song.id}`}>
              <ArrowLeftIcon data-icon="inline-start" aria-hidden />
              Back to editing
            </Link>
          </Button>
        </Container>
      </div>
      <SongView song={song} />
    </>
  );
}
