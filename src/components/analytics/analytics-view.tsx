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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{qrCode.name}</h1>
        <p className="text-muted-foreground">{qrCode.destination_url}</p>
        <Badge variant="secondary" className="mt-1">
          /{qrCode.slug}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.top_countries.map((country) => (
                <div key={country.country} className="flex items-center justify-between">
                  <span>{country.country}</span>
                  <Badge variant="outline">{country.count} scans</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
