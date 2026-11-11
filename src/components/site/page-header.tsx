import { Container } from "@/components/site/container";

/** The top of a listing page: a title and a line of text. */
export function PageHeader({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div>
      <Container className="flex flex-col gap-2 pt-10 pb-8 sm:pt-14 sm:pb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
        {children && <div className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">{children}</div>}
      </Container>
    </div>
  );
}
