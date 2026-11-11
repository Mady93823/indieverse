"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { GitMergeIcon, Loader2Icon } from "lucide-react";
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
import { Label } from "@/components/ui/label";

export function MergeArtistForm({
  name,
  others,
  action,
}: {
  name: string;
  others: { id: number; name: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [targetId, setTargetId] = useState("");
  const target = others.find((other) => String(other.id) === targetId);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="merge-target">Merge into</Label>
        <select
          id="merge-target"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="h-9 max-w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Choose an artist…</option>
          {others.map((other) => (
            <option key={other.id} value={other.id}>
              {other.name}
            </option>
          ))}
        </select>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={!target} className="h-9">
            <GitMergeIcon data-icon="inline-start" aria-hidden />
            Merge
          </Button>
        </AlertDialogTrigger>
        {target && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Merge “{name}” into “{target.name}”?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Every song credited to {name} will be credited to {target.name} instead, and the page for {name} will
                forward to the page for {target.name}. This can’t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={action}>
                <input type="hidden" name="targetId" value={target.id} />
                <ConfirmButton />
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2Icon className="animate-spin" aria-hidden />}
      Merge
    </Button>
  );
}
