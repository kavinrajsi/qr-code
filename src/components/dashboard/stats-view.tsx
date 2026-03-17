"use client";

import Link from "next/link";
import type { QRCodeWithScans } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  QrCode,
  ScanLine,
  MousePointerClick,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

interface StatsViewProps {
  qrCodes: QRCodeWithScans[];
  loading: boolean;
}

export function StatsView({ qrCodes, loading }: StatsViewProps) {
  const totalQRs = qrCodes.length;
  const totalScans = qrCodes.reduce((acc, qr) => acc + qr.scan_count, 0);
  const activeQRs = qrCodes.filter((qr) => qr.is_active).length;
  const avgScans = totalQRs > 0 ? Math.round(totalScans / totalQRs) : 0;

  const topQRCodes = [...qrCodes]
    .sort((a, b) => b.scan_count - a.scan_count)
    .slice(0, 10);

  const typeBreakdown = qrCodes.reduce<Record<string, number>>((acc, qr) => {
    const type = qr.qr_type || "url";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { title: "Total QR Codes", value: totalQRs, icon: QrCode },
    { title: "Total Scans", value: totalScans, icon: ScanLine },
    { title: "Active", value: activeQRs, icon: MousePointerClick },
    { title: "Avg. Scans", value: avgScans, icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-brand" />
        <h1 className="text-2xl font-semibold tracking-tight">Stats Overview</h1>
      </div>

      {/* Stat Cards */}
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
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top QR Codes by Scans */}
        <div className="rounded-xl border border-border/50 bg-card">
          <div className="p-5 pb-3">
            <h3 className="text-sm font-semibold">Top QR Codes by Scans</h3>
          </div>
          <div className="px-5 pb-5">
            {topQRCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topQRCodes.map((qr, i) => (
                  <div key={qr.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-medium text-muted-foreground w-5 text-right tabular-nums">
                        {i + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{qr.name}</p>
                        <p className="text-xs text-muted-foreground">/{qr.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold tabular-nums">
                        {qr.scan_count.toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        render={<Link href={`/analytics/${qr.id}`} />}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QR Code Types Breakdown */}
        <div className="rounded-xl border border-border/50 bg-card">
          <div className="p-5 pb-3">
            <h3 className="text-sm font-semibold">QR Codes by Type</h3>
          </div>
          <div className="px-5 pb-5">
            {Object.keys(typeBreakdown).length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(typeBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const pct = totalQRs > 0 ? Math.round((count / totalQRs) * 100) : 0;
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm capitalize">{type.replace("_", " ")}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
