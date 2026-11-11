import type { Metadata } from "next";
import { LogOutIcon } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { Section, TextField } from "@/components/admin/form-parts";
import { Button } from "@/components/ui/button";
import { changePassword, signOutOtherDevices, updateProfile } from "@/lib/auth/account-actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const admin = await requireAdmin();
  const sessions = await db.session.count({ where: { adminId: admin.id, expiresAt: { gt: new Date() } } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re {admin.role === "OWNER" ? "an owner" : "an editor"}.{" "}
          {admin.role === "OWNER"
            ? "You can change everything, including settings, ads and the team."
            : "You can add and edit songs, artists and pages. Owners manage settings, ads and the team."}
        </p>
      </div>

      <AdminForm action={updateProfile} successMessage="Profile saved.">
        <Section title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="Name" defaultValue={admin.name} autoComplete="name" required />
            <TextField name="email" label="Email" type="email" defaultValue={admin.email} autoComplete="email" hint="You log in with this." required />
          </div>
        </Section>
      </AdminForm>

      <AdminForm
        action={changePassword}
        submitLabel="Change password"
        successMessage="Password changed. Other devices are logged out."
        resetOnSuccess
      >
        <Section title="Password" description="Changing it logs you out on every other device.">
          <TextField name="currentPassword" label="Current password" type="password" autoComplete="current-password" required className="sm:max-w-xs" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="password"
              label="New password"
              type="password"
              autoComplete="new-password"
              hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
              required
            />
            <TextField name="confirm" label="New password again" type="password" autoComplete="new-password" required />
          </div>
        </Section>
      </AdminForm>

      <Section
        title="Devices"
        description={
          sessions > 1
            ? `You're logged in on ${sessions} devices or browsers, including this one.`
            : "You're only logged in here."
        }
      >
        <form action={signOutOtherDevices}>
          <Button type="submit" variant="outline" disabled={sessions <= 1} className="h-9">
            <LogOutIcon data-icon="inline-start" aria-hidden />
            Log out everywhere else
          </Button>
        </form>
      </Section>
    </div>
  );
}
