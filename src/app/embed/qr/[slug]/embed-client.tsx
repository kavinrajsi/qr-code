"use client";

import type { QRCode } from "@/types";
import { QRPreview } from "@/components/qr/qr-preview";
import { buildQROptionsFromRecord } from "@/lib/qr";

interface EmbedClientProps {
  qrCode: QRCode;
}

export function EmbedClient({ qrCode }: EmbedClientProps) {
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrOptions = buildQROptionsFromRecord(qrCode, appUrl);

  return (
    <div className="flex items-center justify-center p-2" style={{ minHeight: "100vh" }}>
      <QRPreview options={qrOptions} />
    </div>
  );
}
