"use client";

import * as React from "react";
import { useSession, usePlatformPlans, useCreatePlan, useUpdatePlan } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { PlanDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input } from "@paxbook/ui";

export default function PlatformPlansPage() {
  const { admin } = useSession();

  if (!admin?.isPlatformOwner) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Platform owner access required</h2>
        <p className="mt-2 text-sm text-slate-500">Plan management is restricted to the platform owner.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Subscription Plans</h1>
        <p className="text-sm text-slate-500">The plan catalog offered to new agencies at signup.</p>
      </div>
      <PlansContent />
    </div>
  );
}

function PlansContent() {
  const plansQuery = usePlatformPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const [form, setForm] = React.useState({ name: "", priceMonthly: 0, maxAdminUsers: "", maxPackages: "" });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPlan.mutateAsync({
        name: form.name,
        priceMonthly: Number(form.priceMonthly),
        maxAdminUsers: form.maxAdminUsers ? Number(form.maxAdminUsers) : undefined,
        maxPackages: form.maxPackages ? Number(form.maxPackages) : undefined,
      });
      setForm({ name: "", priceMonthly: 0, maxAdminUsers: "", maxPackages: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create plan.");
    }
  }

  async function toggleActive(plan: PlanDto) {
    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        payload: { name: plan.name, priceMonthly: plan.priceMonthly, maxAdminUsers: plan.maxAdminUsers ?? undefined, maxPackages: plan.maxPackages ?? undefined, isActive: !plan.isActive },
      });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update plan.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Plan", cell: (p: PlanDto) => <span className="font-medium text-slate-900">{p.name}</span> },
          { header: "Price / month", cell: (p: PlanDto) => `${p.currency} ${p.priceMonthly.toLocaleString("en-IN")}` },
          { header: "Admin users", cell: (p: PlanDto) => p.maxAdminUsers ?? "Unlimited" },
          { header: "Packages", cell: (p: PlanDto) => p.maxPackages ?? "Unlimited" },
          { header: "Status", cell: (p: PlanDto) => <Badge tone={p.isActive ? "success" : "neutral"}>{p.isActive ? "Active" : "Hidden"}</Badge> },
          {
            header: "",
            cell: (p: PlanDto) => (
              <button type="button" onClick={() => toggleActive(p)} className="text-xs font-semibold text-slate-600 hover:underline">
                {p.isActive ? "Hide" : "Show"}
              </button>
            ),
          },
        ]}
        rows={plansQuery.data ?? []}
        rowKey={(p) => p.id}
        isLoading={plansQuery.isLoading}
        emptyMessage="No plans yet."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add a plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-4" onSubmit={handleSubmit}>
            <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input
              label="Price / month (INR)"
              type="number"
              min={0}
              required
              value={form.priceMonthly}
              onChange={(e) => setForm((f) => ({ ...f, priceMonthly: Number(e.target.value) }))}
            />
            <Input label="Max admin users" type="number" min={1} value={form.maxAdminUsers} onChange={(e) => setForm((f) => ({ ...f, maxAdminUsers: e.target.value }))} />
            <Input label="Max packages" type="number" min={1} value={form.maxPackages} onChange={(e) => setForm((f) => ({ ...f, maxPackages: e.target.value }))} />
            <div className="sm:col-span-4">
              {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
              <Button type="submit" isLoading={createPlan.isPending}>
                Create plan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
