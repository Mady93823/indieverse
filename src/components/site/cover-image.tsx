import Image from "next/image";
import { MusicIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Square song cover, or a placeholder when the song has none. */
export function CoverImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-xl bg-muted", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/25 via-primary/10 to-muted">
          <MusicIcon className="size-1/3 text-primary/60" aria-hidden />
        </div>
      )}
    </div>
  );
}
