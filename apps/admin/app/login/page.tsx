"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import { Button, Card, Input } from "@paxbook/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login, admin, isLoading: sessionLoading } = useSession();
  const [email, setEmail] = React.useState("admin@paxbook.test");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!sessionLoading && admin) {
      router.replace("/");
    }
  }, [sessionLoading, admin, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <Card className="w-full max-w-sm p-8 shadow-xl">
        <img src="/logo.jpg" alt="Paxbook" className="h-11 w-auto" />
        <p className="mt-4 text-sm text-slate-500">Sign in to manage the platform.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-xs text-slate-400">
          Seeded accounts: <code>admin@paxbook.test</code> / <code>PaxbookAdmin@123</code> (SuperAdmin), or{" "}
          <code>editor@paxbook.test</code> / <code>PaxbookEditor@123</code> (ContentEditor — try this one to see a
          permission-denied screen under Settings → Admin Users).
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">
          New agency?{" "}
          <Link href="/signup" className="font-semibold text-slate-700 hover:underline">
            Start a free trial
          </Link>
        </p>
      </Card>
    </main>
  );
}
