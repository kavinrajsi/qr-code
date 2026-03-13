"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { QRCodeWithScans } from "@/types";
import { toast } from "sonner";

export function useQRCodes() {
  const [qrCodes, setQRCodes] = useState<QRCodeWithScans[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const fetchQRCodes = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("qr_codes")
        .select("*, qr_scans(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const codes = data.map((qr: Record<string, unknown>) => ({
          ...qr,
          scan_count: (qr.qr_scans as unknown as { count: number }[])?.[0]?.count || 0,
        }));
        setQRCodes(codes);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  const filtered = useMemo(() => {
    const lc = search.toLowerCase();
    return qrCodes.filter(
      (qr) =>
        qr.name.toLowerCase().includes(lc) ||
        qr.destination_url.toLowerCase().includes(lc)
    );
  }, [qrCodes, search]);

  const deleteQRCode = async (id: string) => {
    const { error } = await supabase.from("qr_codes").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete QR code");
      return;
    }
    setQRCodes((prev) => prev.filter((qr) => qr.id !== id));
  };

  return {
    qrCodes: filtered,
    allQRCodes: qrCodes,
    loading,
    search,
    setSearch,
    deleteQRCode,
    refetch: fetchQRCodes,
  };
}
