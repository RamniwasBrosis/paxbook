import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import type { BlogPostDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Travel Guides" };

const CATEGORIES = ["Travel Guides", "Destinations", "Visa", "Travel Tips", "Honeymoon", "Family Travel", "Adventure"];

export default async function BlogPage({ searchParams }: { searchParams: { category?: string; search?: string } }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.search) params.set("search", searchParams.search);
  const qs = params.toString();
  const posts = await publicFetch<BlogPostDto[]>(`/public/blog${qs ? `?${qs}` : ""}`);

  return (
    <div>
      <PageHero
        breadcrumbs={[{ label: "Travel Guides" }]}
        eyebrow="From the planning desk"
        title="Travel Guides"
        subtitle="Notes from our planning desk — itineraries that actually work, seasons worth paying for, and what to skip."
      />

      <div className="shell py-10">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-0.5 w-8 rounded-full bg-accent" />
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">Latest stories</p>
        </div>
        <h2 className="font-display text-2xl font-bold text-navy-deep sm:text-3xl">Read before you book</h2>

        <form method="get" className="my-6 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm sm:max-w-md">
          <Search className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
          <input
            name="search"
            defaultValue={searchParams.search}
            placeholder="Search articles"
            className="w-full py-1.5 text-sm text-slate-900 focus:outline-none"
          />
          {searchParams.category ? <input type="hidden" name="category" value={searchParams.category} /> : null}
        </form>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/blog" className={`rounded-full px-4 py-1.5 text-sm font-semibold ${!searchParams.category ? "bg-brand text-white" : "bg-mist text-slate-600"}`}>
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/blog?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${searchParams.category === c ? "bg-brand text-white" : "bg-mist text-slate-600"}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {searchParams.search ? (
          <p className="mb-4 text-sm text-slate-500">
            {posts.length} result{posts.length === 1 ? "" : "s"} for &ldquo;{searchParams.search}&rdquo;
          </p>
        ) : null}

        {posts.length === 0 ? (
          <p className="text-slate-500">No articles published yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
              >
                {post.coverImageUrl ? (
                  <img src={post.coverImageUrl} alt={post.title} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-44 w-full bg-mist" />
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {post.category ? (
                    <span className="w-fit rounded-full bg-mist-strong px-2.5 py-1 text-[0.65rem] font-semibold text-brand">{post.category}</span>
                  ) : null}
                  <h3 className="font-display text-base text-navy-deep group-hover:text-brand">{post.title}</h3>
                  {post.excerpt ? <p className="line-clamp-2 text-sm text-slate-500">{post.excerpt}</p> : null}
                  <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
                    {post.publishedAt ? <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span> : null}
                    {post.readMinutes ? (
                      <>
                        <span>·</span>
                        <span>{post.readMinutes} min read</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
