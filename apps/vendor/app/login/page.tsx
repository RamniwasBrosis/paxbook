import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return <LoginForm nextPath={searchParams.next ?? "/dashboard"} />;
}
