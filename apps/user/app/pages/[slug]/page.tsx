import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PageDto } from "@paxbook/types";
import { publicFetchOrNull } from "@/lib/api";

async function getPage(slug: string) {
  return publicFetchOrNull<PageDto>(`/public/pages/${slug}`);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) return {};
  return {
    title: page.seo?.title ?? page.title,
    description: page.seo?.description ?? undefined,
    alternates: page.seo?.canonicalUrl ? { canonical: page.seo.canonicalUrl } : undefined,
  };
}

export default async function StaticPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">{page.title}</h1>
      <div className="mt-8 whitespace-pre-wrap leading-relaxed text-slate-700">{page.body}</div>
    </article>
  );
}
