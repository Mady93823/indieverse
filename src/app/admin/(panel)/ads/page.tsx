import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CircleCheckIcon, CircleIcon, ExternalLinkIcon, InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLaunchChecks, MIN_SONGS_FOR_ADSENSE } from "@/lib/ads/readiness";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings/queries";
import { AD_PLACEMENTS } from "@/lib/settings/schema";
import { cn } from "@/lib/utils";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "AdSense guide" };

type Status = "done" | "todo" | "external";

export default async function AdsGuidePage() {
  await requireAdmin("OWNER");
  const [{ ads }, checks] = await Promise.all([getSettings(), getLaunchChecks()]);
  const ready = checks.every((check) => check.done);
  const slotsAdded = AD_PLACEMENTS.filter((p) => ads.placements[p.id].slot).length;
  const placementsOn = AD_PLACEMENTS.filter((p) => ads.placements[p.id].enabled && ads.placements[p.id].slot).length;

  return (
    <div className="space-y-6">
      <dl className="grid gap-3 sm:grid-cols-3">
        <Stat label="Ads" value={ads.enabled ? "On" : "Off"} />
        <Stat label="Publisher ID" value={ads.publisherId || "Not added"} />
        <Stat label="Places showing ads" value={`${placementsOn} of ${AD_PLACEMENTS.length}`} />
      </dl>

      <aside className="flex gap-3 rounded-xl border border-marigold/40 bg-marigold/10 p-4 text-sm sm:p-5">
        <InfoIcon className="mt-0.5 size-5 shrink-0 text-marigold-text" aria-hidden />
        <div className="space-y-2">
          <p className="font-semibold">When to apply</p>
          <p>
            Apply once every check in step 1 is done. For most new sites that&apos;s 4–8 weeks after launch, when Google
            Search Console shows your pages in search results and some visitors arriving from Google.
          </p>
          <p>
            Google sets no minimum age for a site, but new sites with little original content are often turned down for
            “low value content”, and you then have to wait before asking again. Real songs with a few lines of About text
            in your own words are what get a lyrics site approved.
          </p>
        </div>
      </aside>

      <ol className="space-y-4">
        <Step
          number={1}
          title="Get the site ready"
          status={ready ? "done" : "todo"}
          summary={`${checks.filter((c) => c.done).length} of ${checks.length} done`}
        >
          <ul className="divide-y">
            {checks.map((check) => (
              <li key={check.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                {check.done ? (
                  <CircleCheckIcon className="mt-0.5 size-5 shrink-0 text-marigold-text" aria-hidden />
                ) : (
                  <CircleIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    <span className="sr-only">{check.done ? "Done: " : "To do: "}</span>
                    {check.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{check.detail}</p>
                </div>
                {!check.done && check.href && (
                  <Button variant="outline" size="sm" asChild className="shrink-0 self-start">
                    <Link href={check.href}>Fix</Link>
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            {MIN_SONGS_FOR_ADSENSE} songs isn&apos;t a Google rule. It&apos;s a sensible amount of real content before asking for
            a review.
          </p>
        </Step>

        <Step number={2} title="Apply for AdSense" status={ads.publisherId ? "done" : "todo"}>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>
              Sign up at{" "}
              <ExternalLink href="https://adsense.google.com/start/">adsense.google.com</ExternalLink> with your site&apos;s
              address. You must be 18 or older.
            </li>
            <li>
              Copy your publisher ID (it starts with <code>ca-pub-</code>) into{" "}
              <Link href="/admin/ads/settings" className="font-medium underline underline-offset-4">
                Ad settings
              </Link>
              . Leave “Show ads” off for now.
            </li>
            <li>
              When AdSense asks how to connect the site, choose <strong>Meta tag</strong>. Once the ID is saved, the tag is
              already on every page and <code>/ads.txt</code> is in place, so you can click Verify straight away.
            </li>
            <li>Click “Request review”.</li>
          </ol>
        </Step>

        <Step number={3} title="Turn on the consent message" status="external">
          <p className="text-sm">
            Google only shows ads to visitors in Europe, the UK and Switzerland after they&apos;ve been asked for consent,
            and many Tamil readers live there. AdSense&apos;s own consent message is free and approved by Google, and it needs
            no change to the site.
          </p>
          <p className="text-sm">
            In AdSense: <strong>Privacy &amp; messaging → European regulations → Create message</strong>, choose your site,
            and publish it. Your{" "}
            <Link href="/admin/pages/privacy" className="font-medium underline underline-offset-4">
              Privacy policy
            </Link>{" "}
            already explains Google&apos;s advertising cookies.
          </p>
        </Step>

        <Step number={4} title="Wait for the review" status="external">
          <p className="text-sm">
            It usually takes a few days, sometimes 2–4 weeks. Keep adding songs as usual and don&apos;t make big changes to
            the site meanwhile. If it&apos;s refused for “low value content”, add more songs with About text, wait at least
            two weeks, and request a review again from the AdSense Sites page.
          </p>
        </Step>

        <Step
          number={5}
          title="Create ad units"
          status={slotsAdded > 0 ? "done" : "todo"}
          summary={slotsAdded > 0 ? `${slotsAdded} slot IDs added` : undefined}
        >
          <p className="text-sm">
            After approval, create a <strong>responsive display ad unit</strong> in AdSense (Ads → By ad unit) for each place
            you want ads, e.g. “Song after lyrics” and “Home”. Copy each unit&apos;s slot ID, the number after{" "}
            <code>data-ad-slot</code>, into{" "}
            <Link href="/admin/ads/settings" className="font-medium underline underline-offset-4">
              Ad settings
            </Link>
            .
          </p>
          <p className="text-sm">
            In AdSense, keep <strong>Auto ads</strong> off for this site (Ads → By site → edit), so ads appear only in the
            places you choose and never inside song lyrics unexpectedly.
          </p>
        </Step>

        <Step number={6} title="Switch ads on" status={ads.enabled ? "done" : "todo"}>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>
              Start with two places: <strong>Song page, after the lyrics</strong> and <strong>Home page</strong>. Then turn
              on “Show ads”.
            </li>
            <li>
              After two weeks, check Search Console (Core Web Vitals) and your AdSense earnings. If pages still load fast,
              add <strong>before the lyrics</strong>.
            </li>
            <li>Use “inside long lyrics” sparingly. It earns more but interrupts reading.</li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href="/admin/ads/settings">
                Open ad settings
                <ArrowRightIcon data-icon="inline-end" aria-hidden />
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/admin/ads-preview/song">See where ads appear</Link>
            </Button>
          </div>
        </Step>
      </ol>

      <section className="space-y-3 rounded-xl border bg-background p-4 sm:p-5">
        <h2 className="font-semibold">Keep the account safe</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Never click your own ads, and never ask anyone to click them. Google closes accounts for this.</li>
          <li>
            <strong>Lyrics belong to their writers.</strong> Google&apos;s policy says ads may not be placed on sites with
            copied or copyrighted content, so only publish lyrics the artist is happy for you to share. Note their
            permission in the song&apos;s internal note, and turn on “Hide ads on this song” whenever you&apos;re not sure.
          </li>
          <li>
            Act quickly on removal requests. The{" "}
            <Link href="/admin/pages/copyright" className="font-medium underline underline-offset-4">
              Copyright page
            </Link>{" "}
            tells rights holders how to reach you.
          </li>
          <li>The site never shows ads on search results, missing pages, previews or the admin, as AdSense requires.</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-lg font-semibold">{value}</dd>
    </div>
  );
}

const STATUS_BADGE: Record<Status, { label: string; className?: string; variant?: "secondary" | "outline" }> = {
  done: { label: "Done", className: "bg-marigold text-marigold-foreground" },
  todo: { label: "To do", variant: "outline" },
  external: { label: "In AdSense", variant: "secondary" },
};

function Step({
  number,
  title,
  status,
  summary,
  children,
}: {
  number: number;
  title: string;
  status: Status;
  summary?: string;
  children: React.ReactNode;
}) {
  const badge = STATUS_BADGE[status];
  return (
    <li className="flex gap-4 rounded-xl border bg-background p-4 sm:p-5">
      <span
        aria-hidden
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full font-display text-base font-semibold",
          status === "done" ? "bg-marigold text-marigold-foreground" : "bg-muted",
        )}
      >
        {number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto font-semibold">
            <span className="sr-only">Step {number}: </span>
            {title}
          </h2>
          {summary && <span className="text-sm text-muted-foreground">{summary}</span>}
          <Badge variant={badge.variant} className={badge.className}>
            {badge.label}
          </Badge>
        </div>
        {children}
      </div>
    </li>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium underline underline-offset-4">
      {children}
      <ExternalLinkIcon className="size-3.5" aria-hidden />
    </a>
  );
}
