"use client";

import { Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Opens the phone's share sheet; on computers without one, copies the link instead. */
export function ShareButton({ title }: { title: string }) {
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      // Closing the share sheet rejects the promise; that's not an error worth showing.
      await navigator.share({ title: `${title} lyrics`, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn’t copy the link. Copy it from the address bar instead.");
    }
  }

  return (
    <Button variant="outline" size="lg" onClick={share} className="rounded-full bg-card/70">
      <Share2Icon data-icon="inline-start" aria-hidden />
      Share
    </Button>
  );
}
