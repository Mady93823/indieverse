"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { errorsFrom, type FormState } from "@/lib/form-state";
import { SETTINGS_TAG } from "@/lib/settings/queries";
import { DEFAULT_SETTINGS, SETTINGS_SCHEMAS, type SettingsGroup } from "@/lib/settings/schema";

// Branding is saved by its upload actions instead (see branding-actions.ts).
type FormGroup = Exclude<SettingsGroup, "branding">;

/** Saves one settings tab. Bound with the group name by each settings page. */
export async function saveSettings(group: FormGroup, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin("OWNER");

  const parsed = SETTINGS_SCHEMAS[group].safeParse(fromForm(DEFAULT_SETTINGS[group], formData));
  if (!parsed.success) return errorsFrom(parsed.error);

  const value = parsed.data;
  await db.setting.upsert({ where: { key: group }, create: { key: group, value }, update: { value } });
  updateTag(SETTINGS_TAG);
  return { ok: Date.now() };
}

/**
 * Builds the group's shape from the form, using the defaults as the template:
 * switches (checkboxes) become booleans, nested groups use dotted names ("placements.home.slot").
 */
function fromForm(template: object, formData: FormData, prefix = ""): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(template).map(([key, value]) => {
      const name = prefix + key;
      if (typeof value === "boolean") return [key, formData.get(name) === "on"];
      if (value && typeof value === "object") return [key, fromForm(value, formData, `${name}.`)];
      return [key, String(formData.get(name) ?? "")];
    }),
  );
}
