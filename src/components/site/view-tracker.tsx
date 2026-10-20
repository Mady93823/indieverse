"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/songs/view-action";

/** Counts one view per song per browser tab session. Renders nothing. */
export function ViewTracker({ songId }: { songId: number }) {
  useEffect(() => {
    const key = `viewed:${songId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: still count the view.
    }
    recordView(songId).catch(() => {});
  }, [songId]);

  return null;
}
