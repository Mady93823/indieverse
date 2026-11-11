"use server";

import { z } from "zod";
import { db } from "@/lib/db";

export type SubscribeState = { ok?: boolean; error?: string };

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());

/** Saves a newsletter sign-up. Signing up twice is fine; it's stored once. */
export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  // A field people can't see: bots that fill in every field are quietly ignored.
  if (formData.get("website")) return { ok: true };
  const parsed = email.safeParse(formData.get("email") ?? "");
  if (!parsed.success) return { error: "Enter a valid email address." };
  await db.subscriber.upsert({ where: { email: parsed.data }, create: { email: parsed.data }, update: {} });
  return { ok: true };
}
