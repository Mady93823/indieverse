"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  published: "Song published. It's live on the site now.",
  saved: "Draft saved. It isn't visible on the site yet.",
  deleted: "Song deleted.",
};

/** Shows the result of the last save (passed as ?toast=...) once, then removes it from the URL. */
export function FlashToast({ kind }: { kind?: string }) {
  useEffect(() => {
    const message = kind && MESSAGES[kind];
    if (!message) return;
    // The id stops a second toast when React runs effects twice in development.
    toast.success(message, { id: `flash-${kind}` });

    const url = new URL(window.location.href);
    url.searchParams.delete("toast");
    window.history.replaceState(null, "", url);
  }, [kind]);

  return null;
}
