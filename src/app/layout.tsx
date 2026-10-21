import type { Metadata, Viewport } from "next";
import { Arima, Catamaran } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Both families were designed for Tamil and Latin together, so the two scripts match.
const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["latin", "tamil"],
});

const arima = Arima({
  variable: "--font-arima",
  subsets: ["latin", "tamil"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: {
    default: "IndieVerse – Tamil Indie & I-Pop Lyrics",
    template: "%s | IndieVerse",
  },
  description:
    "Lyrics for Tamil indie and I-pop songs, in Tamil script and in English letters.",
  openGraph: { siteName: "IndieVerse", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfe" },
    { media: "(prefers-color-scheme: dark)", color: "#121029" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${catamaran.variable} ${arima.variable} h-full antialiased`}>
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
