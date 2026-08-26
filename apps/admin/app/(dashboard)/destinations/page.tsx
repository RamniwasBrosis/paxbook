"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useDestinations,
  useCountries,
  useDestinationCategories,
  useCreateDestination,
  useUpdateDestination,
  useDeleteDestination,
  useUploadFile,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { DestinationDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, ImageUploadField, Input, Select } from "@paxbook/ui";
import { DestinationContentEditor } from "./DestinationContentEditor";

const EMPTY_FORM = {
  id: null as string | null,
  countryId: "",
  name: "",
  slug: "",
  description: "",
  heroImageKey: "",
  heroImageUrl: "" as string | null,
  isFeatured: false,
  isActive: true,
  bestTimeToVisit: "",
  categoryIds: [] as string[],
};

export default function DestinationsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.DESTINATIONS_READ);
  const canWrite = hasPermission(PERMISSIONS.DESTINATIONS_WRITE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>destinations.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Destinations</h1>
        <p className="text-sm text-slate-500">Countries, theme tags, and hero imagery for the destination catalog.</p>
      </div>
      <DestinationsContent canWrite={canWrite} />
    </div>
  );
}

function DestinationsContent({ canWrite }: { canWrite: boolean }) {
  const destinationsQuery = useDestinations();
  const countriesQuery = useCountries();
  const categoriesQuery = useDestinationCategories();
  const createDestination = useCreateDestination();
  const updateDestination = useUpdateDestination();
  const deleteDestination = useDeleteDestination();
  const uploadFile = useUploadFile();

  const [form, setForm] = React.useState(EMPTY_FORM);
  const [error, setError] = React.useState<string | null>(null);

  function loadIntoForm(destination: DestinationDto) {
    setError(null);
    setForm({
      id: destination.id,
      countryId: destination.countryId,
      name: destination.name,
      slug: destination.slug,
      description: destination.description ?? "",
      heroImageKey: destination.heroImageKey ?? "",
      heroImageUrl: destination.heroImageUrl,
      isFeatured: destination.isFeatured,
      isActive: destination.isActive,
      bestTimeToVisit: destination.bestTimeToVisit ?? "",
      categoryIds: destination.categoryIds,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      countryId: form.countryId,
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      heroImageKey: form.heroImageKey || undefined,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      bestTimeToVisit: form.bestTimeToVisit || undefined,
      categoryIds: form.categoryIds,
    };
    try {
      if (form.id) {
        await updateDestination.mutateAsync({ id: form.id, payload });
      } else {
        await createDestination.mutateAsync(payload);
      }
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save destination.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this destination?")) return;
    try {
      await deleteDestination.mutateAsync(id);
      if (form.id === id) setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not delete destination.");
    }
  }

  async function handleHeroUpload(file: File) {
    try {
      const result = await uploadFile.mutateAsync(file);
      setForm((f) => ({ ...f, heroImageKey: result.key, heroImageUrl: result.url }));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed.");
    }
  }

  function toggleCategory(categoryId: string) {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(categoryId)
        ? f.categoryIds.filter((id) => id !== categoryId)
        : [...f.categoryIds, categoryId],
    }));
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Name", cell: (d: DestinationDto) => d.name },
          { header: "Country", cell: (d: DestinationDto) => d.countryName },
          {
            header: "Categories",
            cell: (d: DestinationDto) => (
              <div className="flex flex-wrap gap-1">
                {d.categoryNames.map((name) => (
                  <Badge key={name} tone="neutral">
                    {name}
                  </Badge>
                ))}
              </div>
            ),
          },
          { header: "Featured", cell: (d: DestinationDto) => (d.isFeatured ? <Badge tone="success">Featured</Badge> : null) },
          {
            header: "Status",
            cell: (d: DestinationDto) => <Badge tone={d.isActive ? "success" : "neutral"}>{d.isActive ? "Active" : "Inactive"}</Badge>,
          },
          ...(canWrite
            ? [
                {
                  header: "",
                  cell: (d: DestinationDto) => (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(d.id);
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
        rows={destinationsQuery.data ?? []}
        rowKey={(d) => d.id}
        onRowClick={canWrite ? loadIntoForm : undefined}
        isLoading={destinationsQuery.isLoading}
        emptyMessage="No destinations yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{form.id ? "Edit destination" : "Add a destination"}</CardTitle>
            {form.id ? (
              <button type="button" onClick={() => setForm(EMPTY_FORM)} className="text-xs text-slate-500 hover:underline">
                Cancel edit
              </button>
            ) : null}
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input label="Slug" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />

              <Select
                label="Country"
                required
                value={form.countryId}
                onChange={(e) => setForm((f) => ({ ...f, countryId: e.target.value }))}
              >
                <option value="" disabled>
                  Select a country…
                </option>
                {countriesQuery.data?.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Best time to visit"
                placeholder="e.g. April – October"
                value={form.bestTimeToVisit}
                onChange={(e) => setForm((f) => ({ ...f, bestTimeToVisit: e.target.value }))}
              />

              <div className="flex items-center gap-5 self-end pb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  />
                  Featured on homepage
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  Active (visible on site)
                </label>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Hero image"
                  imageUrl={form.heroImageUrl}
                  isUploading={uploadFile.isPending}
                  onFileSelected={handleHeroUpload}
                  onClear={() => setForm((f) => ({ ...f, heroImageKey: "", heroImageUrl: null }))}
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">Theme categories</span>
                <div className="flex flex-wrap gap-3">
                  {categoriesQuery.data?.map((category) => (
                    <label key={category.id} className="flex items-center gap-1.5 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={form.categoryIds.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createDestination.isPending || updateDestination.isPending}>
                  {form.id ? "Save changes" : "Create destination"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {canWrite && form.id ? <DestinationContentEditor destinationId={form.id} destinationName={form.name || "this destination"} /> : null}
    </>
  );
}
