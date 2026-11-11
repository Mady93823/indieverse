"use client";

import { useActionState } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { subscribe, type SubscribeState } from "@/lib/newsletter/actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, {});

  if (state.ok) {
    return (
      <p role="status" className="flex items-center gap-3 rounded-full bg-card px-6 py-4 text-sm shadow-sm">
        <CheckIcon className="size-5 shrink-0 text-pink" aria-hidden />
        You’re on the list. Thank you for joining!
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-full border bg-card p-1.5 pl-5 shadow-sm transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <label htmlFor="newsletter-email" className="sr-only">
          Your email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "newsletter-error" : undefined}
          className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        {/* Hidden from people; bots fill it in. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-[background-color,scale] outline-none hover:bg-[#c4234d] focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96] disabled:opacity-70"
        >
          {pending && <Loader2Icon className="size-4 animate-spin" aria-hidden />}
          Join the community
        </button>
      </div>
      {state.error ? (
        <p id="newsletter-error" role="alert" className="px-5 text-sm text-destructive">
          {state.error}
        </p>
      ) : (
        <p className="px-5 text-sm text-muted-foreground">We only email about lyrics. Unsubscribe whenever you like.</p>
      )}
    </form>
  );
}
