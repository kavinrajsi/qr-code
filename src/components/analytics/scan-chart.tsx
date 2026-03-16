"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";

interface ScanChartProps {
  data: { date: string; count: number }[];
}

export function ScanChart({ data }: ScanChartProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card">
      <div className="p-5 pb-0">
        <h3 className="text-sm font-medium">Scans Over Time</h3>
      </div>
      <div className="p-5">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => format(parseISO(v), "MMM d")}
                className="text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                className="text-xs"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                labelFormatter={(v) => format(parseISO(v as string), "MMM d, yyyy")}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                fill="url(#colorScans)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
