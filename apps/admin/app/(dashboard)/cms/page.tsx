"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useUploadFile,
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  useFaqItems,
  useCreateFaqItem,
  useUpdateFaqItem,
  useDeleteFaqItem,
  useBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useHomepageBlocks,
  useCreateHomepageBlock,
  useUpdateHomepageBlock,
  useDeleteHomepageBlock,
  usePages,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  useVisaInfoList,
  useSaveVisaInfo,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { BannerDto, BlogPostDto, FaqItemDto, HomepageBlockDto, PageDto, VisaInfoDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, ImageUploadField, Input, Select } from "@paxbook/ui";

const TABS = ["Banners", "FAQ", "Blog", "Homepage Blocks", "Visa Guide", "Pages"] as const;
type Tab = (typeof TABS)[number];

export default function CmsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.CMS_READ);
  const canWrite = hasPermission(PERMISSIONS.CMS_WRITE);
  const [tab, setTab] = React.useState<Tab>("Banners");

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>cms.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">CMS</h1>
        <p className="text-sm text-slate-500">
          Banners, FAQs, the blog, homepage layout blocks, the visa guide, and static pages. Video testimonials now live under their own Testimonials section.
        </p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              "px-3 py-2 text-sm font-medium " +
              (tab === t ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Banners" ? <BannersTab canWrite={canWrite} /> : null}
      {tab === "FAQ" ? <FaqTab canWrite={canWrite} /> : null}
      {tab === "Blog" ? <BlogTab canWrite={canWrite} /> : null}
      {tab === "Homepage Blocks" ? <HomepageBlocksTab canWrite={canWrite} /> : null}
      {tab === "Visa Guide" ? <VisaGuideTab canWrite={canWrite} /> : null}
      {tab === "Pages" ? <PagesTab canWrite={canWrite} /> : null}
    </div>
  );
}

const PLACEMENTS = ["homepage_hero", "homepage_strip", "homepage_bottom", "destination_page", "package_page"];
const PLACEMENT_LABELS: Record<string, string> = {
  homepage_hero: "Homepage — Hero",
  homepage_strip: "Homepage — Strip",
  homepage_bottom: "Homepage — Bottom CTA / Posters",
  destination_page: "Destination page",
  package_page: "Package page",
};

function BannersTab({ canWrite }: { canWrite: boolean }) {
  const listQuery = useBanners();
  const create = useCreateBanner();
  const update = useUpdateBanner();
  const remove = useDeleteBanner();
  const uploadFile = useUploadFile();

  const empty = {
    id: null as string | null,
    imageKey: "",
    imageUrl: "" as string | null,
    title: "",
    description: "",
    ctaText: "",
    linkUrl: "",
    placement: PLACEMENTS[0]!,
    sortOrder: 0,
    isActive: true,
  };
  const [form, setForm] = React.useState(empty);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      imageKey: form.imageKey,
      title: form.title || undefined,
      description: form.description || undefined,
      ctaText: form.ctaText || undefined,
      linkUrl: form.linkUrl || undefined,
      placement: form.placement,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    try {
      if (form.id) await update.mutateAsync({ id: form.id, payload });
      else await create.mutateAsync(payload);
      setForm(empty);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save banner.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Placement", cell: (b: BannerDto) => PLACEMENT_LABELS[b.placement] ?? b.placement },
          { header: "Title", cell: (b: BannerDto) => b.title ?? "—" },
          { header: "CTA", cell: (b: BannerDto) => b.ctaText ?? "—" },
          { header: "Order", cell: (b: BannerDto) => b.sortOrder },
          { header: "Status", cell: (b: BannerDto) => <Badge tone={b.isActive ? "success" : "neutral"}>{b.isActive ? "Active" : "Inactive"}</Badge> },
          ...(canWrite
            ? [{ header: "", cell: (b: BannerDto) => <DeleteButton onClick={() => remove.mutateAsync(b.id)} /> }]
            : []),
        ]}
        rows={listQuery.data ?? []}
        rowKey={(b) => b.id}
        onRowClick={
          canWrite
            ? (b) =>
                setForm({
                  id: b.id,
                  imageKey: b.imageKey,
                  imageUrl: b.imageUrl,
                  title: b.title ?? "",
                  description: b.description ?? "",
                  ctaText: b.ctaText ?? "",
                  linkUrl: b.linkUrl ?? "",
                  placement: b.placement,
                  sortOrder: b.sortOrder,
                  isActive: b.isActive,
                })
            : undefined
        }
        isLoading={listQuery.isLoading}
      />
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>{form.id ? "Edit banner / poster" : "Add banner / poster"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <Select label="Placement" value={form.placement} onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}>
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>
                    {PLACEMENT_LABELS[p] ?? p}
                  </option>
                ))}
              </Select>
              <Input
                label="Sort order"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
              <Input label="Title (optional)" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <Input label="CTA button text (optional)" placeholder="Explore Now" value={form.ctaText} onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))} />
              <Input
                label="Description (optional)"
                className="sm:col-span-2"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <Input
                label="Redirect / link URL"
                className="sm:col-span-2"
                placeholder="/packages/europe-highlights or https://..."
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Active / published (visible on the site)
              </label>
              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Image"
                  imageUrl={form.imageUrl}
                  isUploading={uploadFile.isPending}
                  onFileSelected={async (file) => {
                    const result = await uploadFile.mutateAsync(file);
                    setForm((f) => ({ ...f, imageKey: result.key, imageUrl: result.url }));
                  }}
                />
              </div>

              {form.imageUrl ? (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-medium text-slate-500">Preview</p>
                  <div className="relative overflow-hidden rounded-xl border border-slate-200">
                    <img src={form.imageUrl} alt="" className="h-40 w-full object-cover" />
                    {form.title || form.description || form.ctaText ? (
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-white">
                        {form.title ? <p className="text-sm font-bold">{form.title}</p> : null}
                        {form.description ? <p className="text-xs text-white/80">{form.description}</p> : null}
                        {form.ctaText ? (
                          <span className="mt-2 inline-block w-fit rounded-full bg-accent px-3 py-1 text-xs font-bold text-navy-deep">{form.ctaText}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="sm:col-span-2">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={create.isPending || update.isPending} disabled={!form.imageKey}>
                  {form.id ? "Save changes" : "Create banner"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function FaqTab({ canWrite }: { canWrite: boolean }) {
  const listQuery = useFaqItems();
  const create = useCreateFaqItem();
  const update = useUpdateFaqItem();
  const remove = useDeleteFaqItem();

  const empty = { id: null as string | null, question: "", answer: "", sortOrder: 0 };
  const [form, setForm] = React.useState(empty);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { question: form.question, answer: form.answer, sortOrder: form.sortOrder };
    try {
      if (form.id) await update.mutateAsync({ id: form.id, payload });
      else await create.mutateAsync(payload);
      setForm(empty);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save FAQ item.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Question", cell: (f: FaqItemDto) => f.question },
          { header: "Order", cell: (f: FaqItemDto) => f.sortOrder },
          ...(canWrite ? [{ header: "", cell: (f: FaqItemDto) => <DeleteButton onClick={() => remove.mutateAsync(f.id)} /> }] : []),
        ]}
        rows={listQuery.data ?? []}
        rowKey={(f) => f.id}
        onRowClick={canWrite ? (f) => setForm({ id: f.id, question: f.question, answer: f.answer, sortOrder: f.sortOrder }) : undefined}
        isLoading={listQuery.isLoading}
      />
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>{form.id ? "Edit FAQ item" : "Add FAQ item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input label="Question" required value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Answer</label>
                <textarea
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={3}
                  value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                />
              </div>
              <Input
                label="Sort order"
                type="number"
                className="w-32"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" isLoading={create.isPending || update.isPending} className="w-fit">
                {form.id ? "Save changes" : "Add FAQ item"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function BlogTab({ canWrite }: { canWrite: boolean }) {
  const listQuery = useBlogPosts();
  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();
  const remove = useDeleteBlogPost();
  const uploadFile = useUploadFile();

  const empty = {
    id: null as string | null,
    title: "",
    slug: "",
    body: "",
    excerpt: "",
    category: "",
    readMinutes: "" as string | number,
    coverImageKey: "",
    coverImageUrl: null as string | null,
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
  };
  const [form, setForm] = React.useState(empty);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      title: form.title,
      slug: form.slug,
      body: form.body,
      excerpt: form.excerpt || undefined,
      category: form.category || undefined,
      readMinutes: form.readMinutes === "" ? undefined : Number(form.readMinutes),
      coverImageKey: form.coverImageKey || undefined,
      status: form.status,
    };
    try {
      if (form.id) await update.mutateAsync({ id: form.id, payload });
      else await create.mutateAsync(payload);
      setForm(empty);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save blog post.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Title", cell: (p: BlogPostDto) => p.title },
          { header: "Slug", cell: (p: BlogPostDto) => p.slug },
          { header: "Status", cell: (p: BlogPostDto) => <Badge tone={p.status === "PUBLISHED" ? "success" : "neutral"}>{p.status}</Badge> },
          ...(canWrite ? [{ header: "", cell: (p: BlogPostDto) => <DeleteButton onClick={() => remove.mutateAsync(p.id)} /> }] : []),
        ]}
        rows={listQuery.data ?? []}
        rowKey={(p) => p.id}
        onRowClick={
          canWrite
            ? (p) =>
                setForm({
                  id: p.id,
                  title: p.title,
                  slug: p.slug,
                  body: p.body,
                  excerpt: p.excerpt ?? "",
                  category: p.category ?? "",
                  readMinutes: p.readMinutes ?? "",
                  coverImageKey: p.coverImageKey ?? "",
                  coverImageUrl: p.coverImageUrl,
                  status: p.status,
                })
            : undefined
        }
        isLoading={listQuery.isLoading}
      />
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>{form.id ? "Edit blog post" : "Add blog post"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <Input label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <Input label="Slug" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              <Input
                label="Category"
                placeholder="e.g. Travel Guides, Honeymoon, Visa"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
              <Input
                label="Read time (minutes)"
                type="number"
                min={1}
                value={form.readMinutes}
                onChange={(e) => setForm((f) => ({ ...f, readMinutes: e.target.value }))}
              />
              <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PUBLISHED" }))}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </Select>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Excerpt</label>
                <textarea
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={2}
                  placeholder="One-line summary shown on the blog list card."
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Body</label>
                <textarea
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={6}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Cover image"
                  imageUrl={form.coverImageUrl}
                  isUploading={uploadFile.isPending}
                  onFileSelected={async (file) => {
                    const result = await uploadFile.mutateAsync(file);
                    setForm((f) => ({ ...f, coverImageKey: result.key, coverImageUrl: result.url }));
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={create.isPending || update.isPending}>
                  {form.id ? "Save changes" : "Publish draft"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

const HOMEPAGE_BLOCK_TYPES = [
  "hero_search",
  "ai_trip_planner",
  "featured_destinations",
  "trending_packages",
  "visa_free_destinations",
  "testimonials",
  "recently_booked_trips",
  "banner_strip",
  "promo_banners",
  "travel_guides",
  "why_choose",
  "traveler_types",
  "who_coming_along",
  "how_it_works",
];

const WHO_COMING_ALONG_LABELS = ["Couple", "Family", "Friends", "Solo"] as const;
interface WhoComingAlongItem {
  label: string;
  tagline: string;
  category: string;
  imageKey: string;
  imageUrl: string | null;
}

function defaultWhoComingAlongItems(): WhoComingAlongItem[] {
  return WHO_COMING_ALONG_LABELS.map((label) => ({ label, tagline: "", category: label, imageKey: "", imageUrl: null }));
}

function HomepageBlocksTab({ canWrite }: { canWrite: boolean }) {
  const listQuery = useHomepageBlocks();
  const create = useCreateHomepageBlock();
  const update = useUpdateHomepageBlock();
  const remove = useDeleteHomepageBlock();
  const uploadFile = useUploadFile();

  const empty = { id: null as string | null, type: HOMEPAGE_BLOCK_TYPES[0]!, configJson: "{}", sortOrder: 0 };
  const [form, setForm] = React.useState(empty);
  const [whoItems, setWhoItems] = React.useState<WhoComingAlongItem[]>(defaultWhoComingAlongItems());
  const [error, setError] = React.useState<string | null>(null);

  function resetForm() {
    setForm(empty);
    setWhoItems(defaultWhoComingAlongItems());
  }

  function loadRow(b: HomepageBlockDto) {
    setForm({ id: b.id, type: b.type, configJson: JSON.stringify(b.configJson, null, 2), sortOrder: b.sortOrder });
    if (b.type === "who_coming_along" && Array.isArray((b.configJson as Record<string, unknown>).items)) {
      setWhoItems((b.configJson as { items: WhoComingAlongItem[] }).items);
    } else {
      setWhoItems(defaultWhoComingAlongItems());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let configJson: Record<string, unknown>;
    if (form.type === "who_coming_along") {
      if (whoItems.some((item) => !item.imageKey)) {
        setError("Upload an image for every card before saving.");
        return;
      }
      configJson = { items: whoItems.map(({ label, tagline, category, imageKey }) => ({ label, tagline, category, imageKey })) };
    } else {
      try {
        configJson = JSON.parse(form.configJson || "{}");
      } catch {
        setError("Config must be valid JSON.");
        return;
      }
    }

    const payload = { type: form.type, configJson, sortOrder: form.sortOrder };
    try {
      if (form.id) await update.mutateAsync({ id: form.id, payload });
      else await create.mutateAsync(payload);
      resetForm();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save homepage block.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Type", cell: (b: HomepageBlockDto) => b.type },
          { header: "Order", cell: (b: HomepageBlockDto) => b.sortOrder },
          ...(canWrite ? [{ header: "", cell: (b: HomepageBlockDto) => <DeleteButton onClick={() => remove.mutateAsync(b.id)} /> }] : []),
        ]}
        rows={listQuery.data ?? []}
        rowKey={(b) => b.id}
        onRowClick={canWrite ? loadRow : undefined}
        isLoading={listQuery.isLoading}
      />
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>{form.id ? "Edit homepage block" : "Add homepage block"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  {HOMEPAGE_BLOCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Sort order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </div>

              {form.type === "who_coming_along" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {whoItems.map((item, i) => (
                    <div key={item.label} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <Input
                        label="Tagline"
                        placeholder="e.g. Romantic, unhurried"
                        value={item.tagline}
                        onChange={(e) =>
                          setWhoItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, tagline: e.target.value } : it)))
                        }
                      />
                      <ImageUploadField
                        label="Photo"
                        imageUrl={item.imageUrl}
                        isUploading={uploadFile.isPending}
                        onFileSelected={async (file) => {
                          const result = await uploadFile.mutateAsync(file);
                          setWhoItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, imageKey: result.key, imageUrl: result.url } : it)));
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Config (JSON)</label>
                  <textarea
                    className="rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    rows={5}
                    value={form.configJson}
                    onChange={(e) => setForm((f) => ({ ...f, configJson: e.target.value }))}
                  />
                </div>
              )}

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" isLoading={create.isPending || update.isPending} className="w-fit">
                {form.id ? "Save changes" : "Add block"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function VisaGuideTab({ canWrite }: { canWrite: boolean }) {
  const listQuery = useVisaInfoList();
  const saveVisaInfo = useSaveVisaInfo();

  const empty = {
    countryId: null as string | null,
    countryName: "",
    visaType: "",
    requiredDocuments: "",
    isVisaFree: false,
    processingTime: "",
    visaFee: "" as string | number,
    currency: "INR",
    notes: "",
  };
  const [form, setForm] = React.useState(empty);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.countryId) return;
    try {
      await saveVisaInfo.mutateAsync({
        countryId: form.countryId,
        payload: {
          visaType: form.visaType,
          requiredDocuments: form.requiredDocuments.split("\n").map((line) => line.trim()).filter(Boolean),
          isVisaFree: form.isVisaFree,
          processingTime: form.processingTime,
          visaFee: form.visaFee === "" ? undefined : Number(form.visaFee),
          currency: form.currency || undefined,
          notes: form.notes || undefined,
        },
      });
      setForm(empty);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save visa info.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Country", cell: (v: VisaInfoDto) => v.countryName },
          { header: "Visa type", cell: (v: VisaInfoDto) => v.visaType ?? "— not set —" },
          { header: "Processing time", cell: (v: VisaInfoDto) => v.processingTime ?? "—" },
          { header: "Fee", cell: (v: VisaInfoDto) => (v.visaFee != null ? `${v.currency} ${v.visaFee}` : "—") },
          { header: "Visa-free", cell: (v: VisaInfoDto) => (v.isVisaFree ? <Badge tone="success">Visa-free</Badge> : null) },
        ]}
        rows={listQuery.data ?? []}
        rowKey={(v) => v.countryId}
        onRowClick={
          canWrite
            ? (v) =>
                setForm({
                  countryId: v.countryId,
                  countryName: v.countryName,
                  visaType: v.visaType ?? "",
                  requiredDocuments: (v.requiredDocuments ?? []).join("\n"),
                  isVisaFree: v.isVisaFree,
                  processingTime: v.processingTime ?? "",
                  visaFee: v.visaFee ?? "",
                  currency: v.currency ?? "INR",
                  notes: v.notes ?? "",
                })
            : undefined
        }
        isLoading={listQuery.isLoading}
      />
      {canWrite && form.countryId ? (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Visa info — {form.countryName}</CardTitle>
            <button type="button" onClick={() => setForm(empty)} className="text-xs text-slate-500 hover:underline">
              Cancel
            </button>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <Input label="Visa type" required value={form.visaType} onChange={(e) => setForm((f) => ({ ...f, visaType: e.target.value }))} />
              <Input
                label="Processing time"
                required
                placeholder="e.g. 3-5 business days"
                value={form.processingTime}
                onChange={(e) => setForm((f) => ({ ...f, processingTime: e.target.value }))}
              />
              <Input
                label="Visa fee"
                type="number"
                min={0}
                value={form.visaFee}
                onChange={(e) => setForm((f) => ({ ...f, visaFee: e.target.value }))}
              />
              <Input label="Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
              <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.isVisaFree} onChange={(e) => setForm((f) => ({ ...f, isVisaFree: e.target.checked }))} />
                Visa-free for Indian passport holders
              </label>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Required documents (one per line)</label>
                <textarea
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={4}
                  value={form.requiredDocuments}
                  onChange={(e) => setForm((f) => ({ ...f, requiredDocuments: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                <textarea
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={saveVisaInfo.isPending}>
                  Save visa info
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function PagesTab({ canWrite }: { canWrite: boolean }) {
  const listQuery = usePages();
  const create = useCreatePage();
  const update = useUpdatePage();
  const remove = useDeletePage();

  const empty = {
    id: null as string | null,
    title: "",
    slug: "",
    body: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
  };
  const [form, setForm] = React.useState(empty);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { title: form.title, slug: form.slug, body: form.body, status: form.status };
    try {
      if (form.id) await update.mutateAsync({ id: form.id, payload });
      else await create.mutateAsync(payload);
      setForm(empty);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save page.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Title", cell: (p: PageDto) => p.title },
          { header: "Slug", cell: (p: PageDto) => p.slug },
          { header: "Status", cell: (p: PageDto) => <Badge tone={p.status === "PUBLISHED" ? "success" : "neutral"}>{p.status}</Badge> },
          ...(canWrite ? [{ header: "", cell: (p: PageDto) => <DeleteButton onClick={() => remove.mutateAsync(p.id)} /> }] : []),
        ]}
        rows={listQuery.data ?? []}
        rowKey={(p) => p.id}
        onRowClick={canWrite ? (p) => setForm({ id: p.id, title: p.title, slug: p.slug, body: p.body, status: p.status }) : undefined}
        isLoading={listQuery.isLoading}
        emptyMessage="No pages yet — try adding About Us, Terms & Conditions, or Privacy Policy."
      />
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>{form.id ? "Edit page" : "Add page"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <Input label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <Input label="Slug" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PUBLISHED" }))}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </Select>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Body</label>
                <textarea
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={6}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={create.isPending || update.isPending}>
                  {form.id ? "Save changes" : "Add page"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function DeleteButton({ onClick }: { onClick: () => Promise<unknown> }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (confirm("Delete this item?")) onClick();
      }}
      className="text-xs text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}
