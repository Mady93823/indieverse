import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/site/container";
import { parsePeriod, periods } from "@/components/site/decades";
import { PageHeader } from "@/components/site/page-header";
import { LyricCard } from "@/components/site/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentYear, getDecades, getSongsByYears } from "@/lib/songs/queries";

export async function generateStaticParams() {
  const [decades, year] = await Promise.all([getDecades(), getCurrentYear()]);
  // Cache Components needs at least one; this year's page always exists, even if empty.
  return [...periods(decades, year).map((period) => ({ decade: period.label })), { decade: String(year) }];
}

export async function generateMetadata({ params }: PageProps<"/decades/[decade]">): Promise<Metadata> {
  const period = parsePeriod((await params).decade);
  if (!period) return { title: "Page not found" };
  return {
    title: `Tamil Song Lyrics from ${period.from === period.to ? period.label : `the ${period.label}`}`,
    description: `Tamil songs released ${period.from === period.to ? `in ${period.label}` : `in the ${period.label}`}, with lyrics in Tamil and Tanglish.`,
    alternates: { canonical: `/decades/${period.label}` },
  };
}

export default function DecadePage({ params }: PageProps<"/decades/[decade]">) {
  return (
    <Suspense fallback={<DecadeSkeleton />}>
      <DecadeContent params={params} />
    </Suspense>
  );
}

async function DecadeContent({ params }: Pick<PageProps<"/decades/[decade]">, "params">) {
  const period = parsePeriod((await params).decade);
  if (!period) notFound();
  const songs = await getSongsByYears(period.from, period.to);
  const single = period.from === period.to;

  return (
    <>
      <PageHeader title={single ? `Songs from ${period.label}` : `The ${period.label}`}>
        {songs.length} {songs.length === 1 ? "song" : "songs"} released {single ? "in" : "between"}{" "}
        {single ? period.label : `${period.from} and ${period.to}`}.
      </PageHeader>
      <Container className="pb-20">
        {songs.length === 0 ? (
          <p className="text-muted-foreground">
            No songs from these years yet.{" "}
            <Link href="/decades" className="text-pink hover:underline hover:underline-offset-4">
              Try another decade
            </Link>
          </p>
        ) : (
          <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <li key={song.slug}>
                <LyricCard song={song} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}

function DecadeSkeleton() {
  return (
    <Container className="flex flex-col gap-4 pt-16 pb-20">
      <Skeleton className="h-12 w-72" />
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[84px] rounded-2xl" />
        ))}
      </div>
    </Container>
  );
}
