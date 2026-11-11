import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveUploadPath } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

// Serves uploaded images. File names are unique and never reused, so browsers can cache them forever.
// In production a web server such as nginx can serve the upload folder directly instead.
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const file = resolveUploadPath((await params).path);
  if (!file) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(file);
    return new Response(data, {
      headers: {
        "Content-Type": CONTENT_TYPES[path.extname(file)],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
