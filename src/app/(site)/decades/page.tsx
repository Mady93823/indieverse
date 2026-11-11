import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { DecadeGrid } from "@/components/site/decades";
import { PageHeader } from "@/components/site/page-header";
import { getCurrentYear, getDecades } from "@/lib/songs/queries";

export const metadata: Metadata = {
  title: "Tamil Song Lyrics by Decade",
  description: "Tamil song lyrics from the 1960s to today, decade by decade.",
  alternates: { canonical: "/decades" },
};

export default async function DecadesPage() {
  const [decades, year] = await Promise.all([getDecades(), getCurrentYear()]);
  return (
    <>
      <PageHeader title="Browse by year">
        From gramophone classics to today’s streaming hits, explore the changing sound of Tamil music.
      </PageHeader>
      <Container className="max-w-[1100px] pb-20">
        <DecadeGrid decades={decades} year={year} />
      </Container>
    </>
  );
}
