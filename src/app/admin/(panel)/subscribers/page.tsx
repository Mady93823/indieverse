import type { Metadata } from "next";
import { DownloadIcon } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { deleteSubscriber } from "@/lib/newsletter/admin-actions";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Subscribers" };

const SHOWN = 200;
const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function SubscribersPage({ searchParams }: PageProps<"/admin/subscribers">) {
  await requireAdmin("OWNER");
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const where = query ? { email: { contains: query, mode: "insensitive" as const } } : undefined;
  const [subscribers, total, all] = await Promise.all([
    db.subscriber.findMany({ where, orderBy: { createdAt: "desc" }, take: SHOWN }),
    db.subscriber.count({ where }),
    db.subscriber.count(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-semibold tracking-tight">Subscribers</h1>
          <p className="text-sm text-muted-foreground">
            {all.toLocaleString("en-IN")} {all === 1 ? "person has" : "people have"} joined the newsletter. Download the
            list to send email with any email tool, such as Mailchimp or Brevo.
          </p>
        </div>
        <form className="w-full sm:w-64" role="search">
          <Input type="search" name="q" defaultValue={query} placeholder="Find an email" aria-label="Find a subscriber" className="h-9 bg-background" />
        </form>
        <Button asChild className="h-9" variant={all === 0 ? "outline" : "default"}>
          <a href="/admin/subscribers/export" download>
            <DownloadIcon data-icon="inline-start" aria-hidden />
            Download CSV
          </a>
        </Button>
      </div>

      {subscribers.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center">
          <p className="font-medium">{query ? `No subscribers match “${query}”.` : "No subscribers yet."}</p>
          {!query && (
            <p className="mt-1 text-sm text-muted-foreground">
              Sign-ups from the newsletter band on the home page will appear here.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="pl-4 font-medium">{subscriber.email}</TableCell>
                  <TableCell className="text-muted-foreground">{dateFormat.format(subscriber.createdAt)}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <DeleteButton
                      label="Remove"
                      title={`Remove ${subscriber.email}?`}
                      description="Use this when someone asks to unsubscribe. They won't be in the next download."
                      keepLabel="Keep"
                      action={deleteSubscriber.bind(null, subscriber.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {total > SHOWN && (
        <p className="text-sm text-muted-foreground">
          Showing the newest {SHOWN} of {total.toLocaleString("en-IN")}. Download the CSV for everyone.
        </p>
      )}
    </div>
  );
}
