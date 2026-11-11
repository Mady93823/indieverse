import { Fragment } from "react";
import { parsePageBody, splitLinks } from "@/lib/pages/format";

/** Shows an editable page's text (see src/lib/pages/format.ts). Also used for the admin preview. */
export function PageBody({ body }: { body: string }) {
  return (
    <div className="flex flex-col gap-4 text-base leading-relaxed text-pretty sm:text-lg">
      {parsePageBody(body).map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className="mt-4 text-2xl font-semibold tracking-tight first:mt-0">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1.5 pl-6 marker:text-pink">
              {block.items.map((item, j) => (
                <li key={j}>
                  <Linked text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Linked text={line} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function Linked({ text }: { text: string }) {
  return splitLinks(text).map((part, i) =>
    part.href ? (
      <a
        key={i}
        href={part.href}
        className="break-words underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
        {...(part.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {part.text}
      </a>
    ) : (
      <Fragment key={i}>{part.text}</Fragment>
    ),
  );
}
