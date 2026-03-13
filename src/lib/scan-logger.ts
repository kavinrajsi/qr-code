import { createClient } from "@/lib/supabase/server";
import { UAParser } from "ua-parser-js";

export async function logScan(
  qrId: string,
  headers: Headers
): Promise<void> {
  try {
    const supabase = await createClient();

    const ua = new UAParser(headers.get("user-agent") || "");
    const device = ua.getDevice().type || "desktop";
    const browser = ua.getBrowser().name || "Unknown";
    const os = ua.getOS().name || "Unknown";

    const ip =
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip") ||
      "unknown";

    const country =
      headers.get("x-vercel-ip-country") ||
      headers.get("cf-ipcountry") ||
      null;

    const city = headers.get("x-vercel-ip-city") || null;
    const referrer = headers.get("referer") || null;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("qr_scans")
      .select("id", { count: "exact", head: true })
      .eq("qr_id", qrId)
      .eq("ip", ip)
      .gte("scanned_at", oneDayAgo);

    await supabase.from("qr_scans").insert({
      qr_id: qrId,
      device,
      browser,
      os,
      ip,
      country,
      city,
      referrer,
      is_unique: (count || 0) === 0,
    });
  } catch {
    // Fire-and-forget — don't block the redirect
  }
}
