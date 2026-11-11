"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { ImageUpIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

/**
 * One brand image: a preview, an upload button that saves as soon as a file is picked,
 * and a remove button.
 */
export function BrandImageCard({
  title,
  description,
  imageUrl,
  preview,
  upload,
  remove,
}: {
  title: string;
  description: React.ReactNode;
  imageUrl: string | null;
  /** How the current image is shown; receives its URL. */
  preview: React.ReactNode;
  upload: (prev: FormState, formData: FormData) => Promise<FormState>;
  remove: () => Promise<void>;
}) {
  const [state, uploadAction, uploading] = useActionState(upload, {});
  const inputRef = useRef<HTMLInputElement>(null);
  const error = state.fieldErrors?.file?.[0];

  useEffect(() => {
    if (state.ok) toast.success(`${title} updated.`, { id: `brand-${title}` });
  }, [state.ok, title]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    event.target.value = "";
    startTransition(() => uploadAction(formData));
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-background p-4 sm:p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={cn("relative", uploading && "opacity-50")}>{preview}</div>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={handleFile}
        />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2Icon className="animate-spin" aria-hidden /> : <ImageUpIcon data-icon="inline-start" aria-hidden />}
          {imageUrl ? "Replace" : "Upload"}
        </Button>
        {imageUrl && (
          <form action={remove}>
            <Button type="submit" variant="ghost" size="sm" disabled={uploading} className="text-muted-foreground">
              <Trash2Icon data-icon="inline-start" aria-hidden />
              Remove
            </Button>
          </form>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
