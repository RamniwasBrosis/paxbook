"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useBranding, useUpdateBranding, useUploadFile } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { TemplateSlug } from "@paxbook/types";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from "@paxbook/ui";

export default function BrandingSettingsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.SETTINGS_READ);
  const canWrite = hasPermission(PERMISSIONS.SETTINGS_WRITE);
  const brandingQuery = useBranding();

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your role doesn&apos;t include <code>settings.read</code>.
        </p>
      </Card>
    );
  }

  if (brandingQuery.isLoading || !brandingQuery.data) {
    return <p className="text-sm text-slate-500">Loading branding…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Branding &amp; Template</h1>
        <p className="text-sm text-slate-500">Controls how your storefront looks at {brandingQuery.data.slug}.paxbook.test</p>
      </div>
      <BrandingForm initial={brandingQuery.data} canWrite={canWrite} />
    </div>
  );
}

function BrandingForm({
  initial,
  canWrite,
}: {
  initial: { logoUrl: string | null; primaryColor: string | null; templateSlug: TemplateSlug; customDomain: string | null };
  canWrite: boolean;
}) {
  const updateBranding = useUpdateBranding();
  const uploadFile = useUploadFile();
  const [primaryColor, setPrimaryColor] = React.useState(initial.primaryColor ?? "#0f4c81");
  const [templateSlug, setTemplateSlug] = React.useState<TemplateSlug>(initial.templateSlug);
  const [customDomain, setCustomDomain] = React.useState(initial.customDomain ?? "");
  const [logoStorageKey, setLogoStorageKey] = React.useState<string | undefined>(undefined);
  const [logoPreview, setLogoPreview] = React.useState(initial.logoUrl);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleLogoFile(file: File) {
    try {
      const uploaded = await uploadFile.mutateAsync(file);
      setLogoStorageKey(uploaded.key);
      setLogoPreview(uploaded.url);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not upload logo.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateBranding.mutateAsync({
        primaryColor,
        templateSlug,
        customDomain: customDomain || undefined,
        logoStorageKey,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save branding.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storefront appearance</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Logo</label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-12 w-12 rounded-lg border border-slate-200 object-contain" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">None</div>
              )}
              {canWrite ? (
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploadFile.isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleLogoFile(file);
                    e.target.value = "";
                  }}
                  className="text-xs text-slate-500"
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Primary color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                disabled={!canWrite}
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-slate-200"
              />
              <span className="text-sm text-slate-500">{primaryColor}</span>
            </div>
          </div>

          <Select label="Template" disabled={!canWrite} value={templateSlug} onChange={(e) => setTemplateSlug(e.target.value as TemplateSlug)}>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
          </Select>

          <Input
            label="Custom domain (optional)"
            placeholder="travel.youragency.com"
            disabled={!canWrite}
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
          />
          <p className="text-xs text-slate-400 sm:col-span-2">
            Pointing a custom domain here still requires DNS + SSL setup outside Paxbook — this field just tells the platform which domain to match to your storefront.
          </p>

          {canWrite ? (
            <div className="sm:col-span-2">
              {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
              {saved ? <p className="mb-2 text-sm text-emerald-600">Saved.</p> : null}
              <Button type="submit" isLoading={updateBranding.isPending}>
                Save branding
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
