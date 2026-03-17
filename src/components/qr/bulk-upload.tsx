"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Loader2, FileSpreadsheet, Download } from "lucide-react";

export function BulkUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ name: string; destination_url: string }[]>([]);
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as { name: string; destination_url: string }[];
        const valid = data.filter((row) => row.name && row.destination_url);
        if (valid.length === 0) {
          toast.error("No valid rows found. CSV must have 'name' and 'destination_url' columns.");
          return;
        }
        setPreview(valid);
      },
      error: () => {
        toast.error("Failed to parse CSV");
      },
    });
  };

  const handleBulkCreate = async () => {
    if (preview.length === 0) return;
    setUploading(true);

    try {
      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });

      if (!res.ok) throw new Error("Failed to create QR codes");

      const results = await res.json();
      const errors = results.filter((r: { error?: string }) => r.error);

      if (errors.length > 0) {
        toast.warning(`Created ${results.length - errors.length} QR codes. ${errors.length} failed.`);
      } else {
        toast.success(`Created ${results.length} QR codes!`);
      }

      setPreview([]);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Bulk creation failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Generate
        </CardTitle>
        <CardDescription>
          Upload a CSV with &quot;name&quot; and &quot;destination_url&quot; columns.{" "}
          <a
            href="/sample-bulk-qr.csv"
            download
            className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
          >
            <Download className="h-3 w-3" />
            Download sample CSV
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground hover:bg-muted/50">
          <Upload className="h-4 w-4" />
          {preview.length > 0
            ? `${preview.length} QR codes ready`
            : "Upload CSV file"}
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
        </label>

        {preview.length > 0 && (
          <>
            <div className="max-h-40 overflow-auto rounded border text-sm">
              <table className="w-full">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-left">URL</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1">{row.name}</td>
                      <td className="px-2 py-1 truncate max-w-[200px]">{row.destination_url}</td>
                    </tr>
                  ))}
                  {preview.length > 10 && (
                    <tr className="border-t">
                      <td className="px-2 py-1 text-muted-foreground" colSpan={2}>
                        ...and {preview.length - 10} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Button onClick={handleBulkCreate} disabled={uploading} className="w-full">
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create {preview.length} QR Codes
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
