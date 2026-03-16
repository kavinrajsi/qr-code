"use client";

import Link from "next/link";
import { useQRCodes } from "@/hooks/use-qr-codes";
import { QRTable } from "@/components/dashboard/qr-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { qrCodes, allQRCodes, loading, search, setSearch, deleteQRCode } = useQRCodes();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and track your QR codes
          </p>
        </div>
        <Button size="sm" render={<Link href="/create" />}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Create QR Code
        </Button>
      </div>

      <StatsCards qrCodes={allQRCodes} />

      <QRTable
        qrCodes={qrCodes}
        loading={loading}
        search={search}
        setSearch={setSearch}
        onDelete={deleteQRCode}
      />
    </div>
  );
}
