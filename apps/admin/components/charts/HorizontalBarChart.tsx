export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

const DEFAULT_HUE = "#2a78d6";

function formatValue(value: number, formatValue?: (v: number) => string): string {
  return formatValue ? formatValue(value) : value.toLocaleString("en-IN");
}

/**
 * A single-hue (magnitude) or per-item-colored (categorical) horizontal bar list.
 * Mark spec: 20px bars, rounded data-end, square baseline, value at the tip.
 */
export function HorizontalBarChart({
  items,
  valueFormatter,
  emptyMessage = "No data yet.",
}: {
  items: BarChartItem[];
  valueFormatter?: (v: number) => string;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{emptyMessage}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.label} className="group flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs font-medium text-slate-600" title={item.label}>
            {item.label}
          </span>
          <div className="relative flex-1">
            <div
              className="h-5 rounded-r-md transition-[width] duration-500"
              style={{ width: `${Math.max((item.value / max) * 100, 3)}%`, backgroundColor: item.color ?? DEFAULT_HUE }}
            />
          </div>
          <span className="w-20 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-900">
            {formatValue(item.value, valueFormatter)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
