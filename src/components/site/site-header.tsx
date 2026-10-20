import Link from "next/link";
import { AudioLinesIcon } from "lucide-react";
import { SearchBox } from "@/components/site/search-box";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <AudioLinesIcon className="size-5" aria-hidden />
          </span>
          IndieVerse
        </Link>
        <SearchBox className="order-last w-full sm:order-none sm:ml-auto sm:w-72" />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        IndieVerse · Tamil indie & I-pop lyrics in{" "}
        <span lang="ta">தமிழ்</span> and English
      </div>
    </footer>
  );
}
