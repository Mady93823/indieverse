"use client";

import { createContext, use } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

/** The last result of the surrounding AdminForm, so fields can show their own errors. */
export const FormStateContext = createContext<FormState>({});

export function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4 rounded-xl border bg-background p-4 sm:p-5", className)}>
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** A label, the input (children, with id = name), and a hint or error underneath. */
export function Field({
  name,
  label,
  hint,
  error,
  children,
  className,
}: {
  name: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const state = use(FormStateContext);
  const message = error ?? state.fieldErrors?.[name]?.[0];
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <div className={cn(message && "[&_input]:border-destructive [&_textarea]:border-destructive")}>{children}</div>
      {message ? (
        <p className="text-sm text-destructive">{message}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

type FieldProps = { name: string; label: React.ReactNode; hint?: React.ReactNode; className?: string };

export function TextField({
  name,
  label,
  hint,
  className,
  ...input
}: FieldProps & Omit<React.ComponentProps<typeof Input>, "name" | "id">) {
  return (
    <Field name={name} label={label} hint={hint} className={className}>
      <Input id={name} name={name} {...input} />
    </Field>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  className,
  ...textarea
}: FieldProps & Omit<React.ComponentProps<typeof Textarea>, "name" | "id">) {
  return (
    <Field name={name} label={label} hint={hint} className={className}>
      <Textarea id={name} name={name} {...textarea} />
    </Field>
  );
}

/**
 * An on/off switch built on a real checkbox, so it submits with the form ("on" when checked)
 * and counts as an edit for the unsaved-changes warning.
 */
export function SwitchField({
  name,
  label,
  hint,
  defaultChecked,
  className,
}: {
  name: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  defaultChecked?: boolean;
  className?: string;
}) {
  const state = use(FormStateContext);
  const message = state.fieldErrors?.[name]?.[0];
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-0.5">
        <Label htmlFor={name}>{label}</Label>
        {message ? (
          <p className="text-sm text-destructive">{message}</p>
        ) : (
          hint && <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
      <span className="relative inline-flex shrink-0">
        <input
          id={name}
          name={name}
          type="checkbox"
          role="switch"
          defaultChecked={defaultChecked}
          className="peer h-5 w-9 cursor-pointer appearance-none rounded-full bg-input transition-colors duration-150 outline-none checked:bg-primary focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/80"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow-sm transition-transform duration-150 ease-(--ease-snap) peer-checked:translate-x-4"
        />
      </span>
    </div>
  );
}
