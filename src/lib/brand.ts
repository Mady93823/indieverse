// Where uploaded brand images live. Shared by the upload code and the pages that show them.

/** The square logo mark is stored at every size the site needs (header, favicon, phone icons). */
export const MARK_SIZES = [32, 180, 192, 512] as const;

export type MarkSize = (typeof MARK_SIZES)[number];
export type BrandKind = "mark" | "logo" | "logoDark" | "shareImage" | "hero";
export type BrandImage = { id: string; width: number; height: number };

/** Public URL of an uploaded brand image. A mark exists at several sizes. */
export function brandImageUrl(kind: BrandKind, id: string, size: MarkSize = 512) {
  if (kind === "mark") return `/uploads/brand/${id}-${size}.png`;
  return `/uploads/brand/${id}.${kind === "shareImage" ? "jpg" : kind === "hero" ? "webp" : "png"}`;
}

/** The logo mark at a size, or the built-in "இ" icon (public/brand) when none is uploaded. */
export function markUrl(mark: BrandImage | null, size: MarkSize) {
  return mark ? brandImageUrl("mark", mark.id, size) : `/brand/icon-${size}.png`;
}
