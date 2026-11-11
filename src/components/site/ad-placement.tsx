import { AdPlaceholder } from "@/components/site/ad-placeholder";
import { AdSlot } from "@/components/site/ad-slot";
import { AD_PLACEMENTS, placementNumber, type AdPlacement as Placement } from "@/lib/settings/schema";
import { getSettings } from "@/lib/settings/queries";

/**
 * An ad at one of the fixed places on the site, if the admin turned ads and that place on.
 * With `preview` (the admin's ad preview) it always shows a labelled box instead, and never a real ad.
 */
export async function AdPlacement({ id, preview, className }: { id: Placement; preview?: boolean; className?: string }) {
  const { ads } = await getSettings();
  const placement = ads.placements[id];
  if (preview) {
    const { label } = AD_PLACEMENTS.find((p) => p.id === id)!;
    return <AdPlaceholder number={placementNumber(id)} label={label} on={placement.enabled && !!placement.slot} className={className} />;
  }
  if (!ads.enabled || !ads.publisherId || !placement.enabled || !placement.slot) return null;
  return <AdSlot client={ads.publisherId} slot={placement.slot} className={className} />;
}

/** Loads AdSense on public pages while ads are on. The admin never loads it. */
export async function AdsenseScript() {
  const { ads } = await getSettings();
  if (!ads.enabled || !ads.publisherId) return null;
  return (
    // A plain async script, as AdSense asks; next/script would add attributes AdSense warns about.
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.publisherId}`}
      crossOrigin="anonymous"
    />
  );
}
