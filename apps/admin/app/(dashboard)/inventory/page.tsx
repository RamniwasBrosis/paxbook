"use client";

import * as React from "react";
import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useVendors, useCreateVendor } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { VendorCategoryType, VendorDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input, Select } from "@paxbook/ui";

const CATEGORY_OPTIONS: VendorCategoryType[] = ["HOTEL", "TRANSPORT", "GUIDE", "ACTIVITY"];

export default function InventoryPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.VENDORS_READ);
  const canWrite = hasPermission(PERMISSIONS.VENDORS_WRITE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>vendors.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Inventory</h1>
        <p className="text-sm text-slate-500">Hotels, transport, guides, and activity providers that packages draw from.</p>
      </div>
      <InventoryContent canWrite={canWrite} />
    </div>
  );
}

function InventoryContent({ canWrite }: { canWrite: boolean }) {
  const vendorsQuery = useVendors();
  const createVendor = useCreateVendor();

  const [form, setForm] = React.useState({ name: "", categoryType: "HOTEL" as VendorCategoryType, contactInfo: "" });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createVendor.mutateAsync({ name: form.name, categoryType: form.categoryType, contactInfo: form.contactInfo || undefined });
      setForm({ name: "", categoryType: "HOTEL", contactInfo: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create vendor.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          {
            header: "Name",
            cell: (v: VendorDto) => (
              <Link href={`/inventory/${v.id}`} className="text-slate-900 hover:underline">
                {v.name}
              </Link>
            ),
          },
          { header: "Type", cell: (v: VendorDto) => v.categoryType },
          { header: "Tags", cell: (v: VendorDto) => v.categoryNames.join(", ") || "—" },
          { header: "Contact", cell: (v: VendorDto) => v.contactInfo ?? "—" },
          { header: "Status", cell: (v: VendorDto) => <Badge tone={v.status === "ACTIVE" ? "success" : "neutral"}>{v.status}</Badge> },
        ]}
        rows={vendorsQuery.data ?? []}
        rowKey={(v) => v.id}
        isLoading={vendorsQuery.isLoading}
        emptyMessage="Nothing in inventory yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Add a vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
              <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Select label="Category" value={form.categoryType} onChange={(e) => setForm((f) => ({ ...f, categoryType: e.target.value as VendorCategoryType }))}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Input label="Contact info" value={form.contactInfo} onChange={(e) => setForm((f) => ({ ...f, contactInfo: e.target.value }))} />
              <div className="sm:col-span-3">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createVendor.isPending}>
                  Add vendor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
