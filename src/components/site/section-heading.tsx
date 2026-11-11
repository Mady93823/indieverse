import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** A section title and an optional "View all →" link on the right. */
export function SectionHeading({
  id,
  title,
  href,
  linkLabel,
  className,
}: {
  id: string;
  title: React.ReactNode;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2", className)}>
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-balance">
        {title}
      </h2>
      {href && linkLabel && (
        <Link href={href} className="group inline-flex items-center gap-1 text-sm font-medium text-pink hover:underline hover:underline-offset-4">
          {linkLabel}
          <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/** A full-width band of the page with its own background, holding one section. */
export function Band({
  labelledBy,
  className,
  children,
}: {
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={labelledBy} className={cn("py-10 sm:py-14", className)}>
      {children}
    </section>
  );
}
