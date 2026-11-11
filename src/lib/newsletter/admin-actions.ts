"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function deleteSubscriber(id: number) {
  await requireAdmin("OWNER");
  await db.subscriber.deleteMany({ where: { id } });
  revalidatePath("/admin/subscribers");
}
