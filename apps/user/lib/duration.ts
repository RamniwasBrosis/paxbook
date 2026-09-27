/** Same colour per duration band as the homepage "How Many Days?" cards (2-3 blue, 4-6 green, 7-10 orange, 10+ violet). */
export function durationBadgeClass(days: number): string {
  if (days <= 3) return "bg-blue-600";
  if (days <= 6) return "bg-green-600";
  if (days <= 10) return "bg-orange-600";
  return "bg-violet-600";
}
