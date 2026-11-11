"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { ScriptToggle } from "@/components/site/lyrics-mode";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "/latest", label: "Latest lyrics" },
  { href: "/trending", label: "Trending" },
  { href: "/lyricists", label: "Lyricists" },
  { href: "/decades", label: "Decades" },
];

const isCurrent = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** Highlights the current section. Reading the address needs a <Suspense> boundary, so the
 * header renders <DesktopNavLinks pathname="" /> until it's known. */
export function DesktopNav() {
  return <DesktopNavLinks pathname={usePathname()} />;
}

export function DesktopNavLinks({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
          className="text-sm font-medium text-foreground/75 transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-pink"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

/** Stands in for the menu button until the address is known (see DesktopNav). */
export function MobileNavPlaceholder() {
  return (
    <div className="lg:hidden">
      <span aria-hidden className="flex size-10 items-center justify-center rounded-full text-foreground/80">
        <MenuIcon className="size-5" />
      </span>
    </div>
  );
}

/** The menu button and panel for phones and tablets. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close after navigating (adjusting state during render, as React recommends over an effect).
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [...NAV_LINKS, { href: "/songs", label: "All songs A–Z" }, { href: "/artists", label: "Artists" }];

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => {
          setOpen(!open);
          setOpenedAt(pathname);
        }}
        className="flex size-10 items-center justify-center rounded-full text-foreground/80 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {open ? <XIcon className="size-5" aria-hidden /> : <MenuIcon className="size-5" aria-hidden />}
      </button>
      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b bg-background shadow-lg"
      >
        <nav aria-label="Main" className="mx-auto flex max-w-[1440px] flex-col px-4 py-3 sm:px-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-2 py-3 text-base transition-colors hover:bg-muted",
                "aria-[current=page]:text-pink",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between gap-3 border-t px-2 pt-4 pb-2">
            <span className="text-sm text-muted-foreground">Lyrics script</span>
            <ScriptToggle />
          </div>
        </nav>
      </div>
    </div>
  );
}
