"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart } from "recharts";

const chartConfig = {
  scans: {
    label: "Scans",
    color: "var(--color-blue-500)",
  },
} satisfies ChartConfig;

const deviceChartConfig = {
  desktop: { label: "Desktop", color: "var(--color-blue-500)" },
  mobile: { label: "Mobile", color: "var(--color-blue-400)" },
  tablet: { label: "Tablet", color: "var(--color-blue-300)" },
} satisfies ChartConfig;

const DEVICE_COLORS = [
  "var(--color-blue-500)",
  "var(--color-blue-400)",
  "var(--color-blue-300)",
  "var(--color-blue-200)",
];

interface OverviewCardProps {
  scansThisWeek: number;
  scansLastWeek: number;
  dailyScans: { day: string; scans: number }[];
  deviceBreakdown: { name: string; value: number }[];
}

export function OverviewCard({
  scansThisWeek,
  scansLastWeek,
  dailyScans,
  deviceBreakdown,
}: OverviewCardProps) {
  const changePercent =
    scansLastWeek > 0
      ? (((scansThisWeek - scansLastWeek) / scansLastWeek) * 100).toFixed(1)
      : scansThisWeek > 0
      ? "100"
      : "0";
  const isPositive = Number(changePercent) >= 0;

  const totalDeviceScans = deviceBreakdown.reduce((s, d) => s + d.value, 0);
  const deviceData = deviceBreakdown.slice(0, 3).map((d, i) => ({
    name: d.name,
    value: totalDeviceScans > 0 ? Math.round((d.value / totalDeviceScans) * 1000) / 10 : 0,
    fill: DEVICE_COLORS[i] || DEVICE_COLORS[0],
  }));

  return (
    <Card className="bg-card/70 absolute top-4 left-4 z-10 w-60 backdrop-blur-sm">
      <CardHeader>
        <div>
          <p className="text-muted-foreground pb-2 text-[10px] tracking-wider uppercase">
            Scans in last 7 days
          </p>
          <p className="text-3xl leading-none font-semibold">
            {scansThisWeek.toLocaleString()}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {dailyScans.length > 0 && (
          <ChartContainer config={chartConfig} className="aspect-auto h-8 w-full">
            <AreaChart data={dailyScans} margin={{ left: 4, right: 4, top: 4 }}>
              <defs>
                <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-scans)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-scans)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="natural"
                dataKey="scans"
                stroke="var(--color-scans)"
                strokeWidth={1.5}
                fill="url(#scansGradient)"
              />
            </AreaChart>
          </ChartContainer>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-xs">
          {isPositive ? (
            <TrendingUp className="size-3 text-emerald-500" />
          ) : (
            <TrendingDown className="size-3 text-red-500" />
          )}
          <span className={`font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}{changePercent}%
          </span>
          <span className="text-muted-foreground">vs previous 7 days</span>
        </div>

        {deviceData.length > 0 && (
          <div className="border-border/60 mt-4 border-t pt-4">
            <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
              Device category in last 7 days
            </p>

            <ChartContainer
              config={deviceChartConfig}
              className="mx-auto mt-3 aspect-square h-32 w-32"
            >
              <PieChart>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={32}
                  outerRadius={52}
                  strokeWidth={2}
                >
                  {deviceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {deviceData.map((device) => (
                <div key={device.name} className="text-center">
                  <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-[10px] tracking-wide uppercase">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: device.fill }}
                    />
                    {device.name}
                  </p>
                  <p className="text-foreground mt-1 leading-none font-medium tabular-nums">
                    {device.value}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
