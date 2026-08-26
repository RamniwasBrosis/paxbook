"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useDestinations, useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { CouponDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input, Select } from "@paxbook/ui";

const EMPTY_FORM = {
  id: null as string | null,
  code: "",
  description: "",
  discountType: "PERCENT" as "FIXED" | "PERCENT",
  value: 10,
  destinationId: "",
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  usageLimit: "" as string | number,
  isActive: true,
};

export default function OffersPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.OFFERS_READ);
  const canWrite = hasPermission(PERMISSIONS.OFFERS_WRITE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>offers.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Offers &amp; Coupons</h1>
        <p className="text-sm text-slate-500">Promotional codes, optionally scoped to a destination.</p>
      </div>
      <OffersContent canWrite={canWrite} />
    </div>
  );
}

function OffersContent({ canWrite }: { canWrite: boolean }) {
  const couponsQuery = useCoupons();
  const destinationsQuery = useDestinations();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [form, setForm] = React.useState(EMPTY_FORM);
  const [error, setError] = React.useState<string | null>(null);

  function loadIntoForm(coupon: CouponDto) {
    setError(null);
    setForm({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description ?? "",
      discountType: coupon.discountType,
      value: coupon.value,
      destinationId: coupon.destinationId ?? "",
      validFrom: coupon.validFrom.slice(0, 10),
      validTo: coupon.validTo.slice(0, 10),
      usageLimit: coupon.usageLimit ?? "",
      isActive: coupon.isActive,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      code: form.code,
      description: form.description || undefined,
      discountType: form.discountType,
      value: Number(form.value),
      destinationId: form.destinationId || undefined,
      validFrom: form.validFrom,
      validTo: form.validTo,
      usageLimit: form.usageLimit === "" ? undefined : Number(form.usageLimit),
      isActive: form.isActive,
    };
    try {
      if (form.id) {
        await updateCoupon.mutateAsync({ id: form.id, payload });
      } else {
        await createCoupon.mutateAsync(payload);
      }
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save coupon.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon.mutateAsync(id);
      if (form.id === id) setForm(EMPTY_FORM);
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not delete coupon.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Code", cell: (c: CouponDto) => <span className="font-mono">{c.code}</span> },
          { header: "Discount", cell: (c: CouponDto) => (c.discountType === "PERCENT" ? `${c.value}%` : `₹${c.value}`) },
          { header: "Destination", cell: (c: CouponDto) => c.destinationName ?? "All" },
          { header: "Valid", cell: (c: CouponDto) => `${c.validFrom.slice(0, 10)} → ${c.validTo.slice(0, 10)}` },
          { header: "Used", cell: (c: CouponDto) => `${c.usageCount}${c.usageLimit ? ` / ${c.usageLimit}` : ""}` },
          { header: "Status", cell: (c: CouponDto) => <Badge tone={c.isActive ? "success" : "neutral"}>{c.isActive ? "Active" : "Inactive"}</Badge> },
          ...(canWrite
            ? [
                {
                  header: "",
                  cell: (c: CouponDto) => (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id);
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  ),
                },
              ]
            : []),
        ]}
        rows={couponsQuery.data ?? []}
        rowKey={(c) => c.id}
        onRowClick={canWrite ? loadIntoForm : undefined}
        isLoading={couponsQuery.isLoading}
        emptyMessage="No coupons yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{form.id ? "Edit coupon" : "Add coupon"}</CardTitle>
            {form.id ? (
              <button type="button" onClick={() => setForm(EMPTY_FORM)} className="text-xs text-slate-500 hover:underline">
                Cancel edit
              </button>
            ) : null}
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <Input
                label="Code"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
              <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              <Select
                label="Discount type"
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "FIXED" | "PERCENT" }))}
              >
                <option value="PERCENT">Percent</option>
                <option value="FIXED">Fixed amount</option>
              </Select>
              <Input
                label="Value"
                type="number"
                min={0}
                required
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
              />
              <Select label="Destination (optional)" value={form.destinationId} onChange={(e) => setForm((f) => ({ ...f, destinationId: e.target.value }))}>
                <option value="">All destinations</option>
                {destinationsQuery.data?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Usage limit (optional)"
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
              />
              <Input label="Valid from" type="date" required value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} />
              <Input label="Valid to" type="date" required value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Active
              </label>
              <div className="sm:col-span-2">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createCoupon.isPending || updateCoupon.isPending}>
                  {form.id ? "Save changes" : "Create coupon"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
