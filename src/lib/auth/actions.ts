"use server";

import { redirect } from "next/navigation";
import { setTimeout as sleep } from "node:timers/promises";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const admin = email ? await db.admin.findUnique({ where: { email } }) : null;
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    // Slows down password guessing.
    await sleep(1000);
    return { error: "Wrong email or password." };
  }

  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
