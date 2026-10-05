"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useDestinations, useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { CouponDto, CouponScope } from "@paxbook/types";
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
  minBookingAmount: "" as string | number,
  maxDiscountAmount: "" as string | number,
  appliesTo: "ALL" as CouponScope,
  showOnCheckout: true,
  isActive: true,
};

const SCOPE_LABELS: Record<CouponScope, string> = { ALL: "Flights & holidays", FLIGHTS: "Flights only", PACKAGES: "Holidays only" };

/** Coupon dates are whole days in India time; the stored ISO value is UTC. */
function istDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function optionalNumber(value: string | number): number | null {
  return value === "" ? null : Number(value);
}

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
        <p className="text-sm text-slate-500">Promotional codes for flights and holidays. Flight coupons appear in the &ldquo;Coupons and offers&rdquo; box on the flight booking page.</p>
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
      validFrom: istDate(coupon.validFrom),
      validTo: istDate(coupon.validTo),
      usageLimit: coupon.usageLimit ?? "",
      minBookingAmount: coupon.minBookingAmount ?? "",
      maxDiscountAmount: coupon.maxDiscountAmount ?? "",
      appliesTo: coupon.appliesTo,
      showOnCheckout: coupon.showOnCheckout,
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
      usageLimit: optionalNumber(form.usageLimit),
      minBookingAmount: optionalNumber(form.minBookingAmount),
      maxDiscountAmount: optionalNumber(form.maxDiscountAmount),
      appliesTo: form.appliesTo,
      showOnCheckout: form.showOnCheckout,
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
          { header: "Applies to", cell: (c: CouponDto) => (c.destinationName ? `Holidays · ${c.destinationName}` : SCOPE_LABELS[c.appliesTo]) },
          { header: "Checkout list", cell: (c: CouponDto) => (c.showOnCheckout ? "Shown" : "Code only") },
          { header: "Valid", cell: (c: CouponDto) => `${istDate(c.validFrom)} → ${istDate(c.validTo)}` },
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
              <Select id="coupon-applies-to" label="Applies to" value={form.appliesTo} onChange={(e) => setForm((f) => ({ ...f, appliesTo: e.target.value as CouponScope }))}>
                <option value="ALL">Flights &amp; holidays</option>
                <option value="FLIGHTS">Flights only</option>
                <option value="PACKAGES">Holidays only</option>
              </Select>
              <Input
                id="coupon-min-amount"
                label="Minimum booking amount ₹ (optional)"
                type="number"
                min={0}
                value={form.minBookingAmount}
                onChange={(e) => setForm((f) => ({ ...f, minBookingAmount: e.target.value }))}
              />
              <Input
                id="coupon-max-discount"
                label="Maximum discount ₹ (optional, for percent)"
                type="number"
                min={0}
                value={form.maxDiscountAmount}
                onChange={(e) => setForm((f) => ({ ...f, maxDiscountAmount: e.target.value }))}
              />
              <Select label="Destination (optional, holidays only)" value={form.destinationId} onChange={(e) => setForm((f) => ({ ...f, destinationId: e.target.value }))}>
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
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.showOnCheckout} onChange={(e) => setForm((f) => ({ ...f, showOnCheckout: e.target.checked }))} />
                Show in the coupon list at flight checkout (otherwise it works only when typed in)
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
