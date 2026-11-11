import { cn } from "@/lib/utils";

/** The site's page width and side padding (72 px on wide screens, as in the design). */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-[72px]", className)} {...props} />;
}
