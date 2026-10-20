import Link from "next/link";
import { SearchBox } from "@/components/site/search-box";
import { Button } from "@/components/ui/button";

export function NotFoundMessage() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">We couldn’t find that page</h1>
      <p className="text-muted-foreground">
        The song may have been removed, or the link has a typo. Try searching for it instead.
      </p>
      <SearchBox size="lg" />
      <Button variant="link" asChild>
        <Link href="/">Go to the home page</Link>
      </Button>
    </div>
  );
}
