"use client";

import Link from "next/link";
import type { QRCodeWithScans } from "@/types";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map";
import { OverviewCard } from "./overview-card";
import { BreakdownCard } from "./breakdown-card";
import { useScanStats } from "@/hooks/use-scan-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAP_HEIGHT = "38rem";

interface StatsViewProps {
  qrCodes: QRCodeWithScans[];
  loading: boolean;
}

export function StatsView({ qrCodes, loading: qrLoading }: StatsViewProps) {
  const { stats, loading: scanLoading } = useScanStats();

  const loading = qrLoading || scanLoading;

  // Top QR codes breakdown
  const topQRRows = [...qrCodes]
    .sort((a, b) => b.scan_count - a.scan_count)
    .slice(0, 8)
    .map((qr) => ({ label: qr.name, value: qr.scan_count }));

  // QR type breakdown
  const typeMap = qrCodes.reduce<Record<string, number>>((acc, qr) => {
    const type = (qr.qr_type || "url").replace("_", " ");
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const typeRows = Object.entries(typeMap)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }));

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-brand" />
          <h1 className="text-2xl font-semibold tracking-tight">Stats Overview</h1>
        </div>
        <Skeleton className="h-[38rem] rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-brand" />
        <h1 className="text-2xl font-semibold tracking-tight">Stats Overview</h1>
      </div>

      {/* Map Section */}
      <div
        className="relative rounded-xl overflow-hidden border border-border/50"
        style={{ "--map-height": MAP_HEIGHT } as React.CSSProperties}
      >
        <div className="relative h-(--map-height)">
          <Map
            center={[-2, 16]}
            zoom={1.5}
            scrollZoom={false}
            renderWorldCopies={true}
          >
            <MapControls showFullscreen />
            {stats.locations.map((location) => (
              <MapMarker
                key={location.city}
                longitude={location.lng}
                latitude={location.lat}
              >
                <MarkerContent>
                  <div
                    className="rounded-full bg-blue-500/70"
                    style={{
                      width: location.size * 3,
                      height: location.size * 3,
                    }}
                  />
                </MarkerContent>
                <MarkerTooltip
                  offset={20}
                  className="bg-background text-foreground border"
                >
                  <p className="text-muted-foreground font-medium">
                    {location.city}
                  </p>
                  <p className="mt-0.5">{location.size} scans</p>
                </MarkerTooltip>
              </MapMarker>
            ))}
          </Map>
          <div
            className="via-background/30 to-background pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent"
            aria-hidden
          />
          <OverviewCard
            scansThisWeek={stats.scansThisWeek}
            scansLastWeek={stats.scansLastWeek}
            dailyScans={stats.dailyScans}
            deviceBreakdown={stats.deviceBreakdown}
          />
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <BreakdownCard title="Top QR Codes" rows={topQRRows} />
        <BreakdownCard title="Countries" rows={stats.countryBreakdown} />
        <BreakdownCard title="Browsers" rows={stats.browserBreakdown} />
        <BreakdownCard title="QR Code Types" rows={typeRows} />
      </div>
    </div>
  );
}
