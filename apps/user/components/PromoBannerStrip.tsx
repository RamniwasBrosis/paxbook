import Link from "next/link";
import type { BannerDto } from "@paxbook/types";
import { ScrollCarousel } from "@/components/ScrollCarousel";

export function PromoBannerStrip({ banners }: { banners: BannerDto[] }) {
  if (banners.length === 0) return null;

  const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="shell py-8">
      <ScrollCarousel>
        {sorted.map((banner) => {
          const image = (
            <img
              src={banner.imageUrl}
              alt=""
              className="h-32 w-full rounded-2xl object-cover shadow-premium transition-transform duration-300 hover:-translate-y-0.5 sm:h-40"
            />
          );
          return (
            <div key={banner.id} className="w-80 shrink-0 snap-start sm:w-[28rem]">
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} className="block">
                  {image}
                </Link>
              ) : (
                image
              )}
            </div>
          );
        })}
      </ScrollCarousel>
    </section>
  );
}
