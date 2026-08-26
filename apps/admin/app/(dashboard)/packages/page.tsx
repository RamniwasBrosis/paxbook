"use client";

import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, usePackages, useSetPackagePublished, useDeletePackage } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { PackageSummaryDto } from "@paxbook/types";
import { Badge, Button, Card, DataTable } from "@paxbook/ui";

export default function PackagesPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.PACKAGES_READ);
  const canWrite = hasPermission(PERMISSIONS.PACKAGES_WRITE);
  const canApprove = hasPermission(PERMISSIONS.PACKAGES_APPROVE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>packages.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Packages</h1>
          <p className="text-sm text-slate-500">Itineraries, hotels, flights, and pricing for every tour package.</p>
        </div>
        {canWrite ? (
          <Link href="/packages/new">
            <Button>New package</Button>
          </Link>
        ) : null}
      </div>
      <PackagesTable canWrite={canWrite} canApprove={canApprove} />
    </div>
  );
}

function PackagesTable({ canWrite, canApprove }: { canWrite: boolean; canApprove: boolean }) {
  const packagesQuery = usePackages();
  const setPublished = useSetPackagePublished();
  const deletePackage = useDeletePackage();

  async function handleSetPublished(pkg: PackageSummaryDto, published: boolean) {
    try {
      await setPublished.mutateAsync({ id: pkg.id, published });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update publish status.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this package?")) return;
    try {
      await deletePackage.mutateAsync(id);
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not delete package.");
    }
  }

  return (
    <DataTable
      columns={[
        {
          header: "Title",
          cell: (p: PackageSummaryDto) =>
            canWrite ? (
              <Link href={`/packages/${p.id}`} className="text-slate-900 hover:underline">
                {p.title}
              </Link>
            ) : (
              p.title
            ),
        },
        { header: "Destination", cell: (p: PackageSummaryDto) => p.destinationName },
        { header: "Duration", cell: (p: PackageSummaryDto) => `${p.durationDays}D / ${p.durationNights}N` },
        { header: "Base price", cell: (p: PackageSummaryDto) => `₹${p.basePrice.toLocaleString("en-IN")}` },
        {
          header: "Status",
          cell: (p: PackageSummaryDto) => (
            <Badge tone={p.status === "PUBLISHED" ? "success" : p.status === "PENDING_REVIEW" ? "warning" : "neutral"}>
              {p.status === "PENDING_REVIEW" ? "PENDING REVIEW" : p.status}
            </Badge>
          ),
        },
        ...(canWrite || canApprove
          ? [
              {
                header: "",
                cell: (p: PackageSummaryDto) => (
                  <div className="flex gap-3">
                    {canApprove && p.status === "PENDING_REVIEW" ? (
                      <>
                        <button type="button" onClick={() => handleSetPublished(p, true)} className="text-xs font-semibold text-emerald-600 hover:underline">
                          Approve
                        </button>
                        <button type="button" onClick={() => handleSetPublished(p, false)} className="text-xs text-red-600 hover:underline">
                          Reject
                        </button>
                      </>
                    ) : null}
                    {canApprove && p.status === "PUBLISHED" ? (
                      <button type="button" onClick={() => handleSetPublished(p, false)} className="text-xs text-slate-600 hover:underline">
                        Unpublish
                      </button>
                    ) : null}
                    {canWrite ? (
                      <button type="button" onClick={() => handleDelete(p.id)} className="text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]
          : []),
      ]}
      rows={packagesQuery.data ?? []}
      rowKey={(p) => p.id}
      isLoading={packagesQuery.isLoading}
      emptyMessage="No packages yet."
    />
  );
}
