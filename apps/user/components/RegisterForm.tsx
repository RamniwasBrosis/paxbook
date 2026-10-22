"use client";

import { SignupFlow } from "@/components/auth/SignupFlow";

/** /register: the two-step signup; once the email is verified the customer goes to log in. */
export function RegisterForm() {
  return (
    <div className="w-full">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">Save your travellers, track bookings and get member offers.</p>
      <SignupFlow
        onLogin={() => window.location.assign("/login")}
        onDone={(email) => window.location.assign(`/login?registered=1&email=${encodeURIComponent(email)}`)}
      />
    </div>
  );
}
