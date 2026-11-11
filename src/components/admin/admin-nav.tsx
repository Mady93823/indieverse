"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeIndianRupeeIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MailIcon,
  MicVocalIcon,
  MusicIcon,
  SettingsIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/songs", label: "Songs", icon: MusicIcon },
  { href: "/admin/artists", label: "Artists", icon: MicVocalIcon },
  { href: "/admin/pages", label: "Pages", icon: FileTextIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon, ownerOnly: true },
  { href: "/admin/ads", label: "Ads", icon: BadgeIndianRupeeIcon, ownerOnly: true },
  { href: "/admin/subscribers", label: "Subscribers", icon: MailIcon, ownerOnly: true },
  { href: "/admin/team", label: "Team", icon: UsersRoundIcon, ownerOnly: true },
  { href: "/admin/account", label: "Account", icon: UserRoundIcon },
];

/** Sidebar on wide screens, a sideways-scrolling row of tabs on phones. */
export function AdminNav({ isOwner, variant }: { isOwner: boolean; variant: "sidebar" | "tabs" }) {
  const pathname = usePathname();
  const items = ITEMS.filter((item) => isOwner || !item.ownerOnly);
  const isCurrent = (href: string) =>
    href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "tabs") {
    return (
      <nav aria-label="Admin" className="scroll-fade-x -mb-px flex gap-1 overflow-x-auto px-4">
        {items.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isCurrent(href) ? "page" : undefined}
            className="shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:border-marigold aria-[current=page]:text-foreground"
          >
            {label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Admin" className="sticky top-6 flex flex-col gap-0.5">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isCurrent(href) ? "page" : undefined}
          className={cn(
            "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none",
            "hover:bg-background/70 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
            "aria-[current=page]:bg-background aria-[current=page]:text-foreground aria-[current=page]:shadow-xs aria-[current=page]:ring-1 aria-[current=page]:ring-foreground/10",
          )}
        >
          <Icon className="size-4 group-aria-[current=page]:text-marigold-text" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
