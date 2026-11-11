import { cn } from "@/lib/utils";

/**
 * Stands in for an ad in the admin's ad preview: same space as a real ad unit (see AdSlot),
 * numbered like the ad map, pink when the place is on and grey when it's off.
 */
export function AdPlaceholder({
  number,
  label,
  on,
  className,
}: {
  number: number;
  label: string;
  on: boolean;
  className?: string;
}) {
  return (
    <aside aria-label={`Ad position ${number}: ${label}`} className={cn("my-8 flex flex-col items-center gap-1 text-sm", className)}>
      <span className="text-[0.6875rem] tracking-wider text-muted-foreground uppercase">Advertisement</span>
      <div
        className={cn(
          "flex min-h-[280px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center",
          on ? "border-pink bg-pink/10" : "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
        )}
      >
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full text-lg font-semibold",
            on ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20",
          )}
        >
          {number}
        </span>
        <span className="text-base font-semibold">{label}</span>
        <span>{on ? "On: an ad shows here" : "Off: nothing shows here"}</span>
      </div>
    </aside>
  );
}
