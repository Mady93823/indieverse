import type { z } from "zod";

/**
 * What admin form actions return. `ok` is a timestamp, so saving twice in a row
 * still counts as a new success. Field errors are keyed by input name ("placements.home.slot").
 */
export type FormState = {
  ok?: number;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function errorsFrom(error: z.ZodError): FormState {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    (fieldErrors[issue.path.join(".")] ??= []).push(issue.message);
  }
  return { error: "Please fix the highlighted fields.", fieldErrors };
}
