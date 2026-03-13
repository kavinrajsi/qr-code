import type { QRScan, QRAnalytics } from "@/types";
import { format, subDays, isToday } from "date-fns";

export function computeAnalytics(scans: QRScan[]): QRAnalytics {
  let unique_scans = 0;
  let scans_today = 0;
  const countryMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();

  // Initialize daily map with last 30 days (zero-filled)
  const dailyMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    dailyMap.set(format(subDays(new Date(), i), "yyyy-MM-dd"), 0);
  }

  // Single pass over all scans
  for (const s of scans) {
    if (s.is_unique) unique_scans++;
    if (isToday(new Date(s.scanned_at))) scans_today++;

    const country = s.country || "Unknown";
    countryMap.set(country, (countryMap.get(country) || 0) + 1);

    const device = s.device || "Unknown";
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);

    const browser = s.browser || "Unknown";
    browserMap.set(browser, (browserMap.get(browser) || 0) + 1);

    const day = format(new Date(s.scanned_at), "yyyy-MM-dd");
    if (dailyMap.has(day)) {
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
    }
  }

  const sortDesc = <T extends { count: number }>(arr: T[]) =>
    arr.sort((a, b) => b.count - a.count);

  return {
    total_scans: scans.length,
    unique_scans,
    scans_today,
    top_countries: sortDesc(
      Array.from(countryMap, ([country, count]) => ({ country, count }))
    ).slice(0, 10),
    device_breakdown: sortDesc(
      Array.from(deviceMap, ([device, count]) => ({ device, count }))
    ),
    browser_breakdown: sortDesc(
      Array.from(browserMap, ([browser, count]) => ({ browser, count }))
    ),
    daily_scans: Array.from(dailyMap, ([date, count]) => ({ date, count })),
  };
}
