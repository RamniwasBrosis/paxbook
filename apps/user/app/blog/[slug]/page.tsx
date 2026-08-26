import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BlogPostDto } from "@paxbook/types";
import { publicFetchOrNull } from "@/lib/api";

async function getPost(slug: string) {
  return publicFetchOrNull<BlogPostDto>(`/public/blog/${slug}`);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? undefined,
    alternates: post.seo?.canonicalUrl ? { canonical: post.seo.canonicalUrl } : undefined,
    openGraph: post.coverImageUrl ? { images: [post.coverImageUrl] } : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? post.seo?.description ?? undefined,
    image: post.coverImageUrl ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    articleSection: post.category ?? undefined,
    author: { "@type": "Organization", name: "Paxbook" },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative flex min-h-[16rem] items-end bg-navy-deep sm:min-h-[20rem]">
        {post.coverImageUrl ? <img src={post.coverImageUrl} alt={post.title} className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-navy-deep/10" />
        <div className="relative mx-auto w-full max-w-3xl px-4 pb-8 sm:px-6 lg:px-8">
          <p className="text-xs text-white/60">
            <Link href="/" className="hover:text-accent">Home</Link> <span className="mx-1">›</span>{" "}
            <Link href="/blog" className="hover:text-accent">Travel Guides</Link>
          </p>
          {post.category ? (
            <span className="mt-3 inline-block w-fit rounded-full bg-accent px-2.5 py-1 text-[0.65rem] font-bold text-navy-deep">{post.category}</span>
          ) : null}
          <h1 className="mt-3 font-display text-2xl text-white sm:text-4xl">{post.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
            {post.publishedAt ? <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span> : null}
            {post.readMinutes ? (
              <>
                <span>·</span>
                <span>{post.readMinutes} min read</span>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">{post.body}</div>
      </article>
    </div>
  );
}
