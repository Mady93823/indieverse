"use client";

import { useState } from "react";
import { Field } from "@/components/admin/form-parts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Google cuts titles around 60 characters and descriptions around 160 (it measures pixels,
// so these are guides, not hard limits).
const TITLE_GUIDE = 60;
const DESCRIPTION_GUIDE = 160;

/**
 * Title and description overrides with a live preview of the search result.
 * Empty fields fall back to the automatic text, which the preview shows.
 */
export function SeoFields({
  titleName,
  descriptionName,
  defaultTitle,
  defaultDescription,
  autoTitle,
  autoDescription,
  titleSuffix = "",
  url,
}: {
  titleName: string;
  descriptionName: string;
  defaultTitle: string;
  defaultDescription: string;
  autoTitle: string;
  autoDescription: string;
  /** Added after the title on every page except the home page, e.g. " | IndieVerse". */
  titleSuffix?: string;
  url: string;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const shownTitle = (title.trim() || autoTitle) + titleSuffix;
  const shownDescription = description.trim() || autoDescription;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Field
          name={titleName}
          label={<CountedLabel label="Title" length={shownTitle.length} guide={TITLE_GUIDE} />}
          hint="Leave empty to use the automatic title shown in the preview."
        >
          <Input id={titleName} name={titleName} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={autoTitle} />
        </Field>
        <Field
          name={descriptionName}
          label={<CountedLabel label="Description" length={shownDescription.length} guide={DESCRIPTION_GUIDE} />}
          hint="Leave empty to use the automatic description."
        >
          <Textarea
            id={descriptionName}
            name={descriptionName}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={autoDescription}
          />
        </Field>
      </div>
      <figure className="space-y-1.5">
        <figcaption className="text-sm font-medium">Preview in Google</figcaption>
        <div className="rounded-xl border bg-white p-4 text-[#202124] shadow-xs dark:bg-[#202124] dark:text-[#e8eaed]">
          <p className="truncate text-xs text-[#4d5156] dark:text-[#bdc1c6]">{url}</p>
          <p className="mt-1 line-clamp-1 text-lg leading-snug text-[#1a0dab] dark:text-[#99c3ff]">{shownTitle}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#4d5156] dark:text-[#bdc1c6]">{shownDescription}</p>
        </div>
      </figure>
    </div>
  );
}

function CountedLabel({ label, length, guide }: { label: string; length: number; guide: number }) {
  return (
    <span className="flex w-full items-baseline justify-between gap-2">
      {label}
      <span className={cn("text-xs font-normal tabular-nums", length > guide ? "text-destructive" : "text-muted-foreground")}>
        {length} / {guide}
      </span>
    </span>
  );
}
