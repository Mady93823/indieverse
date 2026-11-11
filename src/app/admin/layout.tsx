import type { Metadata } from "next";

// The admin reads the login cookie on every page, so it always renders on the server
// instead of being prerendered like the public site. Each admin layout and page repeats
// this setting, because Next.js also checks navigations between them.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex flex-1 flex-col bg-muted/40">{children}</div>;
}
