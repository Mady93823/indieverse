import { cn } from "@/lib/utils";

/** Jump links to each letter's section on an A–Z page. */
export function LetterNav({ letters, idPrefix }: { letters: string[]; idPrefix: string }) {
  return (
    <nav aria-label="Jump to letter" className="sticky top-18 z-10 -mx-4 border-b bg-background/90 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
      <ul className="scroll-fade-x flex gap-1 overflow-x-auto">
        {letters.map((letter) => (
          <li key={letter}>
            <a
              href={`#${idPrefix}-${letter === "#" ? "other" : letter}`}
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-base transition-colors",
                "hover:bg-muted hover:text-pink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              )}
            >
              {letter}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
