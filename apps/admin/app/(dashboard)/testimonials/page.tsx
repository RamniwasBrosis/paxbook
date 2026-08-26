"use client";

import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useTestimonials, useSetTestimonialPublished, useDeleteTestimonial } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { TestimonialDto } from "@paxbook/types";
import { Badge, Button, Card, DataTable } from "@paxbook/ui";

export default function TestimonialsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.TESTIMONIALS_READ);
  const canWrite = hasPermission(PERMISSIONS.TESTIMONIALS_WRITE);
  const canApprove = hasPermission(PERMISSIONS.TESTIMONIALS_APPROVE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>testimonials.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Testimonials</h1>
          <p className="text-sm text-slate-500">Customer video testimonials shown in the &quot;Stories of our travellers&quot; section.</p>
        </div>
        {canWrite ? (
          <Link href="/testimonials/new">
            <Button>New testimonial</Button>
          </Link>
        ) : null}
      </div>
      <TestimonialsTable canWrite={canWrite} canApprove={canApprove} />
    </div>
  );
}

function TestimonialsTable({ canWrite, canApprove }: { canWrite: boolean; canApprove: boolean }) {
  const testimonialsQuery = useTestimonials();
  const setPublished = useSetTestimonialPublished();
  const deleteTestimonial = useDeleteTestimonial();

  async function handleSetPublished(t: TestimonialDto, published: boolean) {
    try {
      await setPublished.mutateAsync({ id: t.id, published });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update publish status.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await deleteTestimonial.mutateAsync(id);
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not delete testimonial.");
    }
  }

  return (
    <DataTable
      columns={[
        {
          header: "",
          cell: (t: TestimonialDto) =>
            t.posterUrl ? (
              <img src={t.posterUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-md bg-slate-100" />
            ),
        },
        {
          header: "Customer",
          cell: (t: TestimonialDto) =>
            canWrite ? (
              <Link href={`/testimonials/${t.id}`} className="text-slate-900 hover:underline">
                {t.customerName}
              </Link>
            ) : (
              t.customerName
            ),
        },
        { header: "Trip", cell: (t: TestimonialDto) => t.tripTitle ?? "—" },
        { header: "Destination", cell: (t: TestimonialDto) => t.destinationName ?? "—" },
        {
          header: "Status",
          cell: (t: TestimonialDto) => (
            <Badge tone={t.status === "PUBLISHED" ? "success" : t.status === "PENDING_REVIEW" ? "warning" : "neutral"}>
              {t.status === "PENDING_REVIEW" ? "PENDING REVIEW" : t.status}
            </Badge>
          ),
        },
        ...(canWrite || canApprove
          ? [
              {
                header: "",
                cell: (t: TestimonialDto) => (
                  <div className="flex gap-3">
                    {canApprove && t.status === "PENDING_REVIEW" ? (
                      <>
                        <button type="button" onClick={() => handleSetPublished(t, true)} className="text-xs font-semibold text-emerald-600 hover:underline">
                          Approve
                        </button>
                        <button type="button" onClick={() => handleSetPublished(t, false)} className="text-xs text-red-600 hover:underline">
                          Reject
                        </button>
                      </>
                    ) : null}
                    {canApprove && t.status === "PUBLISHED" ? (
                      <button type="button" onClick={() => handleSetPublished(t, false)} className="text-xs text-slate-600 hover:underline">
                        Unpublish
                      </button>
                    ) : null}
                    {canWrite ? (
                      <button type="button" onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]
          : []),
      ]}
      rows={testimonialsQuery.data ?? []}
      rowKey={(t) => t.id}
      isLoading={testimonialsQuery.isLoading}
      emptyMessage="No testimonials yet."
    />
  );
}
