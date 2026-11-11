import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, SwitchField, TextField } from "@/components/admin/form-parts";
import { SeoFields } from "@/components/admin/seo-fields";
import { requireAdmin } from "@/lib/auth/session";
import { saveSettings } from "@/lib/settings/actions";
import { getSettings } from "@/lib/settings/queries";
import { siteUrl } from "@/lib/site-url";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Search engine settings" };

export default async function SeoSettingsPage() {
  await requireAdmin("OWNER");
  const { general, home, seo } = await getSettings();
  const site = siteUrl();

  return (
    <AdminForm action={saveSettings.bind(null, "seo")} successMessage="Search engine settings saved.">
      <Section
        title="Home page in search results"
        description={`Song and artist pages get their titles automatically, ending in “| ${general.siteName}”.`}
      >
        <SeoFields
          titleName="homeTitle"
          descriptionName="homeDescription"
          defaultTitle={seo.homeTitle}
          defaultDescription={seo.homeDescription}
          autoTitle={`${general.siteName} – ${general.tagline}`}
          autoDescription={home.intro}
          url={site}
        />
      </Section>

      <Section
        title="Prove you own the site"
        description="Search Console and Bing Webmaster Tools show which searches bring people here and warn you about problems. Both are free."
      >
        <TextField
          name="googleVerification"
          label="Google Search Console code"
          defaultValue={seo.googleVerification}
          placeholder='Paste the whole <meta name="google-site-verification" …> tag or just the code'
          hint={
            <>
              In <a className="underline" href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Search Console</a>, add a
              “URL prefix” property for {site}, choose “HTML tag”, and paste it here. Save, then click Verify there.
            </>
          }
        />
        <TextField
          name="bingVerification"
          label="Bing Webmaster Tools code"
          defaultValue={seo.bingVerification}
          placeholder='Paste the whole <meta name="msvalidate.01" …> tag or just the code'
          hint={
            <>
              Optional. In <a className="underline" href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer">Bing Webmaster Tools</a>, you can
              also import the site straight from Search Console instead.
            </>
          }
        />
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">Your sitemap</p>
          <p className="text-muted-foreground">
            Submit <code className="rounded bg-background px-1 py-0.5 text-foreground">{site}/sitemap.xml</code> under
            Sitemaps in Search Console once. It lists every published song, artist and page, and updates itself.
          </p>
        </div>
      </Section>

      <Section title="Visibility">
        <SwitchField
          name="hideFromSearch"
          label="Hide the whole site from search engines"
          defaultChecked={seo.hideFromSearch}
          hint={
            <span className="text-destructive">
              Only for testing, or while demo songs are live. While this is on, Google removes the site from its results.
            </span>
          }
        />
      </Section>
    </AdminForm>
  );
}
