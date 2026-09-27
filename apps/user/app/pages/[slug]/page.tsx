import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PageDto } from "@paxbook/types";
import { publicFetchOrNull } from "@/lib/api";
import { PageHero } from "@/components/PageHero";

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
    <div>
      <PageHero breadcrumbs={[{ label: page.title }]} title={page.title} />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="whitespace-pre-wrap text-lg leading-relaxed text-ink-muted">{page.body}</div>
      </article>
    </div>
  );
}
