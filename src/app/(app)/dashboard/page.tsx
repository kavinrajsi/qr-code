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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button render={<Link href="/create" />}>
          <Plus className="mr-1 h-4 w-4" />
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
