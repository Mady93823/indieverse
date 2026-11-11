import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { Field, Section, TextField } from "@/components/admin/form-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/session";
import { addAdmin, changeRole, removeAdmin } from "@/lib/auth/team-actions";
import { db } from "@/lib/db";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Team" };

const selectClass =
  "h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function TeamPage() {
  const me = await requireAdmin("OWNER");
  const admins = await db.admin.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          <strong>Owners</strong> can change everything. <strong>Editors</strong> can add and edit songs, artists and
          pages, but not settings, ads or the team.
        </p>
      </div>

      <Section title="People with a login">
        <ul className="divide-y">
          {admins.map((admin) => (
            <li key={admin.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="mr-auto min-w-0">
                <p className="font-medium">
                  {admin.name} {admin.id === me.id && <span className="font-normal text-muted-foreground">(you)</span>}
                </p>
                <p className="truncate text-sm text-muted-foreground">{admin.email}</p>
              </div>
              {admin.id === me.id ? (
                <Badge>Owner</Badge>
              ) : (
                <>
                  <form action={changeRole.bind(null, admin.id)} className="flex items-center gap-2">
                    <label htmlFor={`role-${admin.id}`} className="sr-only">
                      Role for {admin.name}
                    </label>
                    <select id={`role-${admin.id}`} name="role" defaultValue={admin.role} className={selectClass}>
                      <option value="OWNER">Owner</option>
                      <option value="EDITOR">Editor</option>
                    </select>
                    <Button type="submit" variant="outline" size="sm">
                      Save
                    </Button>
                  </form>
                  <DeleteButton
                    label="Remove"
                    title={`Remove ${admin.name}?`}
                    description={`${admin.email} won't be able to log in any more. Songs they added stay on the site.`}
                    keepLabel="Keep"
                    action={removeAdmin.bind(null, admin.id)}
                  />
                </>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <AdminForm
        action={addAdmin}
        submitLabel="Add person"
        successMessage="Login created. Send them the email and password."
        resetOnSuccess
      >
        <Section
          title="Add a person"
          description="Give them their email and the temporary password yourself; they can change it under Account."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="Name" autoComplete="off" required />
            <TextField name="email" label="Email" type="email" autoComplete="off" required />
            <TextField
              name="password"
              label="Temporary password"
              type="text"
              autoComplete="off"
              hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
              required
            />
            <Field name="role" label="Role">
              <select id="role" name="role" defaultValue="EDITOR" className={`${selectClass} h-9 w-full`}>
                <option value="EDITOR">Editor</option>
                <option value="OWNER">Owner</option>
              </select>
            </Field>
          </div>
        </Section>
      </AdminForm>
    </div>
  );
}
