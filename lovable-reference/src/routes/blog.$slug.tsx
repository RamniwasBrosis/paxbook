import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Breadcrumbs, PageHero } from "@/components/site/bits";
import { Button } from "@/components/ui/button";
import { blogBySlug, blogs } from "@/data/paxbook";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = blogBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Story unavailable — Paxbook" }, { name: "robots", content: "noindex" }] };
    }
    const b = loaderData.post;
    return {
      meta: [
        { title: `${b.title} — Paxbook` },
        { name: "description", content: b.excerpt },
        { property: "og:title", content: b.title },
        { property: "og:description", content: b.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: BlogDetail,
});

function BlogDetail() {
  const { post } = Route.useLoaderData();
  const more = blogs.filter((b) => b.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageHero
        image={post.image}
        title={post.title}
        text={`${post.category} · ${post.date} · ${post.readTime}`}
        trail={
          <Breadcrumbs
            trail={[{ label: "Home", to: "/" }, { label: "Travel Guides", to: "/blog" }, { label: post.category }]}
          />
        }
      />
      <section className="section-y">
        <div className="shell max-w-3xl">
          <div className="space-y-5 text-[1.02rem] leading-relaxed text-foreground/85">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="mt-10 rounded-3xl border bg-mist p-6">
            <h2 className="text-xl">Want this trip planned for you?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your dates and our travel expert will turn this guide into a costed itinerary.
            </p>
            <Button variant="gold" className="mt-5" asChild>
              <Link to="/ai-planner">Start planning</Link>
            </Button>
          </div>

          <h2 className="mt-14 text-xl">More travel guides</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {more.map((b) => (
              <Link
                key={b.slug}
                to="/blog/$slug"
                params={{ slug: b.slug }}
                className="card-lift overflow-hidden rounded-2xl border bg-card shadow-card"
              >
                <img
                  src={b.image}
                  alt={b.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-32 w-full object-cover"
                />
                <p className="p-4 text-sm font-semibold leading-snug">{b.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
