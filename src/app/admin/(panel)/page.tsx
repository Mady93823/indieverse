import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeIndianRupeeIcon,
  CalendarPlusIcon,
  CircleCheckIcon,
  CircleIcon,
  EyeIcon,
  FileTextIcon,
  ImageIcon,
  MusicIcon,
  PencilLineIcon,
  PlusIcon,
} from "lucide-react";
import { FlashToast } from "@/components/admin/flash-toast";
import { ArtistMonogram } from "@/components/site/artist-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLaunchChecks } from "@/lib/ads/readiness";
import { requireAdmin } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/songs/admin-queries";
import { getTopArtists } from "@/lib/songs/queries";
import { cn } from "@/lib/utils";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

const number = new Intl.NumberFormat("en-IN");
const ATTENTION_SHOWN = 6;

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const isOwner = admin.role === "OWNER";
  const [data, checks, artists, { toast }] = await Promise.all([
    getDashboardData(),
    isOwner ? getLaunchChecks() : null,
    getTopArtists(5),
    searchParams,
  ]);

  const stats = [
    { label: "Published songs", value: data.published, href: "/admin/songs?filter=published", icon: MusicIcon },
    { label: "Drafts", value: data.drafts, href: "/admin/songs?filter=drafts", icon: PencilLineIcon },
    { label: "Total reads", value: data.views, href: "/admin/songs?sort=views", icon: EyeIcon },
    { label: "Added this month", value: data.addedThisMonth, href: "/admin/songs", icon: CalendarPlusIcon },
  ];
  const actions = [
    { label: "Add a song", href: "/admin/songs/new", icon: PlusIcon },
    { label: "Edit pages", href: "/admin/pages", icon: FileTextIcon },
    ...(isOwner
      ? [
          { label: "Change the logo", href: "/admin/settings/branding", icon: ImageIcon },
          { label: "AdSense guide", href: "/admin/ads", icon: BadgeIndianRupeeIcon },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <FlashToast kind={typeof toast === "string" ? toast : undefined} />

      <h1 className="text-2xl font-semibold tracking-tight">
        <span lang="ta">வணக்கம்</span>, {admin.name.split(" ")[0]}
      </h1>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ icon: Icon, ...stat }) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-3 rounded-xl border bg-background p-4 transition-colors outline-none hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-marigold/15 text-marigold-text sm:flex">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="flex flex-col-reverse">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{number.format(stat.value)}</dd>
            </span>
          </Link>
        ))}
      </dl>

      <nav aria-label="Quick actions" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map(({ icon: Icon, ...action }, i) => (
          <Link
            key={action.href}
            href={action.href}
            className={
              i === 0
                ? "flex items-center gap-3 rounded-xl bg-primary p-4 font-medium text-primary-foreground transition-opacity outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50"
                : "flex items-center gap-3 rounded-xl border bg-background p-4 font-medium transition-colors outline-none hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50"
            }
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            {action.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Recently added" description="The newest songs, published or not." className="xl:col-span-2">
          {data.latest.length === 0 ? (
            <Empty>No songs yet. Add your first one to see it here.</Empty>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {data.latest.map((song) => (
                <li key={song.id}>
                  <Link href={`/admin/songs/${song.id}`} className="group flex flex-col gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                    <span className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {song.coverImage ? (
                        <Image src={song.coverImage} alt="" fill sizes="(min-width: 640px) 180px, 45vw" className="object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
                      ) : (
                        <MusicIcon className="size-8 text-muted-foreground" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{song.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{song.singers.join(", ") || "No singer yet"}</span>
                    </span>
                    {song.status === "PUBLISHED" ? (
                      <Badge className="self-start">Published</Badge>
                    ) : (
                      <Badge variant="secondary" className="self-start">
                        Draft
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Top artists" description="By number of published songs.">
          {artists.length === 0 ? (
            <Empty>Artists appear once their songs are published.</Empty>
          ) : (
            <ul className="-my-1">
              {artists.map((artist) => (
                <li key={artist.slug}>
                  <Link href={`/artists/${artist.slug}`} target="_blank" className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted">
                    <ArtistMonogram name={artist.name} slug={artist.slug} photo={artist.photo} size={36} className="size-9 text-sm" />
                    <span className="min-w-0 flex-1 truncate font-medium">{artist.name}</span>
                    <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                      {artist.songs} {artist.songs === 1 ? "song" : "songs"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {checks && <ReadinessCard checks={checks} />}

        <Panel title="Needs attention" description="Published songs that would be stronger with these added.">
          {data.needsAttention.length === 0 ? (
            <Empty>Every published song has a cover, About text, English lyrics and a YouTube link.</Empty>
          ) : (
            <ul className="divide-y">
              {data.needsAttention.slice(0, ATTENTION_SHOWN).map((song) => (
                <li key={song.id}>
                  <Link
                    href={`/admin/songs/${song.id}`}
                    className="-mx-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2.5 hover:bg-muted"
                  >
                    <span className="mr-auto font-medium">{song.title}</span>
                    <span className="flex flex-wrap gap-1">
                      {song.missing.map((label) => (
                        <Badge key={label} variant="outline" className="font-normal">
                          No {label}
                        </Badge>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {data.needsAttention.length > ATTENTION_SHOWN && (
            <p className="text-sm text-muted-foreground">
              And {data.needsAttention.length - ATTENTION_SHOWN} more.
            </p>
          )}
        </Panel>

        <Panel title="Continue editing" description="Your most recent drafts.">
          {data.recentDrafts.length === 0 ? (
            <Empty>No drafts. Everything you’ve added is live.</Empty>
          ) : (
            <SongList
              songs={data.recentDrafts.map((song) => ({
                ...song,
                href: `/admin/songs/${song.id}`,
                meta: `Edited ${relativeDate(song.updatedAt)}`,
              }))}
            />
          )}
        </Panel>

        <Panel title="Most read" description="All-time reads of published songs.">
          {data.topSongs.length === 0 ? (
            <Empty>No reads yet. They’ll show up here once people visit song pages.</Empty>
          ) : (
            <SongList
              songs={data.topSongs.map((song) => ({
                ...song,
                href: `/admin/songs/${song.id}`,
                meta: `${number.format(song.views)} reads`,
              }))}
            />
          )}
        </Panel>
      </div>
    </div>
  );
}

function ReadinessCard({ checks }: { checks: Awaited<ReturnType<typeof getLaunchChecks>> }) {
  const done = checks.filter((check) => check.done).length;
  const next = checks.filter((check) => !check.done).slice(0, 3);
  return (
    <Panel title="Launch & AdSense readiness" description={`${done} of ${checks.length} done.`}>
      <div
        role="progressbar"
        aria-label="Launch readiness"
        aria-valuemin={0}
        aria-valuemax={checks.length}
        aria-valuenow={done}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-marigold" style={{ width: `${(done / checks.length) * 100}%` }} />
      </div>
      <ul className="space-y-2 text-sm">
        {(next.length > 0 ? next : checks.slice(0, 3)).map((check) => (
          <li key={check.id} className="flex gap-2">
            {check.done ? (
              <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-marigold-text" aria-label="Done" />
            ) : (
              <CircleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-label="To do" />
            )}
            {check.label}
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" asChild className="self-start">
        <Link href="/admin/ads">
          Open the step-by-step guide
          <ArrowRightIcon data-icon="inline-end" aria-hidden />
        </Link>
      </Button>
    </Panel>
  );
}

function Panel({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-xl border bg-background p-4 sm:p-5", className)}>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{children}</p>;
}

function SongList({
  songs,
}: {
  songs: { id: number; title: string; coverImage: string | null; href: string; meta: string }[];
}) {
  return (
    <ul className="-my-1">
      {songs.map((song) => (
        <li key={song.id}>
          <Link href={song.href} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted">
            <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {song.coverImage ? (
                <Image src={song.coverImage} alt="" fill sizes="36px" className="object-cover" />
              ) : (
                <MusicIcon className="size-4 text-muted-foreground" aria-hidden />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{song.title}</span>
            <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{song.meta}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relativeDate(date: Date) {
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
  if (days === 0) return "today";
  if (days > -7) return relative.format(days, "day");
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
}
