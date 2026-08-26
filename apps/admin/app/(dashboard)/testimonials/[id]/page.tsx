"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useTestimonial,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDestinations,
  usePackages,
  useUploadFile,
  useUploadVideo,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { SaveTestimonialDto, TestimonialDto } from "@paxbook/types";
import { Button, Card, CardContent, CardHeader, CardTitle, ImageUploadField, Input, Select, VideoUploadField } from "@paxbook/ui";

export default function TestimonialBuilderPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === "new";
  const { hasPermission } = useSession();

  if (!hasPermission(PERMISSIONS.TESTIMONIALS_WRITE)) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>testimonials.write</code>.</p>
      </Card>
    );
  }

  const canApprove = hasPermission(PERMISSIONS.TESTIMONIALS_APPROVE);
  if (isNew) return <TestimonialBuilderForm testimonialId={null} initial={null} canApprove={canApprove} />;
  return <ExistingTestimonialBuilder id={params.id} canApprove={canApprove} />;
}

function ExistingTestimonialBuilder({ id, canApprove }: { id: string; canApprove: boolean }) {
  const testimonialQuery = useTestimonial(id);
  if (testimonialQuery.isLoading || !testimonialQuery.data) {
    return <p className="text-sm text-slate-500">Loading testimonial…</p>;
  }
  return <TestimonialBuilderForm testimonialId={id} initial={testimonialQuery.data} canApprove={canApprove} />;
}

interface FormState {
  customerName: string;
  rating: number;
  content: string;
  imageKey: string;
  imageUrl: string | null;
  isFeatured: boolean;
  slug: string;
  title: string;
  tripTitle: string;
  destinationId: string;
  packageId: string;
  videoKey: string;
  videoUrl: string | null;
  posterKey: string;
  posterUrl: string | null;
  durationSeconds: number | null;
  testimonialDate: string;
  sortOrder: number;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
}

function toFormState(t: TestimonialDto | null): FormState {
  if (!t) {
    return {
      customerName: "",
      rating: 5,
      content: "",
      imageKey: "",
      imageUrl: null,
      isFeatured: false,
      slug: "",
      title: "",
      tripTitle: "",
      destinationId: "",
      packageId: "",
      videoKey: "",
      videoUrl: null,
      posterKey: "",
      posterUrl: null,
      durationSeconds: null,
      testimonialDate: "",
      sortOrder: 0,
      status: "DRAFT",
    };
  }
  return {
    customerName: t.customerName,
    rating: t.rating,
    content: t.content,
    imageKey: t.imageKey ?? "",
    imageUrl: t.imageUrl,
    isFeatured: t.isFeatured,
    slug: t.slug ?? "",
    title: t.title ?? "",
    tripTitle: t.tripTitle ?? "",
    destinationId: t.destinationId ?? "",
    packageId: t.packageId ?? "",
    videoKey: t.videoKey ?? "",
    videoUrl: t.videoUrl,
    posterKey: t.posterKey ?? "",
    posterUrl: t.posterUrl,
    durationSeconds: t.durationSeconds,
    testimonialDate: t.testimonialDate ? t.testimonialDate.slice(0, 10) : "",
    sortOrder: t.sortOrder,
    status: t.status,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function TestimonialBuilderForm({
  testimonialId,
  initial,
  canApprove,
}: {
  testimonialId: string | null;
  initial: TestimonialDto | null;
  canApprove: boolean;
}) {
  const router = useRouter();
  const destinationsQuery = useDestinations();
  const packagesQuery = usePackages();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const uploadFile = useUploadFile();
  const uploadVideo = useUploadVideo();

  const [form, setForm] = React.useState<FormState>(() => toFormState(initial));
  const [error, setError] = React.useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = React.useState(false);

  async function handleVideoSelected(file: File, durationSeconds: number | null) {
    setIsUploadingVideo(true);
    try {
      const result = await uploadVideo.mutateAsync(file);
      setForm((f) => ({ ...f, videoKey: result.key, videoUrl: result.url, durationSeconds }));
    } finally {
      setIsUploadingVideo(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: SaveTestimonialDto = {
      customerName: form.customerName,
      rating: Number(form.rating),
      content: form.content,
      imageKey: form.imageKey || undefined,
      isFeatured: form.isFeatured,
      slug: form.slug || undefined,
      title: form.title || undefined,
      tripTitle: form.tripTitle || undefined,
      destinationId: form.destinationId || undefined,
      packageId: form.packageId || undefined,
      videoKey: form.videoKey || undefined,
      posterKey: form.posterKey || undefined,
      durationSeconds: form.durationSeconds ?? undefined,
      testimonialDate: form.testimonialDate || undefined,
      sortOrder: Number(form.sortOrder),
      status: form.status,
    };

    try {
      if (testimonialId) {
        await updateTestimonial.mutateAsync({ id: testimonialId, payload });
      } else {
        const created = await createTestimonial.mutateAsync(payload);
        router.replace(`/testimonials/${created.id}`);
        return;
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save testimonial.");
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{testimonialId ? "Edit testimonial" : "New testimonial"}</h1>
          <p className="text-sm text-slate-500">Customer details, video, and approval status for one video testimonial.</p>
        </div>
        <div className="flex items-center gap-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" isLoading={createTestimonial.isPending || updateTestimonial.isPending}>
            Save testimonial
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer & trip</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Customer name" required value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />
          <Input
            label="Rating (1-5)"
            type="number"
            min={1}
            max={5}
            required
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
          />
          <Select label="Destination" value={form.destinationId} onChange={(e) => setForm((f) => ({ ...f, destinationId: e.target.value }))}>
            <option value="">No destination</option>
            {destinationsQuery.data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select label="Associated package (optional)" value={form.packageId} onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}>
            <option value="">No package</option>
            {packagesQuery.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
          <Input
            label="Trip / holiday name"
            placeholder="e.g. Nakul & Subree Singapore Holiday"
            value={form.tripTitle}
            onChange={(e) => setForm((f) => ({ ...f, tripTitle: e.target.value }))}
          />
          <Input
            label="Testimonial title"
            placeholder="e.g. You can't fool Aishwarya"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <div>
            <Input
              label="URL slug"
              placeholder="nakul-subree-singapore-testimonial"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, slug: slugify(`${f.customerName} ${f.tripTitle}`) }))}
              className="mt-1 text-xs text-brand hover:underline"
            >
              Suggest from name + trip
            </button>
          </div>
          <Input
            label="Testimonial date"
            type="date"
            value={form.testimonialDate}
            onChange={(e) => setForm((f) => ({ ...f, testimonialDate: e.target.value }))}
          />
          <Input
            label="Display order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
          />
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
            Pin to top
          </label>
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Testimonial text</label>
            <textarea
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              rows={4}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <VideoUploadField
            label="Testimonial video"
            videoUrl={form.videoUrl}
            isUploading={isUploadingVideo}
            onFileSelected={handleVideoSelected}
            onClear={() => setForm((f) => ({ ...f, videoKey: "", videoUrl: null, durationSeconds: null }))}
          />
          {form.durationSeconds != null ? (
            <p className="text-xs text-slate-500">
              Duration: {Math.floor(form.durationSeconds / 60)}:{String(form.durationSeconds % 60).padStart(2, "0")}
            </p>
          ) : null}
          <ImageUploadField
            label="Video thumbnail / cover image"
            imageUrl={form.posterUrl}
            isUploading={uploadFile.isPending}
            onFileSelected={async (file) => {
              const result = await uploadFile.mutateAsync(file);
              setForm((f) => ({ ...f, posterKey: result.key, posterUrl: result.url }));
            }}
            onClear={() => setForm((f) => ({ ...f, posterKey: "", posterUrl: null }))}
          />
          <ImageUploadField
            label="Customer profile image (optional)"
            imageUrl={form.imageUrl}
            isUploading={uploadFile.isPending}
            onFileSelected={async (file) => {
              const result = await uploadFile.mutateAsync(file);
              setForm((f) => ({ ...f, imageKey: result.key, imageUrl: result.url }));
            }}
            onClear={() => setForm((f) => ({ ...f, imageKey: "", imageUrl: null }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approval status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Select
              label="Status"
              value={form.status}
              disabled={!canApprove && initial?.status === "PUBLISHED"}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" }))}
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Submit for review</option>
              {canApprove ? <option value="PUBLISHED">Published</option> : null}
            </Select>
            {!canApprove && initial?.status === "PUBLISHED" ? (
              <p className="mt-1 text-xs text-slate-400">Only a Super Admin can change a published testimonial&apos;s status.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
