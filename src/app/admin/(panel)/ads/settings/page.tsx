import type { Metadata } from "next";
import Link from "next/link";
import { AdMap, PlacementNumber } from "@/components/admin/ad-map";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, SwitchField, TextField } from "@/components/admin/form-parts";
import { requireAdmin } from "@/lib/auth/session";
import { saveSettings } from "@/lib/settings/actions";
import { getSettings } from "@/lib/settings/queries";
import { AD_PLACEMENTS, type AdPlacement } from "@/lib/settings/schema";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Ad settings" };

export default async function AdSettingsPage() {
  await requireAdmin("OWNER");
  const { ads } = await getSettings();
  const on = Object.fromEntries(
    AD_PLACEMENTS.map(({ id }) => [id, ads.placements[id].enabled && !!ads.placements[id].slot]),
  ) as Record<AdPlacement, boolean>;

  return (
    <AdminForm action={saveSettings.bind(null, "ads")} successMessage="Ad settings saved.">
      <Section
        title="Your AdSense account"
        description="Saving the publisher ID adds Google's verification tag and /ads.txt to the site, even while ads are off."
      >
        <TextField
          name="publisherId"
          label="Publisher ID"
          defaultValue={ads.publisherId}
          placeholder="ca-pub-1234567890123456"
          hint="In AdSense: Account → Settings → Account information. You can also paste the code AdSense shows; the ID is taken from it."
        />
        {ads.publisherId && (
          <p className="text-sm text-muted-foreground">
            ads.txt is live at{" "}
            <Link href="/ads.txt" target="_blank" className="font-medium text-foreground underline underline-offset-4">
              /ads.txt
            </Link>
            .
          </p>
        )}
        <SwitchField
          name="enabled"
          label="Show ads"
          hint="Only after AdSense has approved the site. Turning this off removes every ad and the AdSense script at once."
          defaultChecked={ads.enabled}
        />
      </Section>

      <Section
        title="Where ads appear"
        description={
          <>
            The numbers match the places below; marigold ones are switched on (after saving). Create one display ad
            unit per place in AdSense (Ads → By ad unit → Display ads, “Responsive”) and paste its slot ID, the number
            after <code>data-ad-slot</code>. Songs with “Hide ads” turned on never show ads.
          </>
        }
      >
        <AdMap on={on} />
        <div className="divide-y border-t pt-4">
          {AD_PLACEMENTS.map((placement) => (
            <div key={placement.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_14rem] sm:items-start sm:gap-6">
              <SwitchField
                name={`placements.${placement.id}.enabled`}
                label={
                  <span className="flex items-center gap-2">
                    <PlacementNumber id={placement.id} on={on[placement.id]} />
                    {placement.label}
                  </span>
                }
                hint={placement.hint}
                defaultChecked={ads.placements[placement.id].enabled}
              />
              <TextField
                name={`placements.${placement.id}.slot`}
                label="Slot ID"
                inputMode="numeric"
                defaultValue={ads.placements[placement.id].slot}
                placeholder="1234567890"
              />
            </div>
          ))}
        </div>
      </Section>
    </AdminForm>
  );
}
