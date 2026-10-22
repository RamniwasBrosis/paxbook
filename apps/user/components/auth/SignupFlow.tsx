"use client";

import * as React from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { AUTH_INPUT, AUTH_PRIMARY, AuthField, CaptchaField, OtpCodeField, TermsCheckbox, postAuth, type CaptchaValue } from "@/components/auth/AuthBits";

interface StartResult {
  signupId: string;
  email: string;
  phone: string | null;
  phoneOtpRequired: boolean;
  resendAvailableAt: string;
  devEmailOtp?: string;
  devPhoneOtp?: string;
}

/**
 * Signup in two steps: details with password + confirm password, then the email code (and mobile
 * code once SMS is set up). The account exists only after the email is verified; the customer then
 * logs in, which `onDone` hands over to.
 */
export function SignupFlow({ onDone, onLogin }: { onDone: (email: string) => void; onLogin?: () => void }) {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = React.useState(false);
  const [terms, setTerms] = React.useState(false);
  const [captcha, setCaptcha] = React.useState<CaptchaValue>({ captchaId: "", captchaAnswer: "" });
  const [captchaKey, setCaptchaKey] = React.useState(0);
  const [started, setStarted] = React.useState<StartResult | null>(null);
  const [emailCode, setEmailCode] = React.useState("");
  const [phoneCode, setPhoneCode] = React.useState("");
  const [emailResendAt, setEmailResendAt] = React.useState<string | null>(null);
  const [phoneResendAt, setPhoneResendAt] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const mismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Password and confirm password don't match.");
    if (!terms) return setError("Please accept the Terms and Privacy Policy.");
    setBusy(true);
    try {
      const result = await postAuth<StartResult>("/api/auth/register", { ...form, acceptTerms: true, ...captcha });
      setStarted(result);
      setEmailResendAt(result.resendAvailableAt);
      setPhoneResendAt(result.phoneOtpRequired ? result.resendAvailableAt : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start signup.");
      setCaptchaKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!started) return;
    setError(null);
    setBusy(true);
    try {
      const done = await postAuth<{ email: string }>("/api/auth/register/verify", {
        signupId: started.signupId,
        emailCode,
        ...(started.phoneOtpRequired ? { phoneCode } : {}),
      });
      onDone(done.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  }

  async function resend(channel: "EMAIL" | "SMS") {
    if (!started) return;
    setError(null);
    try {
      const r = await postAuth<{ resendAvailableAt: string; devOtp?: string }>("/api/auth/register/resend", { signupId: started.signupId, channel });
      if (channel === "EMAIL") setEmailResendAt(r.resendAvailableAt);
      else setPhoneResendAt(r.resendAvailableAt);
      setStarted((s) => (s ? { ...s, ...(channel === "EMAIL" ? { devEmailOtp: r.devOtp } : { devPhoneOtp: r.devOtp }) } : s));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the code.");
    }
  }

  if (started) {
    return (
      <form onSubmit={verify} className="mt-5 flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-2xl bg-mist px-4 py-3 text-sm text-navy-deep">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
          <p>
            We sent a 6-digit code to <strong>{started.email}</strong>
            {started.phoneOtpRequired ? (
              <>
                {" "}and <strong>{started.phone}</strong>
              </>
            ) : null}
            . Enter {started.phoneOtpRequired ? "both" : "it"} to verify and create your account.
          </p>
        </div>
        <OtpCodeField label="Email code" sentTo={started.email} value={emailCode} onChange={setEmailCode} resendAvailableAt={emailResendAt} onResend={() => resend("EMAIL")} devOtp={started.devEmailOtp} />
        {started.phoneOtpRequired ? (
          <OtpCodeField label="Mobile code" sentTo={started.phone ?? ""} value={phoneCode} onChange={setPhoneCode} resendAvailableAt={phoneResendAt} onResend={() => resend("SMS")} devOtp={started.devPhoneOtp} />
        ) : started.phone ? (
          <p className="text-xs text-ink-muted">Your mobile {started.phone} is saved; mobile verification will be added soon.</p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy || emailCode.length !== 6 || (started.phoneOtpRequired && phoneCode.length !== 6)} className={AUTH_PRIMARY}>
          {busy ? "Verifying…" : "Verify & create account"}
        </button>
        <button type="button" onClick={() => setStarted(null)} className="text-sm font-semibold text-ink-muted hover:text-navy-deep">
          ← Change details
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={start} noValidate className="mt-5 flex flex-col gap-3.5">
      <AuthField label="Full name" required>
        <input required autoComplete="name" value={form.name} onChange={set("name")} placeholder="As on your ID" className={AUTH_INPUT} />
      </AuthField>
      <AuthField label="Email address" required>
        <input required type="email" autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={AUTH_INPUT} />
      </AuthField>
      <AuthField label="Mobile number" required>
        <input required type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} placeholder="10-digit mobile number" className={AUTH_INPUT} />
      </AuthField>
      <AuthField label="Password" required>
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            value={form.password}
            onChange={set("password")}
            placeholder="At least 8 characters"
            className={`${AUTH_INPUT} pr-12`}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-mist">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </AuthField>
      <AuthField label="Confirm password" required>
        <input
          required
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="Type the password again"
          aria-invalid={mismatch}
          className={`${AUTH_INPUT} ${mismatch ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
        />
      </AuthField>
      {mismatch ? <p className="-mt-2 text-xs font-semibold text-red-600">Passwords don&apos;t match.</p> : null}
      <CaptchaField reloadKey={captchaKey} onChange={setCaptcha} />
      <TermsCheckbox checked={terms} onChange={setTerms} />
      {error ? (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className={AUTH_PRIMARY}>
        {busy ? "Sending code…" : "Create account"}
      </button>
      {onLogin ? (
        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <button type="button" onClick={onLogin} className="font-bold text-brand-blue hover:underline">
            Log in
          </button>
        </p>
      ) : null}
    </form>
  );
}
