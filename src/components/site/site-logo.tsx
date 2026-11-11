import Image from "next/image";
import { MusicIcon } from "lucide-react";
import { brandImageUrl, markUrl } from "@/lib/brand";
import type { SiteSettings } from "@/lib/settings/schema";
import { cn } from "@/lib/utils";

/**
 * The header logo: the uploaded wide logo if there is one (with its dark-mode version),
 * otherwise the logo mark with the Tamil name above the English one. Without uploads the mark
 * is a pink tile with a music note. `scheme` forces light or dark, for previews in the admin.
 */
export function SiteLogo({
  name,
  nameTamil,
  branding,
  scheme = "auto",
}: {
  name: string;
  nameTamil: string;
  branding: SiteSettings["branding"];
  scheme?: "auto" | "light" | "dark";
}) {
  const { logo, logoDark, mark } = branding;

  if (logo) {
    const showLight = scheme === "auto" ? (logoDark ? "dark:hidden" : "") : scheme === "light" || !logoDark ? "" : "hidden";
    const showDark = scheme === "auto" ? "hidden dark:block" : scheme === "dark" ? "" : "hidden";
    return (
      <>
        <Image
          src={brandImageUrl("logo", logo.id)}
          width={logo.width}
          height={logo.height}
          alt={name}
          priority
          className={cn("h-9 w-auto", showLight)}
        />
        {logoDark && (
          <Image
            src={brandImageUrl("logoDark", logoDark.id)}
            width={logoDark.width}
            height={logoDark.height}
            alt={name}
            priority
            className={cn("h-9 w-auto", showDark)}
          />
        )}
      </>
    );
  }

  return (
    <span className="flex items-center gap-3">
      {mark ? (
        <Image src={markUrl(mark, 192)} width={38} height={38} alt="" priority className="size-[38px] rounded-xl" />
      ) : (
        <span aria-hidden className="flex size-[38px] items-center justify-center rounded-xl bg-pink text-white">
          <MusicIcon className="size-5" />
        </span>
      )}
      {nameTamil ? (
        <span className="flex flex-col leading-none">
          <span lang="ta" className="text-lg font-medium">
            {nameTamil}
          </span>
          <span className="mt-1 text-[0.625rem] tracking-[0.22em] uppercase opacity-60" translate="no">
            {name}
          </span>
        </span>
      ) : (
        <span className="text-lg font-semibold tracking-tight" translate="no">
          {name}
        </span>
      )}
    </span>
  );
}
