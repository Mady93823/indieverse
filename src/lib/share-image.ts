import sharp from "sharp";

// No "server-only" import here, so scripts (demo data, share-image backfill) can use it too.

/**
 * A 1200×630 JPEG for link previews (WhatsApp, Instagram, X): the square cover centred on a
 * blurred, darkened copy of itself. No text, so Tamil titles can't render wrongly.
 */
export async function shareImageFrom(cover: Buffer | string) {
  const background = await sharp(cover).resize(1200, 630, { fit: "cover" }).blur(40).modulate({ brightness: 0.7 }).toBuffer();
  const front = await sharp(cover).resize(560, 560).toBuffer();
  return sharp(background)
    .composite([{ input: front, gravity: "center" }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
}
