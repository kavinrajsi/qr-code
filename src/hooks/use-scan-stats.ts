"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface ScanStats {
  totalScans: number;
  scansThisWeek: number;
  scansLastWeek: number;
  deviceBreakdown: { name: string; value: number }[];
  countryBreakdown: { label: string; value: number }[];
  browserBreakdown: { label: string; value: number }[];
  dailyScans: { day: string; scans: number }[];
  locations: { city: string; lng: number; lat: number; size: number }[];
}

// Approximate city coordinates for map markers
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "New York": { lat: 40.7128, lng: -74.006 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  "Chicago": { lat: 41.8781, lng: -87.6298 },
  London: { lat: 51.5074, lng: -0.1276 },
  Paris: { lat: 48.8566, lng: 2.3522 },
  Berlin: { lat: 52.52, lng: 13.405 },
  Tokyo: { lat: 35.6895, lng: 139.6917 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Sydney: { lat: -33.8688, lng: 151.2093 },
  Dubai: { lat: 25.2048, lng: 55.2708 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  Toronto: { lat: 43.6532, lng: -79.3832 },
  Seoul: { lat: 37.5665, lng: 126.978 },
  Lagos: { lat: 6.5244, lng: 3.3792 },
  Cairo: { lat: 30.0444, lng: 31.2357 },
  "Sao Paulo": { lat: -23.5505, lng: -46.6333 },
  Madrid: { lat: 40.4168, lng: -3.7038 },
};

export function useScanStats() {
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's QR code IDs
      const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("id")
        .eq("user_id", user.id);

      if (!qrCodes || qrCodes.length === 0) {
        setStats({
          totalScans: 0,
          scansThisWeek: 0,
          scansLastWeek: 0,
          deviceBreakdown: [],
          countryBreakdown: [],
          browserBreakdown: [],
          dailyScans: [],
          locations: [],
        });
        return;
      }

      const qrIds = qrCodes.map((qr: { id: string }) => qr.id);

      // Fetch recent scans (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: scans } = await supabase
        .from("qr_scans")
        .select("scanned_at, device, browser, country, city")
        .in("qr_id", qrIds)
        .gte("scanned_at", thirtyDaysAgo.toISOString())
        .order("scanned_at", { ascending: false })
        .limit(5000);

      if (!scans) return;

      type Scan = { scanned_at: string; device: string | null; browser: string | null; country: string | null; city: string | null };
      const typedScans = scans as Scan[];

      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(now.getDate() - 14);

      const thisWeek = typedScans.filter((s) => new Date(s.scanned_at) >= sevenDaysAgo);
      const lastWeek = typedScans.filter((s) => {
        const d = new Date(s.scanned_at);
        return d >= fourteenDaysAgo && d < sevenDaysAgo;
      });

      // Device breakdown
      const devices: Record<string, number> = {};
      thisWeek.forEach((s) => {
        const d = s.device || "Unknown";
        devices[d] = (devices[d] || 0) + 1;
      });
      const deviceBreakdown = Object.entries(devices)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));

      // Country breakdown
      const countries: Record<string, number> = {};
      typedScans.forEach((s) => {
        const c = s.country || "Unknown";
        countries[c] = (countries[c] || 0) + 1;
      });
      const countryBreakdown = Object.entries(countries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([label, value]) => ({ label, value }));

      // Browser breakdown
      const browsers: Record<string, number> = {};
      typedScans.forEach((s) => {
        const b = s.browser || "Unknown";
        browsers[b] = (browsers[b] || 0) + 1;
      });
      const browserBreakdown = Object.entries(browsers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([label, value]) => ({ label, value }));

      // Daily scans (last 7 days)
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyScans: { day: string; scans: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayStr = days[d.getDay()];
        const count = thisWeek.filter((s) => {
          const sd = new Date(s.scanned_at);
          return sd.toDateString() === d.toDateString();
        }).length;
        dailyScans.push({ day: dayStr, scans: count });
      }

      // City locations for map
      const cities: Record<string, number> = {};
      typedScans.forEach((s) => {
        if (s.city) cities[s.city] = (cities[s.city] || 0) + 1;
      });
      const locations = Object.entries(cities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([city, count]) => {
          const coords = CITY_COORDS[city];
          return coords
            ? { city, lng: coords.lng, lat: coords.lat, size: Math.max(6, Math.min(count, 20)) }
            : null;
        })
        .filter(Boolean) as ScanStats["locations"];

      setStats({
        totalScans: typedScans.length,
        scansThisWeek: thisWeek.length,
        scansLastWeek: lastWeek.length,
        deviceBreakdown,
        countryBreakdown,
        browserBreakdown,
        dailyScans,
        locations,
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading };
}
