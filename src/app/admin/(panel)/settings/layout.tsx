import { TabLinks } from "@/components/admin/tab-links";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

const TABS = [
  { href: "/admin/settings", label: "General" },
  { href: "/admin/settings/home", label: "Home page" },
  { href: "/admin/settings/branding", label: "Logo & images" },
  { href: "/admin/settings/seo", label: "Search engines" },
];

// Each settings page checks for an owner itself; layouts don't re-run on every navigation.
export default function SettingsLayout({ children }: LayoutProps<"/admin/settings">) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <TabLinks label="Settings sections" items={TABS} />
      </div>
      {children}
    </div>
  );
}
