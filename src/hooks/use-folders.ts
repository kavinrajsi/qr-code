"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface FolderInfo {
  name: string;
  count: number;
}

export function useFolders() {
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("qr_codes")
        .select("folder")
        .eq("user_id", user.id)
        .not("folder", "is", null);

      if (data) {
        const counts = new Map<string, number>();
        for (const row of data) {
          const f = row.folder as string;
          counts.set(f, (counts.get(f) || 0) + 1);
        }
        const sorted = Array.from(counts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setFolders(sorted);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const renameFolder = useCallback(
    async (oldName: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed || trimmed === oldName) return false;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("qr_codes")
        .update({ folder: trimmed })
        .eq("user_id", user.id)
        .eq("folder", oldName);

      if (error) return false;
      await fetchFolders();
      return true;
    },
    [supabase, fetchFolders]
  );

  const deleteFolder = useCallback(
    async (name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("qr_codes")
        .update({ folder: null })
        .eq("user_id", user.id)
        .eq("folder", name);

      if (error) return false;
      await fetchFolders();
      return true;
    },
    [supabase, fetchFolders]
  );

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return { folders, loading, refetch: fetchFolders, renameFolder, deleteFolder };
}
