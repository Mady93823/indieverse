import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Container } from "@/components/site/container";
import { SearchBox } from "@/components/site/search-box";
import { Button } from "@/components/ui/button";

// "இ" is the first letter of IndieVerse written in Tamil (இண்டிவர்ஸ்).
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <span
        aria-hidden
        lang="ta"
        className="flex size-9 items-center justify-center rounded-full bg-marigold pt-0.5 font-display text-xl font-semibold text-marigold-foreground"
      >
        இ
      </span>
      <span className="font-display text-xl font-semibold tracking-tight" translate="no">
        IndieVerse
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b">
      <Container className="flex h-16 items-center gap-6">
        <Logo />
        <SearchBox className="ml-auto hidden w-80 md:block" />
        <Button variant="ghost" size="icon-lg" asChild className="ml-auto md:hidden">
          <Link href="/search" aria-label="Search">
            <SearchIcon aria-hidden />
          </Link>
        </Button>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <Container className="flex flex-col gap-1 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-display text-base font-semibold text-foreground" translate="no">
            IndieVerse
          </span>{" "}
          has lyrics for Tamil indie and I-pop songs.
        </p>
        <p>
          Read every song in <span lang="ta">தமிழ்</span> or in English letters.
        </p>
      </Container>
    </footer>
  );
}
