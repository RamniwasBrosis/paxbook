"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AUTH_INPUT, AUTH_PRIMARY, AuthField, CaptchaField, OtpCodeField, TermsCheckbox, postAuth, type CaptchaValue } from "@/components/auth/AuthBits";
import { SignupFlow } from "@/components/auth/SignupFlow";

type Method = "password" | "otp";

const outlineButton =
  "flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-navy-deep transition-colors hover:border-brand-blue hover:text-brand-blue";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/**
 * Customer login (and signup) used on /login and in the booking popup. Log in with a password or a
 * one-time code, using an email address or a mobile number; both ask for the security code and the
 * terms checkbox. After logging in the page reloads fully, so the header shows the account at once.
 */
export function LoginForm({
  nextPath,
  embedded,
  googleEnabled,
  onSuccess,
  initialIdentifier,
  initialMode = "login",
}: {
  nextPath: string;
  embedded?: boolean;
  googleEnabled?: boolean;
  onSuccess?: () => void;
  initialIdentifier?: string;
  initialMode?: "login" | "register";
}) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"login" | "register">(initialMode);
  const [method, setMethod] = React.useState<Method>("password");
  const [identifier, setIdentifier] = React.useState(initialIdentifier ?? "");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [terms, setTerms] = React.useState(false);
  const [captcha, setCaptcha] = React.useState<CaptchaValue>({ captchaId: "", captchaAnswer: "" });
  const [captchaKey, setCaptchaKey] = React.useState(0);
  const [otp, setOtp] = React.useState<{ sentTo: string; resendAvailableAt: string; devOtp?: string } | null>(null);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function finish() {
    onSuccess?.();
    const here = `${window.location.pathname}${window.location.search}`;
    if (embedded && nextPath === here) {
      // Staying on this page (the booking popup): re-render the server parts, e.g. the header's account button.
      router.refresh();
      return;
    }
    // A full load, so the header and every account page show the logged-in state straight away.
    window.location.assign(nextPath || "/account");
  }

  function checks(): string | null {
    if (!identifier.trim()) return "Enter your email address or mobile number.";
    if (!captcha.captchaAnswer.trim()) return "Type the security code shown in the picture.";
    if (!terms) return "Please accept the Terms and Privacy Policy.";
    return null;
  }

  async function loginWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problem = checks() ?? (password ? null : "Enter your password.");
    if (problem) return setError(problem);
    setBusy(true);
    try {
      await postAuth("/api/auth/login", { identifier: identifier.trim(), password, ...captcha });
      finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
      setCaptchaKey((k) => k + 1);
      setBusy(false);
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problem = checks();
    if (problem) return setError(problem);
    setBusy(true);
    try {
      const r = await postAuth<{ sentTo: string; resendAvailableAt: string; devOtp?: string }>("/api/auth/otp/request", { identifier: identifier.trim(), ...captcha });
      setOtp(r);
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
      setCaptchaKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await postAuth("/api/auth/otp/verify", { identifier: identifier.trim(), code });
      finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect code.");
      setBusy(false);
    }
  }

  async function resendCode() {
    setError(null);
    try {
      const r = await postAuth<{ sentTo: string; resendAvailableAt: string; devOtp?: string }>("/api/auth/otp/resend", { identifier: identifier.trim() });
      setOtp(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the code.");
    }
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-full py-2 text-sm font-bold transition-colors ${active ? "bg-white text-navy-deep shadow-sm" : "text-ink-muted hover:text-navy-deep"}`;

  return (
    <div className="w-full">
      {embedded ? null : (
        <>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {mode === "login" ? "Log in to unlock prices, book trips and track your bookings." : "Save travellers, track bookings and get member offers."}
          </p>
        </>
      )}

      <div className={`flex rounded-full bg-mist p-1 ${embedded ? "" : "mt-6"}`} role="tablist" aria-label="Login or create account">
        <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => setMode("login")} className={tabClass(mode === "login")}>
          Login
        </button>
        <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => setMode("register")} className={tabClass(mode === "register")}>
          Register
        </button>
      </div>

      {mode === "register" ? (
        <SignupFlow
          onLogin={() => setMode("login")}
          onDone={(email) => {
            setIdentifier(email);
            setMode("login");
            setMethod("password");
            setNotice("Your email is verified and your account is ready. Please log in.");
          }}
        />
      ) : (
        <>
          {notice ? <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</p> : null}

          <div className="mt-5 flex gap-2" role="tablist" aria-label="How to log in">
            {(["password", "otp"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={method === m}
                onClick={() => {
                  setMethod(m);
                  setOtp(null);
                  setError(null);
                }}
                className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-colors ${
                  method === m ? "border-navy-deep bg-navy-deep text-white" : "border-slate-200 text-navy-deep hover:border-brand-blue"
                }`}
              >
                {m === "password" ? "Login with password" : "Login with OTP"}
              </button>
            ))}
          </div>

          {method === "otp" && otp ? (
            <form onSubmit={verifyCode} className="mt-5 flex flex-col gap-4">
              <OtpCodeField label="Enter the code" sentTo={otp.sentTo} value={code} onChange={setCode} resendAvailableAt={otp.resendAvailableAt} onResend={resendCode} devOtp={otp.devOtp} />
              {error ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={busy || code.length !== 6} className={AUTH_PRIMARY}>
                {busy ? "Verifying…" : "Verify & log in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtp(null);
                  setCaptchaKey((k) => k + 1);
                }}
                className="text-sm font-semibold text-ink-muted hover:text-navy-deep"
              >
                ← Use a different email or mobile
              </button>
            </form>
          ) : (
            <form onSubmit={method === "password" ? loginWithPassword : sendCode} noValidate className="mt-5 flex flex-col gap-3.5">
              <AuthField label="Email or mobile number" required>
                <input
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or 98XXXXXXXX"
                  className={AUTH_INPUT}
                />
              </AuthField>
              {method === "password" ? (
                <AuthField label="Password" required>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className={`${AUTH_INPUT} pr-12`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-mist">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </AuthField>
              ) : null}
              <CaptchaField reloadKey={captchaKey} onChange={setCaptcha} />
              <TermsCheckbox checked={terms} onChange={setTerms} />
              {method === "password" ? (
                <div className="-mt-1 text-right">
                  <Link href="/forgot-password" className="text-xs font-semibold text-ink-muted hover:text-brand-blue">
                    Forgot password?
                  </Link>
                </div>
              ) : null}
              {error ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={busy} className={AUTH_PRIMARY}>
                {busy ? (method === "password" ? "Logging in…" : "Sending code…") : method === "password" ? "Log in" : "Send OTP"}
              </button>
            </form>
          )}

          <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          {googleEnabled ? (
            <a href={`/api/auth/google?next=${encodeURIComponent(nextPath)}`} className={outlineButton}>
              <GoogleMark /> Continue with Google
            </a>
          ) : (
            <button type="button" disabled title="Google login will be available soon" className={`${outlineButton} cursor-not-allowed opacity-60`}>
              <GoogleMark /> Continue with Google (coming soon)
            </button>
          )}
          <p className="mt-5 text-center text-sm text-ink-muted">
            New to Paxbook?{" "}
            <button type="button" onClick={() => setMode("register")} className="font-bold text-brand-blue hover:underline">
              Create an account
            </button>
          </p>
        </>
      )}
    </div>
  );
}
