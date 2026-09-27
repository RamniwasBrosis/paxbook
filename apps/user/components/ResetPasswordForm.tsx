"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ResetPasswordForm({ token }: { token: string | undefined }) {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is invalid. Please request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json?.error?.message ?? "This reset link is invalid or has expired.");
      }
      router.push("/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "This reset link is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep">Invalid reset link</h1>
        <p className="mt-3 text-sm text-ink-muted">This password reset link is missing or malformed.</p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-muted">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          required
          type="password"
          minLength={8}
          placeholder="New password (min 8 characters)" aria-label="New password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[0.95rem] text-navy-deep placeholder:text-ink-muted focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
        <input
          required
          type="password"
          minLength={8}
          placeholder="Confirm new password" aria-label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[0.95rem] text-navy-deep placeholder:text-ink-muted focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={busy} className="mt-1 h-12 rounded-full bg-accent px-4 text-base font-extrabold text-navy-deep transition-colors hover:bg-accent-dark disabled:opacity-60">
          {busy ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
