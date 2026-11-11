import Link from "next/link";
import { SearchBox } from "@/components/site/search-box";
import { Button } from "@/components/ui/button";

export function NotFoundMessage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-20 text-center">
      <p lang="ta" aria-hidden className="text-6xl text-pink">
        அச்சச்சோ
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance">We couldn’t find that page</h1>
      <p className="text-pretty text-muted-foreground">
        The song may have been removed, or the link has a typo. Search for it instead.
      </p>
      <SearchBox size="lg" className="w-full" />
      <Button variant="link" asChild>
        <Link href="/">Go to the home page</Link>
      </Button>
    </div>
  );
}
