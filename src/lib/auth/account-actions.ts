"use server";

import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { newPasswordSchema } from "@/lib/auth/schema";
import { deleteOtherSessions, requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { errorsFrom, type FormState } from "@/lib/form-state";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = profileSchema.safeParse({ name: formData.get("name") ?? "", email: formData.get("email") ?? "" });
  if (!parsed.success) return errorsFrom(parsed.error);

  const taken = await db.admin.findFirst({ where: { email: parsed.data.email, id: { not: admin.id } } });
  if (taken) return { fieldErrors: { email: ["Another admin already uses this email"] } };

  await db.admin.update({ where: { id: admin.id }, data: parsed.data });
  return { ok: Date.now() };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const current = String(formData.get("currentPassword") ?? "");
  const parsed = z
    .object({ password: newPasswordSchema, confirm: z.string() })
    .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The two new passwords don't match" })
    .safeParse({ password: formData.get("password") ?? "", confirm: formData.get("confirm") ?? "" });
  if (!parsed.success) return errorsFrom(parsed.error);

  const { passwordHash } = await db.admin.findUniqueOrThrow({ where: { id: admin.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(current, passwordHash))) {
    return { fieldErrors: { currentPassword: ["That's not your current password"] } };
  }

  await db.admin.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(parsed.data.password) } });
  // Anyone who knew the old password is logged out.
  await deleteOtherSessions(admin.id);
  return { ok: Date.now() };
}

export async function signOutOtherDevices() {
  const admin = await requireAdmin();
  await deleteOtherSessions(admin.id);
}
