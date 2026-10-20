"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { ImageIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slug";
import type { SongFormValues } from "@/lib/songs/admin-queries";
import type { SongFormField, SongFormState } from "@/lib/songs/schema";

const MAX_COVER_MB = 5;

type Intent = "draft" | "publish";

export function SongForm({
  song,
  action,
}: {
  song?: SongFormValues;
  action: (prev: SongFormState, formData: FormData) => Promise<SongFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [intent, setIntent] = useState<Intent | null>(null);
  const [title, setTitle] = useState(song?.title ?? "");
  const [dirty, setDirty] = useState(false);
  const isPublished = song?.status === "PUBLISHED";

  // Warn before closing the tab or reloading with unsaved lyrics.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Submitting by hand (instead of <form action>) stops React from clearing the fields
    // when the server sends back validation errors, so nothing typed is lost.
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    setIntent(formData.get("intent") === "publish" ? "publish" : "draft");
    setDirty(false);
    startTransition(() => formAction(formData));
  }

  const errorFor = (field: SongFormField) => state.fieldErrors?.[field]?.[0];

  return (
    <form onSubmit={handleSubmit} onInput={() => setDirty(true)} className="space-y-6" noValidate>
      <Section title="Song">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="title"
            label="Title (English letters)"
            hint="e.g. Kannaana Kanne"
            error={errorFor("title")}
          >
            <Input
              id="title"
              name="title"
              defaultValue={song?.title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus={!song}
            />
          </Field>
          <Field name="titleTamil" label="Title in Tamil" hint="e.g. கண்ணான கண்ணே" error={errorFor("titleTamil")}>
            <Input id="titleTamil" name="titleTamil" lang="ta" defaultValue={song?.titleTamil} />
          </Field>
        </div>
        <Field
          name="slug"
          label="Web address"
          hint={
            isPublished
              ? "Changing this breaks links people have already shared."
              : "Leave empty to make it from the title."
          }
          error={errorFor("slug")}
        >
          <div className="flex items-center rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <span className="pl-2.5 text-sm text-muted-foreground">/songs/</span>
            <Input
              id="slug"
              name="slug"
              defaultValue={song?.slug}
              placeholder={slugify(title) || "song-name"}
              className="border-0 pl-0.5 focus-visible:ring-0"
            />
          </div>
        </Field>
      </Section>

      <Section title="Credits" description="Separate several names with commas. Existing artists are matched by name.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field name="singers" label="Singers" error={errorFor("singers")}>
            <Input id="singers" name="singers" defaultValue={song?.singers} placeholder="Sid Sriram, …" />
          </Field>
          <Field name="music" label="Music by" error={errorFor("music")}>
            <Input id="music" name="music" defaultValue={song?.music} />
          </Field>
          <Field name="lyricists" label="Lyrics by" error={errorFor("lyricists")}>
            <Input id="lyricists" name="lyricists" defaultValue={song?.lyricists} />
          </Field>
        </div>
      </Section>

      <Section title="Details" description="All optional.">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field name="album" label="Album" error={errorFor("album")}>
            <Input id="album" name="album" defaultValue={song?.album} />
          </Field>
          <Field name="releaseYear" label="Release year" error={errorFor("releaseYear")}>
            <Input
              id="releaseYear"
              name="releaseYear"
              inputMode="numeric"
              maxLength={4}
              placeholder="2024"
              defaultValue={song?.releaseYear}
            />
          </Field>
          <Field name="youtubeUrl" label="YouTube link" error={errorFor("youtubeUrl")}>
            <Input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={song?.youtubeUrl} placeholder="https://youtu.be/…" />
          </Field>
          <Field name="spotifyUrl" label="Spotify link" error={errorFor("spotifyUrl")}>
            <Input id="spotifyUrl" name="spotifyUrl" type="url" defaultValue={song?.spotifyUrl} placeholder="https://open.spotify.com/…" />
          </Field>
        </div>
      </Section>

      <Section title="Cover image" description={`JPG, PNG or WebP, up to ${MAX_COVER_MB} MB. It's cropped to a square.`}>
        <CoverInput current={song?.coverImage ?? null} error={errorFor("cover")} />
      </Section>

      <Section
        title="Lyrics"
        description="Paste each line on its own line, with an empty line between verses. Both are required to publish."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Field name="lyricsTamil" label="தமிழ் lyrics" error={errorFor("lyricsTamil")}>
            <Textarea
              id="lyricsTamil"
              name="lyricsTamil"
              lang="ta"
              rows={18}
              defaultValue={song?.lyricsTamil}
              className="min-h-80 text-base leading-relaxed"
            />
          </Field>
          <Field
            name="lyricsTanglish"
            label="English lyrics"
            hint="The Tamil words written in English letters."
            error={errorFor("lyricsTanglish")}
          >
            <Textarea
              id="lyricsTanglish"
              name="lyricsTanglish"
              lang="ta-Latn"
              rows={18}
              defaultValue={song?.lyricsTanglish}
              className="min-h-80 text-base leading-relaxed"
            />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        {state.error && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {state.error}
          </p>
        )}
        {/* Enter submits with the first button in the markup, so that's always the safe choice:
            "Save draft" for drafts, "Save changes" (stays published) for live songs. */}
        <div className={cn("ml-auto flex gap-2", isPublished && "flex-row-reverse")}>
          {isPublished ? (
            <>
              <SubmitButton intent="publish" pending={pending} active={intent}>
                Save changes
              </SubmitButton>
              <SubmitButton intent="draft" pending={pending} active={intent} variant="outline">
                Unpublish
              </SubmitButton>
            </>
          ) : (
            <>
              <SubmitButton intent="draft" pending={pending} active={intent} variant="outline">
                Save draft
              </SubmitButton>
              <SubmitButton intent="publish" pending={pending} active={intent}>
                Publish
              </SubmitButton>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function SubmitButton({
  intent,
  pending,
  active,
  variant = "default",
  children,
}: {
  intent: Intent;
  pending: boolean;
  active: Intent | null;
  variant?: "default" | "outline";
  children: React.ReactNode;
}) {
  return (
    <Button type="submit" name="intent" value={intent} variant={variant} disabled={pending} className="h-9 px-4">
      {pending && active === intent && <Loader2Icon className="animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-background p-4 sm:p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  name,
  label,
  hint,
  error,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className={cn(error && "[&_input]:border-destructive [&_textarea]:border-destructive")}>
        {children}
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function CoverInput({ current, error }: { current: string | null; error?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  // Free the temporary preview URL when it's replaced or the form goes away.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setSizeError(null);
    if (!file) return setPreview(null);
    if (file.size > MAX_COVER_MB * 1024 * 1024) {
      event.target.value = "";
      setPreview(null);
      return setSizeError(`This image is larger than ${MAX_COVER_MB} MB. Choose a smaller one.`);
    }
    setRemove(false);
    setPreview(URL.createObjectURL(file));
  }

  const shown = preview ?? (remove ? null : current);
  const message = sizeError ?? error;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
        {shown ? (
          // A plain <img>: the preview is a temporary local file the image optimizer can't fetch.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="Cover preview" className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-8 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="cover" className="sr-only">
          Cover image
        </Label>
        <Input
          id="cover"
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleChange}
          className="h-auto max-w-xs py-1.5"
        />
        {current && !preview && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="removeCover"
              checked={remove}
              onChange={(e) => setRemove(e.target.checked)}
              className="size-4 accent-primary"
            />
            Remove the current cover
          </label>
        )}
        {message && <p className="text-sm text-destructive">{message}</p>}
      </div>
    </div>
  );
}
