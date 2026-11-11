"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}

/**
 * One AdSense ad unit. Space is reserved before the ad loads so the lyrics don't jump,
 * and the whole block disappears if Google has no ad to show.
 */
export function AdSlot({ client, slot, className }: { client: string; slot: string; className?: string }) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Next.js keeps recently visited pages around; an <ins> that already has an ad must not be filled again.
    if (!ref.current || ref.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle ??= []).push({});
    } catch {
      // Ad blockers and AdSense's own errors shouldn't break the page.
    }
  }, []);

  return (
    <aside
      aria-label="Advertisement"
      className={cn("my-8 flex flex-col items-center gap-1 has-[ins[data-ad-status=unfilled]]:hidden", className)}
    >
      <span className="text-[0.6875rem] tracking-wider text-muted-foreground uppercase">Advertisement</span>
      <ins
        ref={ref}
        className="adsbygoogle block min-h-[280px] w-full"
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
