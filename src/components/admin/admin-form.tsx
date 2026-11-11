"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { FormStateContext } from "@/components/admin/form-parts";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

/**
 * A settings-style form: fields above, a sticky save bar below. It keeps what was typed when
 * the server returns errors, shows a toast on success, warns before leaving with unsaved
 * changes, and saves with Ctrl/⌘+S.
 */
export function AdminForm({
  action,
  children,
  submitLabel = "Save changes",
  successMessage = "Saved.",
  resetOnSuccess = false,
  className,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  successMessage?: string;
  /** Empty the fields after saving, for forms that add something new. */
  resetOnSuccess?: boolean;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const dirty = useUnsavedChangesWarning();
  useSaveShortcut(formRef);

  useEffect(() => {
    if (!state.ok) return;
    toast.success(successMessage, { id: "admin-form-saved" });
    if (resetOnSuccess) formRef.current?.reset();
  }, [state.ok, successMessage, resetOnSuccess]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Submitting by hand (instead of <form action>) stops React from resetting the fields.
    event.preventDefault();
    const formData = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    dirty.reset();
    startTransition(() => formAction(formData));
  }

  return (
    <FormStateContext value={state}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onInput={dirty.mark}
        noValidate
        data-save-shortcut
        className={cn("space-y-6", className)}
      >
        {children}
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          {state.error && (
            <p role="alert" className="mr-auto text-sm text-destructive">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={pending} className="ml-auto h-9 px-4">
            {pending && <Loader2Icon className="animate-spin" aria-hidden />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormStateContext>
  );
}

/** Tracks edits and asks before closing or reloading the tab while there are unsaved ones. */
export function useUnsavedChangesWarning() {
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return { mark: () => setDirty(true), reset: () => setDirty(false) };
}

/**
 * Ctrl/⌘+S submits the form with its first submit button, the same one Enter would use.
 * With several forms on a page, it saves the one being edited (or the first, if none has focus).
 */
export function useSaveShortcut(formRef: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "s" || !(event.metaKey || event.ctrlKey) || event.altKey) return;
      const form = formRef.current;
      if (!form) return;
      event.preventDefault();
      const editing = document.activeElement?.closest("form[data-save-shortcut]");
      if (editing ? editing !== form : document.querySelector("form[data-save-shortcut]") !== form) return;
      form.requestSubmit(form.querySelector<HTMLButtonElement>("button[type=submit]:not(:disabled)"));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [formRef]);
}
