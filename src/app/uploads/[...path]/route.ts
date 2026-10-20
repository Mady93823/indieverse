import { readFile } from "node:fs/promises";
import { resolveUploadPath } from "@/lib/uploads";

// Serves uploaded covers. File names are unique and never reused, so browsers can cache them forever.
// In production a web server such as nginx can serve the upload folder directly instead.
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const file = resolveUploadPath((await params).path);
  if (!file) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(file);
    return new Response(data, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
