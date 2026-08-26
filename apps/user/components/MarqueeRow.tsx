import { Children, cloneElement, isValidElement } from "react";

/**
 * Continuous single-line auto-scroll: the item list is rendered twice back-to-back and
 * translated by exactly -50% on an infinite loop, so the seam is invisible as long as
 * both copies are identical. Pauses on hover so the content is actually readable.
 */
export function MarqueeRow({ children, durationSeconds = 32 }: { children: React.ReactNode; durationSeconds?: number }) {
  const items = Children.toArray(children);
  const duplicate = items.map((child, i) =>
    isValidElement(child) ? cloneElement(child, { key: `dup-${i}` }) : child,
  );

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]" style={{ animationDuration: `${durationSeconds}s` }}>
        {items}
        {duplicate}
      </div>
    </div>
  );
}
