"use client";

import type { QRCodeWithScans } from "@/types";
import { QrCode, ScanLine, MousePointerClick, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  qrCodes: QRCodeWithScans[];
}

export function StatsCards({ qrCodes }: StatsCardsProps) {
  const totalQRs = qrCodes.length;
  const totalScans = qrCodes.reduce((acc, qr) => acc + qr.scan_count, 0);
  const activeQRs = qrCodes.filter((qr) => qr.is_active).length;
  const avgScans = totalQRs > 0 ? Math.round(totalScans / totalQRs) : 0;

  const stats = [
    { title: "Total QR Codes", value: totalQRs, icon: QrCode },
    { title: "Total Scans", value: totalScans, icon: ScanLine },
    { title: "Active", value: activeQRs, icon: MousePointerClick },
    { title: "Avg. Scans", value: avgScans, icon: TrendingUp },
  ];

  return (
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
          <p className="mt-2 text-2xl font-semibold tracking-tight">{stat.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
