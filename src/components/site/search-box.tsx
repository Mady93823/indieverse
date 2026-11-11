import Form from "next/form";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** A plain GET form to /search, so it works before JavaScript loads too. */
export function SearchBox({ className, size = "default" }: { className?: string; size?: "default" | "lg" }) {
  return (
    <Form action="/search" role="search" className={cn("relative", className)}>
      <SearchIcon
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          size === "lg" ? "left-4 size-5" : "left-3 size-4",
        )}
      />
      <Input
        type="search"
        name="q"
        placeholder="Search a song or artist…"
        aria-label="Search songs or artists"
        autoComplete="off"
        enterKeyHint="search"
        className={cn(
          "bg-card",
          size === "lg" ? "h-14 rounded-full pl-12 text-lg md:text-lg" : "h-10 rounded-full pl-9",
        )}
      />
    </Form>
  );
}
