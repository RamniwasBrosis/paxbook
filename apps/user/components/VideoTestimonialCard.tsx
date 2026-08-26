import Link from "next/link";
import { Play } from "lucide-react";
import type { TestimonialDto } from "@paxbook/types";

export function VideoTestimonialCard({ testimonial }: { testimonial: TestimonialDto }) {
  if (!testimonial.slug) return null;

  return (
    <Link
      href={`/videos/${testimonial.slug}`}
      className="group block w-72 shrink-0 snap-start overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-premium transition-all duration-300 hover:-translate-y-1 sm:w-80"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-navy-deep">
        {testimonial.posterUrl ? (
          <img
            src={testimonial.posterUrl}
            alt={testimonial.customerName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-navy-deep shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" strokeWidth={0} />
          </span>
        </div>
        {testimonial.destinationName ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-bold text-navy-deep">
            {testimonial.destinationName}
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4">
          {testimonial.title ? <p className="text-sm font-bold text-white">{testimonial.title}</p> : null}
          <p className="mt-0.5 text-xs text-white/80">{testimonial.tripTitle ?? testimonial.customerName}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-bold text-navy-deep">{testimonial.customerName}</p>
      </div>
    </Link>
  );
}
