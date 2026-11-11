"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { ChevronDownIcon, CircleCheckIcon, CircleIcon, Loader2Icon } from "lucide-react";
import { useSaveShortcut, useUnsavedChangesWarning } from "@/components/admin/admin-form";
import { Field, Section, SwitchField } from "@/components/admin/form-parts";
import { ImageInput } from "@/components/admin/image-input";
import { SeoFields } from "@/components/admin/seo-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { songSeoDefaults } from "@/lib/seo/song-seo";
import { slugify } from "@/lib/slug";
import type { SongFormValues } from "@/lib/songs/admin-queries";
import { parseNames, type SongFormField, type SongFormState } from "@/lib/songs/schema";

type Intent = "draft" | "publish";

/** What the checklist and the search preview need, read from the form as the admin types. */
type Snapshot = {
  title: string;
  titleTamil: string;
  singers: string[];
  music: string[];
  lyricsTamil: string;
  lyricsTanglish: string;
  about: string;
  youtubeUrl: string;
  hasCover: boolean;
};

function readSnapshot(form: HTMLFormElement, hadCover: boolean): Snapshot {
  const data = new FormData(form);
  const text = (key: string) => String(data.get(key) ?? "").trim();
  const cover = data.get("cover");
  return {
    title: text("title"),
    titleTamil: text("titleTamil"),
    singers: parseNames(text("singers")),
    music: parseNames(text("music")),
    lyricsTamil: text("lyricsTamil"),
    lyricsTanglish: text("lyricsTanglish"),
    about: text("about"),
    youtubeUrl: text("youtubeUrl"),
    hasCover: (cover instanceof File && cover.size > 0) || (hadCover && data.get("coverRemove") !== "on"),
  };
}

export function SongForm({
  song,
  action,
  suggestions,
  siteUrl,
  siteName,
}: {
  song?: SongFormValues;
  action: (prev: SongFormState, formData: FormData) => Promise<SongFormState>;
  suggestions: { artists: string[]; albums: string[] };
  siteUrl: string;
  siteName: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [intent, setIntent] = useState<Intent | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot>(() => ({
    title: song?.title ?? "",
    titleTamil: song?.titleTamil ?? "",
    singers: parseNames(song?.singers ?? ""),
    music: parseNames(song?.music ?? ""),
    lyricsTamil: song?.lyricsTamil ?? "",
    lyricsTanglish: song?.lyricsTanglish ?? "",
    about: song?.about ?? "",
    youtubeUrl: song?.youtubeUrl ?? "",
    hasCover: !!song?.coverImage,
  }));
  const formRef = useRef<HTMLFormElement>(null);
  const dirty = useUnsavedChangesWarning();
  useSaveShortcut(formRef);
  const isPublished = song?.status === "PUBLISHED";
  const seo = songSeoDefaults({ ...snapshot, titleTamil: snapshot.titleTamil || null });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Submitting by hand (instead of <form action>) stops React from clearing the fields
    // when the server sends back validation errors, so nothing typed is lost.
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    setIntent(formData.get("intent") === "publish" ? "publish" : "draft");
    dirty.reset();
    startTransition(() => formAction(formData));
  }

  function handleInput(event: React.FormEvent<HTMLFormElement>) {
    dirty.mark();
    setSnapshot(readSnapshot(event.currentTarget, !!song?.coverImage));
  }

  const errorFor = (field: SongFormField) => state.fieldErrors?.[field]?.[0];

  return (
    <form ref={formRef} onSubmit={handleSubmit} onInput={handleInput} className="space-y-6" noValidate data-save-shortcut>
      <Section title="Song">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="title" label="Title (English letters)" hint="e.g. Kannaana Kanne" error={errorFor("title")}>
            <Input id="title" name="title" defaultValue={song?.title} required autoFocus={!song} />
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
              ? "If you change this, the old address keeps working and forwards to the new one."
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
              placeholder={slugify(snapshot.title) || "song-name"}
              className="border-0 pl-0.5 focus-visible:ring-0"
            />
          </div>
        </Field>
      </Section>

      <Section title="Credits" description="Separate several names with commas. Start typing to pick an artist who's already on the site.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field name="singers" label="Singers" error={errorFor("singers")}>
            <NamesInput name="singers" defaultValue={song?.singers} options={suggestions.artists} placeholder="Sid Sriram, …" />
          </Field>
          <Field name="music" label="Music by" error={errorFor("music")}>
            <NamesInput name="music" defaultValue={song?.music} options={suggestions.artists} />
          </Field>
          <Field name="lyricists" label="Lyrics by" error={errorFor("lyricists")}>
            <NamesInput name="lyricists" defaultValue={song?.lyricists} options={suggestions.artists} />
          </Field>
        </div>
      </Section>

      <Section title="Details" description="All optional.">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field name="album" label="Album" error={errorFor("album")}>
            <Input id="album" name="album" defaultValue={song?.album} list="album-suggestions" autoComplete="off" />
            <datalist id="album-suggestions">
              {suggestions.albums.map((album) => (
                <option key={album} value={album} />
              ))}
            </datalist>
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

      <Section title="Cover image" description="JPG, PNG or WebP, up to 5 MB. It's cropped to a square.">
        <ImageInput name="cover" label="Cover" current={song?.coverImage ?? null} error={errorFor("cover")} />
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

      <Section
        title="About this song"
        description="Optional, but recommended: a few lines in your own words about the song, its story or meaning. It's shown under the lyrics, and original text like this helps the page rank on Google."
      >
        <Field name="about" label="About" error={errorFor("about")} className="[&>label]:sr-only">
          <Textarea id="about" name="about" rows={4} defaultValue={song?.about} className="text-base leading-relaxed" />
        </Field>
      </Section>

      <Section title="Options">
        <SwitchField
          name="featured"
          label="Feature on the home page"
          hint="Shows the song in the home page's lyrics reader (the newest featured song is shown)."
          defaultChecked={song?.featured}
        />
        <SwitchField
          name="hideAds"
          label="Hide ads on this song"
          hint="For songs whose artist asked for no ads, or where you're not sure you have permission."
          defaultChecked={song?.hideAds}
        />
        <Field
          name="adminNote"
          label="Internal note"
          hint="Only admins see this, e.g. “Artist gave permission on Instagram, 21 Oct”."
          error={errorFor("adminNote")}
        >
          <Textarea id="adminNote" name="adminNote" rows={2} defaultValue={song?.adminNote} />
        </Field>
      </Section>

      <details className="group rounded-xl border bg-background" open={!!(song?.seoTitle || song?.seoDescription)}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-semibold">Search & sharing</span>
            <span className="block text-sm text-muted-foreground">
              How the song appears on Google. Automatic unless you write your own.
            </span>
          </span>
          <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="border-t p-4 sm:p-5">
          <SeoFields
            titleName="seoTitle"
            descriptionName="seoDescription"
            defaultTitle={song?.seoTitle ?? ""}
            defaultDescription={song?.seoDescription ?? ""}
            autoTitle={snapshot.title ? seo.title : "Song Title Lyrics – Singer"}
            autoDescription={seo.description}
            titleSuffix={` | ${siteName}`}
            url={`${siteUrl}/songs/${slugify(snapshot.title) || "…"}`}
          />
        </div>
      </details>

      <Checklist snapshot={snapshot} />

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        {state.error && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {state.error}
          </p>
        )}
        {/* Enter and Ctrl+S submit with the first button in the markup, so that's always the safe
            choice: "Save draft" for drafts, "Save changes" (stays published) for live songs. */}
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

/**
 * A comma-separated names field that suggests existing artists for the name being typed.
 * Each suggestion repeats the names already entered, because the browser's list replaces
 * the whole field when one is picked.
 */
function NamesInput({
  name,
  defaultValue,
  options,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  options: string[];
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const cut = value.lastIndexOf(",");
  const before = cut >= 0 ? `${value.slice(0, cut + 1)} ` : "";
  const typing = value.slice(cut + 1).trim().toLowerCase();
  const entered = new Set(parseNames(value.slice(0, cut + 1)).map((n) => n.toLowerCase()));
  const matches = typing
    ? options.filter((o) => o.toLowerCase().includes(typing) && !entered.has(o.toLowerCase())).slice(0, 8)
    : [];

  return (
    <>
      <Input
        id={name}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        list={`${name}-suggestions`}
        autoComplete="off"
      />
      <datalist id={`${name}-suggestions`}>
        {matches.map((match) => (
          <option key={match} value={before + match} />
        ))}
      </datalist>
    </>
  );
}

function Checklist({ snapshot }: { snapshot: Snapshot }) {
  const items = [
    { label: "A singer", done: snapshot.singers.length > 0, required: true },
    { label: "தமிழ் lyrics", done: !!snapshot.lyricsTamil, required: true },
    { label: "English lyrics", done: !!snapshot.lyricsTanglish, required: true },
    { label: "Cover image", done: snapshot.hasCover },
    { label: "About text", done: !!snapshot.about },
    { label: "YouTube link", done: !!snapshot.youtubeUrl },
  ];
  return (
    <section aria-labelledby="checklist-heading" className="rounded-xl border bg-background p-4 sm:p-5">
      <h2 id="checklist-heading" className="font-semibold">
        Before you publish
      </h2>
      <p className="text-sm text-muted-foreground">The first three are required. The rest make the page more complete.</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item.label}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
              item.done ? "border-transparent bg-muted" : item.required ? "border-foreground/30" : "text-muted-foreground",
            )}
          >
            {item.done ? (
              <CircleCheckIcon className="size-4 text-marigold-text" aria-hidden />
            ) : (
              <CircleIcon className="size-4" aria-hidden />
            )}
            <span className="sr-only">{item.done ? "Done:" : item.required ? "Required:" : "Recommended:"}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
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
