import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, SwitchField, TextAreaField, TextField } from "@/components/admin/form-parts";
import { requireAdmin } from "@/lib/auth/session";
import { saveSettings } from "@/lib/settings/actions";
import { getSettings } from "@/lib/settings/queries";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Home page settings" };

export default async function HomeSettingsPage() {
  await requireAdmin("OWNER");
  const { home } = await getSettings();

  return (
    <AdminForm action={saveSettings.bind(null, "home")} successMessage="Home page updated.">
      <Section title="Hero" description="The top of the home page, beside the photo on wide screens (change the photo under Logo & images).">
        <TextField name="eyebrow" label="Small label above the headline" defaultValue={home.eyebrow} placeholder="Tamil music, line by line" />
        <TextField name="headline" label="Headline" defaultValue={home.headline} required />
        <TextAreaField
          name="intro"
          label="Intro"
          rows={2}
          defaultValue={home.intro}
          hint="Also used as the site's description in search results, unless you set one under Search engines."
        />
        <TextField
          name="trySearches"
          label="“Popular” searches under the search box"
          defaultValue={home.trySearches}
          placeholder="e.g. Ilaiyaraaja, Anirudh, 96, Kadhal songs"
          hint="Separate with commas. Leave empty to show the two most-read songs and the top two lyricists."
        />
      </Section>
      <Section title="Newsletter" description="The sign-up band at the bottom of the home page. Sign-ups appear under Subscribers.">
        <SwitchField name="showNewsletter" label="Show the newsletter sign-up" defaultChecked={home.showNewsletter} />
        <TextField name="newsletterTitle" label="Heading" defaultValue={home.newsletterTitle} />
        <TextAreaField name="newsletterText" label="Text" rows={2} defaultValue={home.newsletterText} />
      </Section>
      <p className="text-sm text-muted-foreground">
        The “Read along” reader shows the newest song with <strong>Feature on the home page</strong>{" "}
        turned on, or the most-read song if none is featured.
      </p>
    </AdminForm>
  );
}
