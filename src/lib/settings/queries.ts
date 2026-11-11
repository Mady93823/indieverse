import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { readGroup, SETTINGS_SCHEMAS, type SettingsGroup, type SiteSettings } from "@/lib/settings/schema";

// Saving any setting clears this tag, so every prerendered page picks up the change.
export const SETTINGS_TAG = "settings";

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(SETTINGS_TAG);

  const rows = await db.setting.findMany();
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  const groups = Object.keys(SETTINGS_SCHEMAS) as SettingsGroup[];
  return Object.fromEntries(groups.map((group) => [group, readGroup(group, stored.get(group))])) as SiteSettings;
}
