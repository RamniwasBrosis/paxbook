"use client";

import * as React from "react";
import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useCustomers, useCreateCustomer } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { CustomerSummaryDto } from "@paxbook/types";
import { Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input } from "@paxbook/ui";

export default function CustomersPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.CUSTOMERS_READ);
  const canWrite = hasPermission(PERMISSIONS.CUSTOMERS_WRITE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>customers.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">Customer records, their travelers, documents, and bookings.</p>
      </div>
      <CustomersContent canWrite={canWrite} />
    </div>
  );
}

function CustomersContent({ canWrite }: { canWrite: boolean }) {
  const customersQuery = useCustomers();
  const createCustomer = useCreateCustomer();

  const [form, setForm] = React.useState({ name: "", email: "", phone: "" });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createCustomer.mutateAsync({ name: form.name, email: form.email, phone: form.phone || undefined });
      setForm({ name: "", email: "", phone: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create customer.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          {
            header: "Name",
            cell: (c: CustomerSummaryDto) => (
              <Link href={`/customers/${c.id}`} className="text-slate-900 hover:underline">
                {c.name}
              </Link>
            ),
          },
          { header: "Email", cell: (c: CustomerSummaryDto) => c.email },
          { header: "Phone", cell: (c: CustomerSummaryDto) => c.phone ?? "—" },
          { header: "Travelers", cell: (c: CustomerSummaryDto) => c.travelerCount },
          { header: "Bookings", cell: (c: CustomerSummaryDto) => c.bookingCount },
        ]}
        rows={customersQuery.data ?? []}
        rowKey={(c) => c.id}
        isLoading={customersQuery.isLoading}
        emptyMessage="No customers yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Add a customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
              <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              <div className="sm:col-span-3">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createCustomer.isPending}>
                  Create customer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
