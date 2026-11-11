import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings/queries";
import heroImage from "../../../../public/admin-hero.png";

// Renders on every request (it reads the login cookie); see src/app/admin/layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  const { general } = await getSettings();

  return (
    <main id="main" className="flex flex-1">
      {/* Shown on wide screens only; phones go straight to the form. */}
      <div className="relative hidden w-1/2 max-w-3xl overflow-hidden bg-[#121029] lg:block">
        <Image src={heroImage} alt="" fill priority placeholder="blur" sizes="50vw" className="object-cover object-top" />
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">{general.siteName} Admin</CardTitle>
            <CardDescription>Log in to add songs and manage the site.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
