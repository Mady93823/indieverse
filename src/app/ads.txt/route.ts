import { getSettings } from "@/lib/settings/queries";

// Tells ad buyers which AdSense account may sell ads on this site. AdSense checks it after approval.
// It appears as soon as a publisher ID is saved in Admin → Ads.
export async function GET() {
  const { ads } = await getSettings();
  if (!ads.publisherId) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${ads.publisherId.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
