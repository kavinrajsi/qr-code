"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQRCodes } from "@/hooks/use-qr-codes";
import { QRTable } from "@/components/dashboard/qr-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatsView } from "@/components/dashboard/stats-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle, Search } from "lucide-react";
import { useState } from "react";

export function DashboardContent() {
  const { qrCodes, allQRCodes, loading, search, setSearch, deleteQRCode } = useQRCodes();
  const [sort, setSort] = useState("newest");
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  const sorted = [...qrCodes].sort((a, b) => {
    if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === "most-scans") return b.scan_count - a.scan_count;
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const activeCount = allQRCodes.filter((qr) => qr.is_active).length;

  // Stats View
  if (view === "stats") {
    return <StatsView qrCodes={allQRCodes} loading={loading} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-brand" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Active QR Codes ({activeCount})
        </h1>
      </div>

      {/* Stats */}
      <StatsCards qrCodes={allQRCodes} />

      {/* Toolbar: Search + Sort + Create */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search QR Code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="default"
            className="bg-brand hover:bg-brand/90 text-brand-foreground"
            onClick={() => {/* search is already reactive */}}
          >
            Search
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => v && setSort(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Last Created</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-scans">Most Scans</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-brand hover:bg-brand/90 text-brand-foreground"
            render={<Link href="/create" />}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create QR Code
          </Button>
        </div>
      </div>

      {/* Table or Empty State */}
      {!loading && sorted.length === 0 && !search ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-20">
          <h2 className="text-2xl font-semibold text-center">
            Create amazing QR Codes with our API
          </h2>
          <p className="mt-3 text-muted-foreground text-center max-w-lg">
            Generate unlimited QR codes and keep track of how many people scan them,
            from where and on what date
          </p>
          <Button
            className="mt-6 bg-brand hover:bg-brand/90 text-brand-foreground"
            size="lg"
            render={<Link href="/create" />}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create QR Codes
          </Button>
        </div>
      ) : (
        <QRTable
          qrCodes={sorted}
          loading={loading}
          search={search}
          setSearch={setSearch}
          onDelete={deleteQRCode}
        />
      )}
    </div>
  );
}
