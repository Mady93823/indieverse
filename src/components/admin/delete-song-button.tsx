"use client";

import { useFormStatus } from "react-dom";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteSongButton({ title, action }: { title: string; action: () => Promise<void> }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="h-9">
          <Trash2Icon data-icon="inline-start" aria-hidden />
          Delete song
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            The song, its lyrics and its cover image will be removed from the site. This can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep song</AlertDialogCancel>
          {/* A plain submit button: AlertDialogAction would close the dialog before the form submits. */}
          <form action={action}>
            <ConfirmButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2Icon className="animate-spin" aria-hidden />}
      Delete
    </Button>
  );
}
