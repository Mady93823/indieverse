import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, TextAreaField, TextField } from "@/components/admin/form-parts";
import { requireAdmin } from "@/lib/auth/session";
import { saveSettings } from "@/lib/settings/actions";
import { getSettings } from "@/lib/settings/queries";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default async function GeneralSettingsPage() {
  await requireAdmin("OWNER");
  const { general } = await getSettings();

  return (
    <AdminForm action={saveSettings.bind(null, "general")} successMessage="Settings saved. The site shows them now.">
      <Section title="Site name" description="Shown in the header, the browser tab and search results.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="siteName" label="Name" defaultValue={general.siteName} required />
          <TextField
            name="siteNameTamil"
            label="Name in Tamil"
            lang="ta"
            defaultValue={general.siteNameTamil}
            hint="Helps people who search in Tamil find the site."
          />
          <TextField
            name="tagline"
            label="Tagline"
            defaultValue={general.tagline}
            hint="A few words about the site, used in the home page title."
            className="sm:col-span-2"
          />
        </div>
      </Section>

      <Section title="Contact & social" description="Shown in the footer and on the Contact, Privacy and Copyright pages.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="contactEmail"
            label="Contact email"
            type="email"
            defaultValue={general.contactEmail}
            placeholder="hello@your-domain.com"
            className="sm:col-span-2"
          />
          <TextField name="instagramUrl" label="Instagram" type="url" defaultValue={general.instagramUrl} placeholder="https://instagram.com/…" />
          <TextField name="youtubeUrl" label="YouTube" type="url" defaultValue={general.youtubeUrl} placeholder="https://youtube.com/@…" />
          <TextField name="xUrl" label="X (Twitter)" type="url" defaultValue={general.xUrl} placeholder="https://x.com/…" />
          <TextField name="facebookUrl" label="Facebook" type="url" defaultValue={general.facebookUrl} placeholder="https://facebook.com/…" />
        </div>
      </Section>

      <Section title="Footer">
        <TextAreaField name="footerText" label="Footer text" rows={2} defaultValue={general.footerText} />
      </Section>
    </AdminForm>
  );
}
