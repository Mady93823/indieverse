import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE as COOKIE_NAME } from "@/lib/auth/cookie";
import { db } from "@/lib/db";
import type { AdminRole } from "@/generated/prisma/client";

const SESSION_DAYS = 30;

export type CurrentAdmin = { id: number; name: string; email: string; role: AdminRole };

// The cookie holds a random token; the database only stores its hash.
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({ data: { id: hashToken(token), adminId, expiresAt } });
  // Clean up this admin's expired sessions while we're here.
  await db.session.deleteMany({ where: { adminId, expiresAt: { lt: new Date() } } });

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  cookieStore.delete(COOKIE_NAME);
}

/** Logs an admin out on every other device, keeping the current session. */
export async function deleteOtherSessions(adminId: number) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  await db.session.deleteMany({ where: { adminId, ...(token && { id: { not: hashToken(token) } }) } });
}

/** The logged-in admin, or null. Cached per request so several callers share one lookup. */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    select: { expiresAt: true, admin: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.admin;
});

/**
 * Use at the top of every admin page and admin Server Action.
 * Pass "OWNER" for site settings, ads and the team; editors are sent back to the dashboard.
 */
export async function requireAdmin(role?: "OWNER"): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (role === "OWNER" && admin.role !== "OWNER") redirect("/admin?toast=owners-only");
  return admin;
}
