import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

/** Every subscriber as a CSV file, for importing into an email tool. Owners only. */
export async function GET() {
  await requireAdmin("OWNER");
  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "asc" } });
  const rows = [["email", "joined"], ...subscribers.map((s) => [s.email, s.createdAt.toISOString()])];
  // Emails can't contain commas or quotes in practice, but quote every field anyway.
  const csv = rows.map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(",")).join("\r\n");
  return new Response(`${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
