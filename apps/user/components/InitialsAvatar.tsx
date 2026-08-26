const PALETTE = ["bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700", "bg-sky-100 text-sky-700", "bg-violet-100 text-violet-700"];

function colorFor(name: string): string {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length] ?? PALETTE[0]!;
}

export function InitialsAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colorFor(name)}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
