import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Tamil } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { brandImageUrl, markUrl } from "@/lib/brand";
import { getSettings } from "@/lib/settings/queries";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// Inter for Latin text, as in the client's design; Tamil letters fall through to Noto Sans Tamil.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
});

// Site-wide titles, icons and verification tags come from the admin's settings.
// The settings are cached, so every page is still prerendered.
export async function generateMetadata(): Promise<Metadata> {
  const { general, home, seo, branding, ads } = await getSettings();
  const shareImage = branding.shareImage && {
    url: brandImageUrl("shareImage", branding.shareImage.id),
    width: branding.shareImage.width,
    height: branding.shareImage.height,
  };

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: seo.homeTitle || `${general.siteName} – ${general.tagline}`,
      template: `%s | ${general.siteName}`,
    },
    description: seo.homeDescription || home.intro,
    applicationName: general.siteName,
    openGraph: { siteName: general.siteName, type: "website", images: shareImage || undefined },
    twitter: { card: shareImage ? "summary_large_image" : "summary" },
    icons: {
      icon: [
        { url: markUrl(branding.mark, 32), sizes: "32x32", type: "image/png" },
        { url: markUrl(branding.mark, 192), sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: markUrl(branding.mark, 180), sizes: "180x180", type: "image/png" }],
    },
    robots: seo.hideFromSearch ? { index: false, follow: false } : undefined,
    verification: {
      google: seo.googleVerification || undefined,
      other: seo.bingVerification ? { "msvalidate.01": seo.bingVerification } : undefined,
    },
    // Lets AdSense check the site belongs to the account, even before ads are switched on.
    other: ads.publisherId ? { "google-adsense-account": ads.publisherId } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfe" },
    { media: "(prefers-color-scheme: dark)", color: "#121029" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${notoTamil.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only rounded-lg bg-background px-4 py-2 font-medium shadow-lg ring-2 ring-ring focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
