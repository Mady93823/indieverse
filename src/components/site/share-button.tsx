"use client";

import { Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Opens the phone's share sheet; on computers without one, copies the link instead. */
export function ShareButton({ title, url, className }: { title: string; url?: string; className?: string }) {
  async function share() {
    const link = url ? new URL(url, window.location.href).href : window.location.href;
    if (navigator.share) {
      // Closing the share sheet rejects the promise; that's not an error worth showing.
      await navigator.share({ title: `${title} lyrics`, url: link }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn’t copy the link. Copy it from the address bar instead.");
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={`Share ${title}`}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full border bg-card text-foreground transition-[background-color,scale] outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]",
        className,
      )}
    >
      <Share2Icon className="size-4" aria-hidden />
    </button>
  );
}
