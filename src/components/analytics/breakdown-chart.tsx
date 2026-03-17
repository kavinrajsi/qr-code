"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = [
  "oklch(0.65 0.15 250)",
  "oklch(0.60 0.16 200)",
  "oklch(0.65 0.12 160)",
  "oklch(0.60 0.14 300)",
  "oklch(0.70 0.10 80)",
  "oklch(0.55 0.12 30)",
  "oklch(0.60 0.08 120)",
  "oklch(0.50 0.10 350)",
];

interface BreakdownChartProps {
  title: string;
  data: { name: string; value: number }[];
}

export function BreakdownChart({ title, data }: BreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card">
        <div className="p-5 pb-0">
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
          No data yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card">
      <div className="p-5 pb-0">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="p-5">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                dataKey="value"
                strokeWidth={0}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
