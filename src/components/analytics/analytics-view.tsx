"use client";

import type { QRAnalytics, QRCode } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanChart } from "./scan-chart";
import { BreakdownChart } from "./breakdown-chart";
import { ScanLine, Users, CalendarDays, Globe } from "lucide-react";

interface AnalyticsViewProps {
  qrCode: QRCode;
  analytics: QRAnalytics;
}

export function AnalyticsView({ qrCode, analytics }: AnalyticsViewProps) {
  const stats = [
    { title: "Total Scans", value: analytics.total_scans, icon: ScanLine },
    { title: "Unique Scans", value: analytics.unique_scans, icon: Users },
    { title: "Scans Today", value: analytics.scans_today, icon: CalendarDays },
    {
      title: "Top Country",
      value: analytics.top_countries[0]?.country || "N/A",
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{qrCode.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{qrCode.destination_url}</p>
        <Badge variant="secondary" className="mt-2 text-xs font-normal">
          /{qrCode.slug}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-border"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
              <stat.icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <ScanChart data={analytics.daily_scans} />

      <div className="grid gap-6 md:grid-cols-2">
        <BreakdownChart
          title="Devices"
          data={analytics.device_breakdown.map((d) => ({
            name: d.device,
            value: d.count,
          }))}
        />
        <BreakdownChart
          title="Countries"
          data={analytics.top_countries.map((c) => ({
            name: c.country,
            value: c.count,
          }))}
        />
      </div>

      {analytics.top_countries.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card">
          <div className="p-5 pb-0">
            <h3 className="text-sm font-medium">Top Countries</h3>
          </div>
          <div className="p-5 space-y-3">
            {analytics.top_countries.map((country) => (
              <div key={country.country} className="flex items-center justify-between text-sm">
                <span>{country.country}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{country.count} scans</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
