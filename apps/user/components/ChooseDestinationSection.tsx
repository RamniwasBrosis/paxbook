import Link from "next/link";
import type { DestinationDto } from "@paxbook/types";
import { LockedPrice } from "@/components/LockedPrice";
import { DoorVideo } from "@/components/DoorVideo";

/**
 * Design 2 "Where do you want to go?": the first five featured destinations as arched doors on a
 * sand band, the middle one taller. A destination with an admin-uploaded card video plays it
 * (muted until the visitor taps the speaker). Scrolls sideways on small screens.
 */
export function ChooseDestinationSection({
  destinations,
  priceByDestinationId,
}: {
  destinations: DestinationDto[];
  priceByDestinationId?: Record<string, number>;
}) {
  const doors = destinations.slice(0, 5);
  if (doors.length === 0) return null;
  const middle = Math.floor(doors.length / 2);

  return (
    <section className="bg-sand py-20 lg:py-24">
      <div className="shell">
        <div className="mb-12 text-center">
          <p className="eyebrow text-[0.8rem] tracking-[0.3em]">Choose your destination</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy-deep sm:text-5xl">Where do you want to go?</h2>
          <p className="mt-3 text-lg text-ink-muted">Open the door to your next adventure</p>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory items-end gap-5 overflow-x-auto px-4 pb-4 no-scrollbar lg:mx-0 lg:justify-center lg:overflow-visible lg:px-0">
          {doors.map((d, i) => {
            const tall = i === middle && doors.length >= 3;
            const price = priceByDestinationId?.[d.id];
            return (
              <div key={d.id} className="group flex shrink-0 snap-center flex-col items-center gap-3">
                <span
                  className={`arch block rounded-b-lg bg-sand-frame p-2.5 shadow-[0_22px_40px_-22px_rgba(120,80,20,0.55)] transition-transform duration-300 group-hover:-translate-y-2 ${
                    tall ? "h-[26rem] w-60 lg:h-[28rem] lg:w-64" : "h-80 w-48 lg:h-[23rem] lg:w-52"
                  }`}
                >
                  <span className="arch relative block h-full w-full overflow-hidden rounded-b">
                    {d.cardVideoUrl ? (
                      <DoorVideo src={d.cardVideoUrl} poster={d.heroImageUrl} name={d.name} />
                    ) : d.heroImageUrl ? (
                      <img src={d.heroImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <span className="block h-full w-full bg-brand" />
                    )}
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-navy-deep/75 to-transparent" />
                    {/* The link covers the card; the sound button (z-10) sits above it. */}
                    <Link href={`/destinations/${d.slug}`} className="absolute inset-0 flex flex-col items-center gap-1 px-2 pt-14 text-center text-white">
                      <span className="font-display text-xl font-extrabold uppercase tracking-[0.14em]">{d.name}</span>
                      {d.countryName && d.countryName !== d.name ? (
                        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/90">{d.countryName}</span>
                      ) : null}
                    </Link>
                  </span>
                </span>
                {price ? (
                  <span className="flex items-baseline gap-1.5 text-sm text-ink-muted">
                    from <LockedPrice amount={price} size="sm" asLink={false} colorClassName="text-navy-deep" />
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-ink-muted">Explore</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/destinations"
            className="inline-flex h-12 items-center rounded-full border-2 border-navy-deep px-7 text-sm font-bold text-navy-deep transition-colors hover:bg-navy-deep hover:text-white"
          >
            View all destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
