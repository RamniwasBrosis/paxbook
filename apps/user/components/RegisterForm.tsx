"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone || undefined }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json?.error?.message ?? "Could not create your account.");
      }
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">Save your travelers, track bookings, and get personalized offers.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          required
          placeholder="Full name" aria-label="Full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[0.95rem] text-navy-deep placeholder:text-ink-muted focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
        <input
          required
          type="email"
          placeholder="Email address" aria-label="Email address"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[0.95rem] text-navy-deep placeholder:text-ink-muted focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
        <input
          type="tel"
          placeholder="Mobile number (optional)" aria-label="Mobile number (optional)"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[0.95rem] text-navy-deep placeholder:text-ink-muted focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
        <input
          required
          type="password"
          minLength={8}
          placeholder="Password (min 8 characters)" aria-label="Password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[0.95rem] text-navy-deep placeholder:text-ink-muted focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={busy} className="mt-1 h-12 rounded-full bg-accent px-4 text-base font-extrabold text-navy-deep transition-colors hover:bg-accent-dark disabled:opacity-60">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-brand-blue hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
