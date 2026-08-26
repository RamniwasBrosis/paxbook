"use client";

import { useSession, usePlatformTenants, useUpdateTenantStatus } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { TenantSummaryDto } from "@paxbook/types";
import { Badge, Card, DataTable } from "@paxbook/ui";

const STATUS_TONE = { ACTIVE: "success", TRIAL: "info", SUSPENDED: "danger" } as const;

export default function PlatformTenantsPage() {
  const { admin } = useSession();

  if (!admin?.isPlatformOwner) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Platform owner access required</h2>
        <p className="mt-2 text-sm text-slate-500">This section manages every tenant on Paxbook and is restricted to the platform owner.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Tenants</h1>
        <p className="text-sm text-slate-500">Every agency running on Paxbook, their plan, and subscription status.</p>
      </div>
      <TenantsTable />
    </div>
  );
}

function TenantsTable() {
  const tenantsQuery = usePlatformTenants();
  const updateStatus = useUpdateTenantStatus();

  async function toggleStatus(t: TenantSummaryDto) {
    const nextStatus = t.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    if (!confirm(`${nextStatus === "SUSPENDED" ? "Suspend" : "Reactivate"} ${t.name}?`)) return;
    try {
      await updateStatus.mutateAsync({ id: t.id, payload: { status: nextStatus } });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update tenant status.");
    }
  }

  return (
    <DataTable
      columns={[
        { header: "Agency", cell: (t: TenantSummaryDto) => <span className="font-medium text-slate-900">{t.name}</span> },
        { header: "Subdomain", cell: (t: TenantSummaryDto) => <code className="text-xs">{t.slug}</code> },
        { header: "Plan", cell: (t: TenantSummaryDto) => t.planName ?? "—" },
        { header: "Subscription", cell: (t: TenantSummaryDto) => t.subscriptionStatus ?? "—" },
        { header: "Template", cell: (t: TenantSummaryDto) => t.templateSlug },
        { header: "Status", cell: (t: TenantSummaryDto) => <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge> },
        {
          header: "",
          cell: (t: TenantSummaryDto) => (
            <button
              type="button"
              onClick={() => toggleStatus(t)}
              className={`text-xs font-semibold hover:underline ${t.status === "SUSPENDED" ? "text-emerald-600" : "text-red-600"}`}
            >
              {t.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
            </button>
          ),
        },
      ]}
      rows={tenantsQuery.data ?? []}
      rowKey={(t) => t.id}
      isLoading={tenantsQuery.isLoading}
      emptyMessage="No tenants yet."
    />
  );
}
