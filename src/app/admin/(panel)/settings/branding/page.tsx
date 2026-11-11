import type { Metadata } from "next";
import Image from "next/image";
import { BrandImageCard } from "@/components/admin/brand-image-card";
import { SiteLogo } from "@/components/site/site-logo";
import { requireAdmin } from "@/lib/auth/session";
import { brandImageUrl, markUrl, type BrandKind } from "@/lib/brand";
import { removeBrandImage, uploadBrandImage } from "@/lib/settings/branding-actions";
import { getSettings } from "@/lib/settings/queries";
import { cn } from "@/lib/utils";
import defaultHero from "../../../../../../public/Neon Lights Over a Rock Concert.png";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Logo & images" };

export default async function BrandingSettingsPage() {
  await requireAdmin("OWNER");
  const { general, home, branding } = await getSettings();
  const { mark, logo, shareImage, hero } = branding;

  const actions = (kind: BrandKind) => ({
    upload: uploadBrandImage.bind(null, kind),
    remove: removeBrandImage.bind(null, kind),
  });
  const header = (scheme: "light" | "dark") => (
    <HeaderPreview scheme={scheme}>
      <SiteLogo name={general.siteName} nameTamil={general.siteNameTamil} branding={branding} scheme={scheme} />
    </HeaderPreview>
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Images save as soon as you pick them. Use PNG, JPG or WebP up to 5 MB. A PNG with a transparent background
        works best for logos.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <BrandImageCard
          title="Logo mark"
          description="A square icon. Used in the header next to the site name, as the browser tab icon and when someone adds the site to their phone's home screen."
          imageUrl={mark && markUrl(mark, 192)}
          {...actions("mark")}
          preview={
            <div className="flex flex-wrap items-center gap-4">
              <Image
                src={markUrl(mark, 192)}
                width={72}
                height={72}
                alt="Current logo mark"
                className="size-18 rounded-2xl border bg-muted/50"
              />
              <span className="flex items-center gap-2 rounded-t-lg border border-b-0 bg-muted/60 px-3 py-2 text-xs">
                <Image src={markUrl(mark, 32)} width={16} height={16} alt="" className="size-4" />
                {general.siteName}
              </span>
              {!mark && <span className="text-sm text-muted-foreground">Showing the built-in icon.</span>}
            </div>
          }
        />
        <BrandImageCard
          title="Share image"
          description="Shown when a page without its own picture is shared on WhatsApp, Instagram or X. Song pages use their cover instead. 1200 × 630 works best."
          imageUrl={shareImage && brandImageUrl("shareImage", shareImage.id)}
          {...actions("shareImage")}
          preview={
            <div className="flex aspect-[1200/630] w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border bg-muted text-sm text-muted-foreground">
              {shareImage ? (
                <Image
                  src={brandImageUrl("shareImage", shareImage.id)}
                  width={shareImage.width}
                  height={shareImage.height}
                  alt="Current share image"
                  className="size-full object-cover"
                />
              ) : (
                "No share image yet"
              )}
            </div>
          }
        />
        <BrandImageCard
          title="Home page background"
          description="The photo beside the headline and search box on the home page (wide screens only). A 4:3 photo at least 1200 px wide works best."
          imageUrl={hero && brandImageUrl("hero", hero.id)}
          {...actions("hero")}
          preview={
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border bg-[#070914]">
              <Image
                src={hero ? brandImageUrl("hero", hero.id) : defaultHero}
                alt="Current home page background"
                fill
                sizes="(min-width: 1024px) 480px, 90vw"
                className="object-cover opacity-70"
              />
              <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-lg text-white">
                {home.headline}
              </span>
              {!hero && (
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">Built-in photo</span>
              )}
            </div>
          }
        />
        <BrandImageCard
          title="Wide logo"
          description="Optional. A logo that includes the name, light enough for the dark header; it replaces the mark and the name. It's shown 36 px tall."
          imageUrl={logo && brandImageUrl("logo", logo.id)}
          {...actions("logo")}
          preview={header("dark")}
        />
      </div>
    </div>
  );
}

/** The site header's colours in light or dark mode, whatever mode the admin's device uses. */
function HeaderPreview({ scheme, children }: { scheme: "light" | "dark"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex h-16 items-center rounded-lg border px-4",
        scheme === "light" ? "bg-[#fbfbfe] text-[#1c1a3d]" : "border-white/10 bg-[#05070f] text-[#f3f4f8]",
      )}
    >
      {children}
      <span className="sr-only">{scheme === "light" ? "Light mode" : "Dark mode"} header preview</span>
    </div>
  );
}
