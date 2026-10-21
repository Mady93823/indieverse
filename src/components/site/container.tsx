import { cn } from "@/lib/utils";

/** The site's page width and side padding. Pages use it so some sections can go full-bleed. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}
