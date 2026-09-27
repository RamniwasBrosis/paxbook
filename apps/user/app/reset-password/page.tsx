import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <AuthShell>
      <ResetPasswordForm token={searchParams.token} />
    </AuthShell>
  );
}
