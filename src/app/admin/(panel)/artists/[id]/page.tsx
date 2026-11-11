import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { FlashToast } from "@/components/admin/flash-toast";
import { Field, Section, TextAreaField, TextField } from "@/components/admin/form-parts";
import { ImageInput } from "@/components/admin/image-input";
import { MergeArtistForm } from "@/components/admin/merge-artist-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteArtist, mergeArtist, saveArtist } from "@/lib/artists/actions";
import { getArtistForEdit, listOtherArtists } from "@/lib/artists/admin-queries";
import { requireAdmin } from "@/lib/auth/session";
import type { CreditRole } from "@/generated/prisma/client";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Edit artist" };

const ROLE_LABELS: Record<CreditRole, string> = { SINGER: "Singer", MUSIC: "Music", LYRICS: "Lyrics" };

export default async function EditArtistPage({ params, searchParams }: PageProps<"/admin/artists/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const [artist, others, { toast }] = await Promise.all([
    Number.isSafeInteger(id) ? getArtistForEdit(id) : null,
    Number.isSafeInteger(id) ? listOtherArtists(id) : [],
    searchParams,
  ]);
  if (!artist) notFound();

  // One row per song, listing every role the artist has on it.
  const songs = [...Map.groupBy(artist.credits, (credit) => credit.song.id).values()].map((credits) => ({
    ...credits[0].song,
    roles: credits.map((c) => ROLE_LABELS[c.role]),
  }));
  const isPublic = songs.some((song) => song.status === "PUBLISHED");

  return (
    <div className="space-y-4">
      <FlashToast kind={typeof toast === "string" ? toast : undefined} />
      <div>
        <Button variant="link" size="sm" asChild className="-ml-2.5 text-muted-foreground">
          <Link href="/admin/artists">
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            All artists
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{artist.name}</h1>
          {isPublic && (
            <Button variant="outline" size="sm" asChild className="ml-auto bg-background">
              <Link href={`/artists/${artist.slug}`} target="_blank">
                View on site
                <ExternalLinkIcon data-icon="inline-end" aria-hidden />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <AdminForm action={saveArtist.bind(null, artist.id)} successMessage="Artist saved.">
        <Section title="Name">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="name"
              label="Name (English letters)"
              defaultValue={artist.name}
              hint="Renaming here changes the name on every song."
              required
            />
            <TextField name="nameTamil" label="Name in Tamil" lang="ta" defaultValue={artist.nameTamil ?? ""} />
          </div>
          <Field
            name="slug"
            label="Web address"
            hint="If you change this, the old address keeps working and forwards to the new one."
          >
            <div className="flex items-center rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="pl-2.5 text-sm text-muted-foreground">/artists/</span>
              <Input id="slug" name="slug" defaultValue={artist.slug} className="border-0 pl-0.5 focus-visible:ring-0" />
            </div>
          </Field>
        </Section>

        <Section title="Photo" description="A square photo works best. It's shown in a circle.">
          <ImageInput name="photo" label="Photo" current={artist.photo} round />
        </Section>

        <Section
          title="About"
          description="A few lines about the artist in your own words. Shown on their page and helps it appear in searches like “Kavin Raj songs”."
        >
          <TextAreaField name="bio" label="Bio" rows={5} defaultValue={artist.bio ?? ""} className="[&>label]:sr-only" />
        </Section>

        <Section title="Links" description="Shown on the artist's page. All optional.">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField name="instagramUrl" label="Instagram" type="url" defaultValue={artist.instagramUrl ?? ""} placeholder="https://instagram.com/…" />
            <TextField name="youtubeUrl" label="YouTube" type="url" defaultValue={artist.youtubeUrl ?? ""} placeholder="https://youtube.com/@…" />
            <TextField name="spotifyUrl" label="Spotify" type="url" defaultValue={artist.spotifyUrl ?? ""} placeholder="https://open.spotify.com/artist/…" />
          </div>
        </Section>
      </AdminForm>

      <Section title="Songs" description="To change credits, edit the song.">
        {songs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No songs credit this artist.</p>
        ) : (
          <ul className="divide-y">
            {songs.map((song) => (
              <li key={song.id}>
                <Link href={`/admin/songs/${song.id}`} className="-mx-2 flex flex-wrap items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted">
                  <span className="mr-auto font-medium">{song.title}</span>
                  <span className="text-sm text-muted-foreground">{song.roles.join(", ")}</span>
                  {song.status === "DRAFT" && <Badge variant="secondary">Draft</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {others.length > 0 && (
        <Section
          title="Merge with another artist"
          description="For the same person entered twice, e.g. with a different spelling. The artist you choose is kept."
        >
          <MergeArtistForm name={artist.name} others={others} action={mergeArtist.bind(null, artist.id)} />
        </Section>
      )}

      {songs.length === 0 && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-background p-4 sm:p-5">
          <div>
            <h2 className="font-semibold">Delete this artist</h2>
            <p className="text-sm text-muted-foreground">No songs credit them, so nothing else changes.</p>
          </div>
          <DeleteButton
            label="Delete artist"
            title={`Delete “${artist.name}”?`}
            description="The artist's profile and photo will be removed. This can’t be undone."
            keepLabel="Keep artist"
            action={deleteArtist.bind(null, artist.id)}
          />
        </section>
      )}
    </div>
  );
}
