import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { computeAnalytics } from "@/lib/analytics";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import type { QRCode, QRScan } from "@/types";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch QR code and scans in parallel
  const [{ data: qrCode }, { data: scans }] = await Promise.all([
    supabase
      .from("qr_codes")
      .select("*")
      .eq("id", id)
      .single(),
    supabase
      .from("qr_scans")
      .select("scanned_at, is_unique, country, city, device, browser, os, referrer")
      .eq("qr_id", id)
      .order("scanned_at", { ascending: false })
      .limit(10000),
  ]);

  if (!qrCode) notFound();

  const analytics = computeAnalytics((scans || []) as QRScan[]);

  return <AnalyticsView qrCode={qrCode as QRCode} analytics={analytics} />;
}
