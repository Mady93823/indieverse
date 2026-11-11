"use client";

import { use, useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { FormStateContext } from "@/components/admin/form-parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_MB = 5;

/**
 * A file input with a preview of the current or newly chosen image, and a "remove" checkbox.
 * Submits as `name` (the file) and `${name}Remove` ("on" to delete the current image).
 */
export function ImageInput({
  name,
  label,
  current,
  error,
  round = false,
}: {
  name: string;
  label: string;
  current: string | null;
  error?: string;
  round?: boolean;
}) {
  const formState = use(FormStateContext);
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
    if (file.size > MAX_MB * 1024 * 1024) {
      event.target.value = "";
      setPreview(null);
      return setSizeError(`This image is larger than ${MAX_MB} MB. Choose a smaller one.`);
    }
    setRemove(false);
    setPreview(URL.createObjectURL(file));
  }

  const shown = preview ?? (remove ? null : current);
  const message = sizeError ?? error ?? formState.fieldErrors?.[name]?.[0];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div
        className={cn(
          "flex size-32 shrink-0 items-center justify-center overflow-hidden border bg-muted",
          round ? "rounded-full" : "rounded-xl",
        )}
      >
        {shown ? (
          // A plain <img>: the preview is a temporary local file the image optimizer can't fetch.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt={`${label} preview`} className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-8 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={name} className="sr-only">
          {label}
        </Label>
        <Input
          id={name}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleChange}
          className="h-auto max-w-xs py-1.5"
        />
        {current && !preview && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={`${name}Remove`}
              checked={remove}
              onChange={(e) => setRemove(e.target.checked)}
              className="size-4 accent-primary"
            />
            Remove the current {label.toLowerCase()}
          </label>
        )}
        {message && <p className="text-sm text-destructive">{message}</p>}
      </div>
    </div>
  );
}
