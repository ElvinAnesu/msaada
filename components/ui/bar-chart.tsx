"use client";

import { cn } from "@/lib/utils";

interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartItem[];
  className?: string;
}

export function BarChart({ data, className }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No data available</p>;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="capitalize text-slate-700">{item.label}</span>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full transition-all duration-500", item.color || "bg-primary")}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
