"use client";

import * as React from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json?.error?.message ?? "Something went wrong. Please try again.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep">Check your email</h1>
        <p className="mt-3 text-sm text-ink-muted">
          If <b>{email}</b> is registered with us, we&apos;ve sent a link to reset your password. The link expires in 60 minutes.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep">Forgot your password?</h1>
      <p className="mt-1 text-sm text-ink-muted">Enter your registered email address and we&apos;ll send you a link to reset it.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          required
          type="email"
          placeholder="Registered email address" aria-label="Registered email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[0.95rem] text-navy-deep placeholder:text-ink-muted focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={busy} className="mt-1 h-12 rounded-full bg-accent px-4 text-base font-extrabold text-navy-deep transition-colors hover:bg-accent-dark disabled:opacity-60">
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
