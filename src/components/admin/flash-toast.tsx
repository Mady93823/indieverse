"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const MESSAGES: Record<string, { text: string; error?: boolean }> = {
  published: { text: "Song published. It's live on the site now." },
  saved: { text: "Draft saved. It isn't visible on the site yet." },
  deleted: { text: "Song deleted." },
  "artist-deleted": { text: "Artist deleted." },
  merged: { text: "Artists merged. The old artist page now redirects." },
  "owners-only": { text: "Only owners can open that page.", error: true },
};

/** Shows the result of the last action (passed as ?toast=...) once, then removes it from the URL. */
export function FlashToast({ kind }: { kind?: string }) {
  useEffect(() => {
    const message = kind && MESSAGES[kind];
    if (!message) return;
    // The id stops a second toast when React runs effects twice in development.
    (message.error ? toast.error : toast.success)(message.text, { id: `flash-${kind}` });

    const url = new URL(window.location.href);
    url.searchParams.delete("toast");
    window.history.replaceState(null, "", url);
  }, [kind]);

  return null;
}
