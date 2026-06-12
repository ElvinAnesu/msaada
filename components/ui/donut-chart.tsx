"use client";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
}

export function DonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <p className="text-sm text-slate-500">No data available</p>;
  }

  let cumulative = 0;
  const gradientStops = data
    .map((segment) => {
      const start = (cumulative / total) * 100;
      cumulative += segment.value;
      const end = (cumulative / total) * 100;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div
        className="relative shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradientStops})`,
        }}
      >
        <div
          className="absolute inset-0 m-auto flex flex-col items-center justify-center rounded-full bg-white"
          style={{ width: size * 0.55, height: size * 0.55 }}
        >
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {data.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="flex-1 capitalize text-slate-700">{segment.label}</span>
            <span className="font-semibold text-slate-900">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
