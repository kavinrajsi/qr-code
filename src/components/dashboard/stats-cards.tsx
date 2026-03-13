"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ScanLine, MousePointerClick, TrendingUp } from "lucide-react";
import type { QRCodeWithScans } from "@/types";

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
    { title: "Active QR Codes", value: activeQRs, icon: MousePointerClick },
    { title: "Avg. Scans/QR", value: avgScans, icon: TrendingUp },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
