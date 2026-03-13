"use client";

import { useState } from "react";
import { createQRCode, type QRGenerateOptions } from "@/lib/qr";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

interface DownloadPanelProps {
  options: QRGenerateOptions;
  name: string;
}

export function DownloadPanel({ options, name }: DownloadPanelProps) {
  const [format, setFormat] = useState<"png" | "jpeg" | "svg">("png");
  const [size, setSize] = useState("1024");

  const handleDownload = async () => {
    if (!options.data) return;

    const sizeNum = parseInt(size);
    const qrCode = createQRCode({
      ...options,
      width: sizeNum,
      height: sizeNum,
    });

    await qrCode.download({
      name: `${name || "qr-code"}-${sizeNum}px`,
      extension: format,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Download</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as "png" | "jpeg" | "svg")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpeg">JPG</SelectItem>
              <SelectItem value="svg">SVG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Resolution</Label>
          <Select value={size} onValueChange={(v) => v && setSize(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="512">512px</SelectItem>
              <SelectItem value="1024">1024px</SelectItem>
              <SelectItem value="2048">2048px</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleDownload} className="w-full" disabled={!options.data}>
        <Download className="mr-2 h-4 w-4" />
        Download QR Code
      </Button>
    </div>
  );
}
