"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, usePackages, useReviews, useCreateReview, useModerateReview, useDeleteReview } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { ReviewDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input, Select } from "@paxbook/ui";

const STATUS_TONE = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" } as const;

export default function ReviewsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.REVIEWS_READ);
  const canWrite = hasPermission(PERMISSIONS.REVIEWS_WRITE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>reviews.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reviews</h1>
        <p className="text-sm text-slate-500">Customer reviews per package, with moderation before they go live.</p>
      </div>
      <ReviewsContent canWrite={canWrite} />
    </div>
  );
}

function ReviewsContent({ canWrite }: { canWrite: boolean }) {
  const reviewsQuery = useReviews();
  const packagesQuery = usePackages();
  const createReview = useCreateReview();
  const moderateReview = useModerateReview();
  const deleteReview = useDeleteReview();

  const [form, setForm] = React.useState({ packageId: "", authorName: "", rating: 5, title: "", comment: "" });
  const [error, setError] = React.useState<string | null>(null);

  async function handleModerate(id: string, status: "APPROVED" | "REJECTED") {
    try {
      await moderateReview.mutateAsync({ id, payload: { status } });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update review status.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview.mutateAsync(id);
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not delete review.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createReview.mutateAsync({
        packageId: form.packageId,
        authorName: form.authorName,
        rating: form.rating,
        title: form.title || undefined,
        comment: form.comment,
      });
      setForm({ packageId: "", authorName: "", rating: 5, title: "", comment: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add review.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Package", cell: (r: ReviewDto) => r.packageTitle },
          { header: "Author", cell: (r: ReviewDto) => r.authorName },
          { header: "Rating", cell: (r: ReviewDto) => "★".repeat(r.rating) },
          { header: "Comment", cell: (r: ReviewDto) => <span className="line-clamp-2 max-w-xs">{r.comment}</span> },
          { header: "Status", cell: (r: ReviewDto) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
          ...(canWrite
            ? [
                {
                  header: "",
                  cell: (r: ReviewDto) => (
                    <div className="flex gap-2">
                      {r.status !== "APPROVED" ? (
                        <button type="button" onClick={() => handleModerate(r.id, "APPROVED")} className="text-xs text-emerald-600 hover:underline">
                          Approve
                        </button>
                      ) : null}
                      {r.status !== "REJECTED" ? (
                        <button type="button" onClick={() => handleModerate(r.id, "REJECTED")} className="text-xs text-amber-600 hover:underline">
                          Reject
                        </button>
                      ) : null}
                      <button type="button" onClick={() => handleDelete(r.id)} className="text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
        rows={reviewsQuery.data ?? []}
        rowKey={(r) => r.id}
        isLoading={reviewsQuery.isLoading}
        emptyMessage="No reviews yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Add a review</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <Select label="Package" required value={form.packageId} onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}>
                <option value="" disabled>
                  Select a package…
                </option>
                {packagesQuery.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Select>
              <Input label="Author name" required value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} />
              <Input
                label="Rating (1-5)"
                type="number"
                min={1}
                max={5}
                required
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              />
              <Input label="Title (optional)" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Comment</label>
                <textarea
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={3}
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createReview.isPending}>
                  Add review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
