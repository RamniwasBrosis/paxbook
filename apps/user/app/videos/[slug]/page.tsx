import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { TestimonialDto } from "@paxbook/types";
import { publicFetchOrNull } from "@/lib/api";
import { ReviewStars } from "@/components/ReviewStars";

async function getTestimonial(slug: string) {
  return publicFetchOrNull<TestimonialDto>(`/public/videos/${slug}`);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const t = await getTestimonial(params.slug);
  if (!t) return {};
  return {
    title: t.title ?? `${t.customerName}'s Trip Story`,
    description: t.content.slice(0, 160),
    openGraph: t.posterUrl ? { images: [t.posterUrl] } : undefined,
  };
}

export default async function VideoTestimonialPage({ params }: { params: { slug: string } }) {
  const t = await getTestimonial(params.slug);
  if (!t) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: t.title ?? `${t.customerName}'s Trip Story`,
    description: t.content,
    thumbnailUrl: t.posterUrl ?? undefined,
    contentUrl: t.videoUrl ?? undefined,
    uploadDate: t.publishedAt ?? t.createdAt,
    duration: t.durationSeconds ? `PT${t.durationSeconds}S` : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-brand">Home</Link> <span className="mx-1">›</span>{" "}
        <span>Stories of our travellers</span>
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-3xl bg-black shadow-premium">
          {t.videoUrl ? (
            <video controls poster={t.posterUrl ?? undefined} className="aspect-video w-full" preload="metadata">
              <source src={t.videoUrl} />
            </video>
          ) : (
            <div className="flex aspect-video items-center justify-center text-sm text-white/60">Video unavailable</div>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium">
          {t.title ? <h1 className="font-display text-xl text-navy-deep">{t.title}</h1> : null}
          <p className="mt-1 text-sm font-semibold text-slate-700">{t.customerName}</p>
          {t.tripTitle ? <p className="mt-1 text-sm text-slate-500">{t.tripTitle}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {t.destinationName ? (
              <span className="inline-block rounded-full bg-mist-strong px-3 py-1 text-xs font-semibold text-slate-600">{t.destinationName}</span>
            ) : null}
            {t.durationSeconds ? (
              <span className="inline-block rounded-full bg-mist-strong px-3 py-1 text-xs font-semibold text-slate-600">
                {Math.floor(t.durationSeconds / 60)}:{String(t.durationSeconds % 60).padStart(2, "0")}
              </span>
            ) : null}
          </div>
          <div className="mt-4">
            <ReviewStars rating={t.rating} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">&ldquo;{t.content}&rdquo;</p>
          {t.testimonialDate ? (
            <p className="mt-4 text-xs text-slate-400">
              {new Date(t.testimonialDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          ) : null}
          {t.packageTitle ? (
            <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
              Trip featured: <span className="font-semibold text-slate-700">{t.packageTitle}</span>
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
