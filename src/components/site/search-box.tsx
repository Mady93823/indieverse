import Form from "next/form";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** A plain GET form to /search, so it works before JavaScript loads too. */
export function SearchBox({
  defaultValue,
  autoFocus,
  className,
  size = "default",
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
  size?: "default" | "lg";
}) {
  return (
    <Form action="/search" role="search" className={cn("relative", className)}>
      <SearchIcon
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground",
          size === "lg" ? "size-5" : "size-4",
        )}
      />
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Search songs or artists"
        aria-label="Search songs or artists"
        enterKeyHint="search"
        className={cn(size === "lg" ? "h-12 rounded-xl pl-10 text-base" : "h-9 pl-9")}
      />
    </Form>
  );
}
