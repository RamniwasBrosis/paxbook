"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { CategoryDto } from "@paxbook/types";
import { Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input } from "@paxbook/ui";

const EMPTY_FORM = { id: null as string | null, name: "" };

export default function CategoriesPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.CATEGORIES_READ);
  const canWrite = hasPermission(PERMISSIONS.CATEGORIES_WRITE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>categories.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500">Shared theme tags (Honeymoon, Family, Adventure, etc.) used across Destinations, Packages, and Inventory.</p>
      </div>
      <CategoriesContent canWrite={canWrite} />
    </div>
  );
}

function CategoriesContent({ canWrite }: { canWrite: boolean }) {
  const categoriesQuery = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [form, setForm] = React.useState(EMPTY_FORM);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (form.id) {
        await updateCategory.mutateAsync({ id: form.id, payload: { name: form.name } });
      } else {
        await createCategory.mutateAsync({ name: form.name });
      }
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save category.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory.mutateAsync(id);
      if (form.id === id) setForm(EMPTY_FORM);
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not delete category.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Name", cell: (c: CategoryDto) => c.name },
          ...(canWrite
            ? [
                {
                  header: "",
                  cell: (c: CategoryDto) => (
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
        rows={categoriesQuery.data ?? []}
        rowKey={(c) => c.id}
        onRowClick={canWrite ? (c) => setForm({ id: c.id, name: c.name }) : undefined}
        isLoading={categoriesQuery.isLoading}
        emptyMessage="No categories yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{form.id ? "Edit category" : "Add category"}</CardTitle>
            {form.id ? (
              <button type="button" onClick={() => setForm(EMPTY_FORM)} className="text-xs text-slate-500 hover:underline">
                Cancel edit
              </button>
            ) : null}
          </CardHeader>
          <CardContent>
            <form className="flex flex-wrap items-end gap-4" onSubmit={handleSubmit}>
              <Input
                label="Name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Button type="submit" isLoading={createCategory.isPending || updateCategory.isPending}>
                {form.id ? "Save changes" : "Add category"}
              </Button>
            </form>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
