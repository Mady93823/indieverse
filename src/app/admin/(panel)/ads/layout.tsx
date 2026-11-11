import { TabLinks } from "@/components/admin/tab-links";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

const TABS = [
  { href: "/admin/ads", label: "Guide" },
  { href: "/admin/ads/settings", label: "Ad settings" },
];

// Each page checks for an owner itself; layouts don't re-run on every navigation.
export default function AdsLayout({ children }: LayoutProps<"/admin/ads">) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Google AdSense</h1>
          <p className="text-sm text-muted-foreground">Earn from the site with Google ads, set up step by step.</p>
        </div>
        <TabLinks label="AdSense sections" items={TABS} />
      </div>
      {children}
    </div>
  );
}
