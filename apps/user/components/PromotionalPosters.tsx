import Link from "next/link";
import type { BannerDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";

/** Admin-managed promotional posters (Settings -> CMS -> Banners, placement "homepage_bottom"). Renders nothing at all if there are no active posters — no empty section/space on the homepage. */
export function PromotionalPosters({ posters }: { posters: BannerDto[] }) {
  if (posters.length === 0) return null;

  const sorted = [...posters].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="shell py-16 lg:py-20">
      <SectionHeading eyebrow="Don't miss out" title="Offers & Highlights" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((poster) => {
          const content = (
            <div className="group relative h-64 overflow-hidden rounded-2xl shadow-premium">
              <img
                src={poster.imageUrl}
                alt={poster.title ?? ""}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {poster.title || poster.description || poster.ctaText ? (
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/25 to-transparent p-5">
                  {poster.title ? <h3 className="font-display text-lg font-bold text-white">{poster.title}</h3> : null}
                  {poster.description ? <p className="mt-1 text-sm text-white/80">{poster.description}</p> : null}
                  {poster.ctaText ? (
                    <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-bold text-navy-deep transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-accent-dark">
                      {poster.ctaText}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
          return poster.linkUrl ? (
            <Link key={poster.id} href={poster.linkUrl} className="block">
              {content}
            </Link>
          ) : (
            <div key={poster.id}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}
