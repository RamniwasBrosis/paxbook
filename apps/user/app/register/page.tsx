import type { Metadata } from "next";
import { RegisterForm } from "@/components/RegisterForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}
