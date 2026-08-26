import { MarqueeRow } from "@/components/MarqueeRow";

const REPEAT_COUNT = 8;

export function TickerStrip({ text = "#HappyTravelerHappyMemories" }: { text?: string }) {
  const items = Array.from({ length: REPEAT_COUNT }, (_, i) => (
    <span key={i} className="flex items-center gap-8 px-4 text-sm font-extrabold uppercase tracking-widest text-white">
      {text}
      <span className="text-white/50" aria-hidden="true">
        ✦
      </span>
    </span>
  ));

  return (
    <div className="overflow-hidden bg-accent py-3">
      <MarqueeRow durationSeconds={22}>{items}</MarqueeRow>
    </div>
  );
}
