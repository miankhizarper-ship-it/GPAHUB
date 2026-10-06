import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAdminSession } from "@/lib/session";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "GPAHub administrator login.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // If already logged in, redirect to the admin dashboard.
  const session = await getAdminSession();
  if (session?.user?.email) {
    redirect("/admin");
  }

  const { callbackUrl } = await searchParams;

  // LoginForm uses useSearchParams() which requires a Suspense boundary
  // in Next.js App Router.
  return (
    <Suspense fallback={null}>
      <LoginForm callbackUrl={callbackUrl} />
    </Suspense>
  );
}
