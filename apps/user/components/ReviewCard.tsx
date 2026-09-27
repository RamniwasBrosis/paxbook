import { MapPin, Quote } from "lucide-react";
import type { TestimonialDto } from "@paxbook/types";
import { ReviewStars } from "@/components/ReviewStars";
import { VideoTestimonialCard } from "@/components/VideoTestimonialCard";

/**
 * Design 2 testimonial ("Words From the Road"): video testimonials keep their poster card, text
 * ones get the paxbook.in review card — navy quote badge, stars, name, quote, location pill.
 */
export function ReviewCard({ testimonial }: { testimonial: TestimonialDto }) {
  if (testimonial.slug) return <VideoTestimonialCard testimonial={testimonial} />;

  const [name, place] = testimonial.customerName.split(/,\s*/, 2);
  const location = place ?? testimonial.destinationName;

  return (
    <figure className="flex w-80 shrink-0 snap-start flex-col items-center gap-4 rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-card sm:w-96">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-deep text-white">
        <Quote className="h-6 w-6" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="text-xl tracking-[3px]">
        <ReviewStars rating={testimonial.rating} />
      </span>
      <div>
        <p className="text-xs text-ink-muted">Pax Name</p>
        <p className="font-display text-lg font-extrabold text-navy-deep">{name}</p>
      </div>
      <blockquote className="text-[0.95rem] leading-relaxed text-[#3d4b72]">{testimonial.content}</blockquote>
      {location ? (
        <figcaption className="mt-auto inline-flex items-center gap-1.5 rounded-full bg-navy-deep px-4 py-2 text-xs font-bold text-white">
          <MapPin className="h-3.5 w-3.5" strokeWidth={2.25} />
          {location}
        </figcaption>
      ) : null}
    </figure>
  );
}
