import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdmin } from "@/lib/auth/session";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">IndieVerse Admin</CardTitle>
          <CardDescription>Log in to add and edit songs.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
