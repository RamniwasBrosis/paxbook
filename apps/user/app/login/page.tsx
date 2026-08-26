import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { getBranding } from "@/lib/branding";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const branding = await getBranding();
  return (
    <div>
      {searchParams.error === "google_login_failed" ? (
        <p className="mx-auto mt-6 max-w-md rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          Google login didn&apos;t go through. Please try again or use mobile/email.
        </p>
      ) : null}
      <LoginForm nextPath={searchParams.next ?? "/account"} googleEnabled={branding.googleLoginEnabled} />
    </div>
  );
}
