"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { usePublicPlans } from "@paxbook/api-client";
import { signupTenant, ApiRequestError } from "@paxbook/auth-client";
import { Button, Card, Input, Select } from "@paxbook/ui";

export default function SignupPage() {
  const router = useRouter();
  const plansQuery = usePublicPlans();
  const [form, setForm] = React.useState({
    agencyName: "",
    subdomain: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    planId: "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const plans = plansQuery.data ?? [];
  const selectedPlanId = form.planId || plans[0]?.id || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signupTenant({ ...form, planId: selectedPlanId });
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-lg font-semibold text-slate-900">Start your Paxbook trial</h1>
        <p className="mt-1 text-sm text-slate-500">Set up your own travel agency storefront, admin panel, and vendor portal.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input label="Agency name" required value={form.agencyName} onChange={(e) => setForm((f) => ({ ...f, agencyName: e.target.value }))} />
          <Input
            label="Subdomain"
            required
            placeholder="youragency"
            pattern="[a-z0-9][a-z0-9-]{1,30}[a-z0-9]"
            value={form.subdomain}
            onChange={(e) => setForm((f) => ({ ...f, subdomain: e.target.value.toLowerCase() }))}
          />
          <Select label="Plan" value={selectedPlanId} onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.currency} {p.priceMonthly.toLocaleString("en-IN")}/mo
              </option>
            ))}
          </Select>
          <Input label="Your name" required value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} />
          <Input
            label="Your email"
            type="email"
            required
            value={form.ownerEmail}
            onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={form.ownerPassword}
            onChange={(e) => setForm((f) => ({ ...f, ownerPassword: e.target.value }))}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" isLoading={isSubmitting} disabled={!selectedPlanId} className="mt-2 w-full">
            Create my account
          </Button>
        </form>
      </Card>
    </main>
  );
}
