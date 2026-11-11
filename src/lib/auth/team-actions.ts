"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { newPasswordSchema } from "@/lib/auth/schema";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { errorsFrom, type FormState } from "@/lib/form-state";

const role = z.enum(["OWNER", "EDITOR"]);

export async function addAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin("OWNER");
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Enter their name").max(80),
      email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
      role,
      password: newPasswordSchema,
    })
    .safeParse(Object.fromEntries(["name", "email", "role", "password"].map((k) => [k, formData.get(k) ?? ""])));
  if (!parsed.success) return errorsFrom(parsed.error);

  const { password, ...data } = parsed.data;
  if (await db.admin.findUnique({ where: { email: data.email } })) {
    return { fieldErrors: { email: ["This email already has a login"] } };
  }
  await db.admin.create({ data: { ...data, passwordHash: await hashPassword(password) } });
  revalidatePath("/admin/team");
  return { ok: Date.now() };
}

/** You can't change your own role or remove yourself, so there's always an owner. */
export async function changeRole(adminId: number, formData: FormData) {
  const me = await requireAdmin("OWNER");
  const parsed = role.safeParse(formData.get("role"));
  if (adminId === me.id || !parsed.success) return;
  await db.admin.update({ where: { id: adminId }, data: { role: parsed.data } });
  revalidatePath("/admin/team");
}

export async function removeAdmin(adminId: number) {
  const me = await requireAdmin("OWNER");
  if (adminId === me.id) return;
  // Their sessions go with them, so they're logged out at once.
  await db.admin.delete({ where: { id: adminId } });
  revalidatePath("/admin/team");
}
