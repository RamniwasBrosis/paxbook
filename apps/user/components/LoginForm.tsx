"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Lock, KeyRound } from "lucide-react";

type Tab = "otp" | "email";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json?.error?.message ?? "Something went wrong.");
  }
  return json.data as T;
}

const pillInput =
  "w-full rounded-full border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const pillButtonPrimary =
  "w-full rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60 disabled:hover:translate-y-0";
const pillButtonOutline =
  "flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand hover:text-brand";

export function LoginForm({ nextPath, embedded, googleEnabled }: { nextPath: string; embedded?: boolean; googleEnabled?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [tab, setTab] = React.useState<Tab>("otp");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  // OTP tab state
  const [phone, setPhone] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [devOtp, setDevOtp] = React.useState<string | null>(null);
  const [smsDelivered, setSmsDelivered] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Email tab state
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Register form state
  const [registerForm, setRegisterForm] = React.useState({ name: "", email: "", password: "", phone: "" });

  function goNext() {
    router.push(nextPath);
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await postJson("/api/auth/register", { ...registerForm, phone: registerForm.phone || undefined });
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await postJson<{ sent: boolean; devOtp?: string; resendAvailableAt: string }>("/api/auth/otp/request", { phone });
      setOtpSent(true);
      setDevOtp(result.devOtp ?? null);
      setSmsDelivered(result.sent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await postJson("/api/auth/otp/verify", { phone, code });
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect code.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await postJson("/api/auth/login", { email, password });
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect email or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={embedded ? "" : "mx-auto max-w-md px-4 py-16 sm:px-6"}>
      {embedded ? null : (
        <>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to unlock prices, book trips, and track your bookings.</p>
        </>
      )}

      <div className={`flex rounded-full bg-mist-strong p-1 text-sm font-semibold ${embedded ? "" : "mt-6"}`}>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full border py-2 transition-colors ${mode === "login" ? "border-brand bg-white text-brand" : "border-transparent text-slate-500"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-full border py-2 text-center transition-colors ${mode === "register" ? "border-brand bg-white text-brand" : "border-transparent text-slate-500"}`}
        >
          Register
        </button>
      </div>

      {mode === "register" ? (
        <form onSubmit={handleRegister} className="mt-5 flex flex-col gap-3">
          <input
            required
            placeholder="Full name"
            value={registerForm.name}
            onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
            className={pillInput.replace("pl-10", "pl-4")}
          />
          <input
            required
            type="email"
            placeholder="Email address"
            value={registerForm.email}
            onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
            className={pillInput.replace("pl-10", "pl-4")}
          />
          <input
            type="tel"
            placeholder="Mobile number (optional)"
            value={registerForm.phone}
            onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))}
            className={pillInput.replace("pl-10", "pl-4")}
          />
          <input
            required
            type="password"
            minLength={8}
            placeholder="Password (min 8 characters)"
            value={registerForm.password}
            onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
            className={pillInput.replace("pl-10", "pl-4")}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" disabled={busy} className={pillButtonPrimary}>
            {busy ? "Creating account…" : "Create account"}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button type="button" onClick={() => setMode("login")} className="font-semibold text-brand hover:underline">
              Log in
            </button>
          </p>
        </form>
      ) : (
        <>
      <div className="mt-5 flex gap-1 text-xs font-semibold text-slate-400">
        <button type="button" onClick={() => setTab("otp")} className={tab === "otp" ? "text-brand" : ""}>
          Mobile
        </button>
        <span>·</span>
        <button type="button" onClick={() => setTab("email")} className={tab === "email" ? "text-brand" : ""}>
          Email
        </button>
      </div>

      {tab === "otp" ? (
        <div className="mt-3">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
              <label className="text-sm text-slate-600">
                Mobile number
                <div className="relative mt-1">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                  <input
                    required
                    type="tel"
                    placeholder="+91 00000 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={pillInput}
                  />
                </div>
              </label>
              <button type="submit" disabled={busy} className={pillButtonPrimary}>
                {busy ? "Sending…" : "Continue with mobile"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
              {smsDelivered ? (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Code sent to your phone via SMS.</p>
              ) : null}
              {devOtp ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {smsDelivered ? "Dev/staging fallback code" : "No SMS gateway configured yet — dev mode OTP"}:{" "}
                  <span className="font-mono font-bold">{devOtp}</span>
                </p>
              ) : null}
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <input
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`${pillInput} text-center tracking-[0.5em]`}
                />
              </div>
              <button type="submit" disabled={busy} className={pillButtonPrimary}>
                {busy ? "Verifying…" : "Verify & continue"}
              </button>
              <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-slate-400 hover:text-slate-600">
                Change number
              </button>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleEmailLogin} className="mt-3 flex flex-col gap-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
            <input
              required
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={pillInput}
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={pillInput}
            />
          </div>
          <button type="submit" disabled={busy} className={pillButtonPrimary}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
      )}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="flex flex-col gap-2.5">
        {googleEnabled ? (
          <a href={`/api/auth/google?next=${encodeURIComponent(nextPath)}`} className={pillButtonOutline}>
            Continue with Google
          </a>
        ) : (
          <button type="button" disabled title="Google login isn't connected yet — an admin can add it under Settings → Integrations" className={`${pillButtonOutline} cursor-not-allowed opacity-60`}>
            Continue with Google (not connected)
          </button>
        )}
        {tab === "email" ? null : (
          <button type="button" onClick={() => setTab("email")} className={pillButtonOutline}>
            Continue with Email
          </button>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-slate-500">
        By continuing you agree to Paxbook&apos;s Terms and Privacy Policy.
      </p>

      <p className="mt-3 text-center text-sm text-slate-500">
        New to Paxbook?{" "}
        <button type="button" onClick={() => setMode("register")} className="font-semibold text-brand hover:underline">
          Create an account
        </button>
      </p>
        </>
      )}
    </div>
  );
}
