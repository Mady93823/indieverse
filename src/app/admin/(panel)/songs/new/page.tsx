import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { SongForm } from "@/components/admin/song-form";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { saveSong } from "@/lib/songs/actions";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Add song" };

export default async function NewSongPage() {
  await requireAdmin();

  return (
    <div className="space-y-4">
      <div>
        <Button variant="link" size="sm" asChild className="-ml-2.5 text-muted-foreground">
          <Link href="/admin">
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            All songs
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Add song</h1>
      </div>
      <SongForm action={saveSong.bind(null, null)} />
    </div>
  );
}
