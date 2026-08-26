export function computeDayDate(departureDate: Date, dayNumber: number): Date {
  const d = new Date(departureDate);
  d.setDate(d.getDate() + (dayNumber - 1));
  return d;
}

export function formatDayDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
