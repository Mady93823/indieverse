import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="space-y-3 py-16 text-center">
      <h1 className="text-xl font-semibold">This song doesn’t exist</h1>
      <p className="text-muted-foreground">It may have been deleted.</p>
      <Button asChild variant="outline">
        <Link href="/admin">Back to all songs</Link>
      </Button>
    </div>
  );
}
