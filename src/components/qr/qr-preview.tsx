"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { createQRCode, type QRGenerateOptions } from "@/lib/qr";

interface QRPreviewProps {
  options: QRGenerateOptions;
  className?: string;
}

export function QRPreview({ options, className }: QRPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current || !options.data) {
      // Clear if data was removed
      if (containerRef.current) containerRef.current.innerHTML = "";
      qrRef.current = null;
      return;
    }

    if (!qrRef.current) {
      qrRef.current = createQRCode(options);
      containerRef.current.innerHTML = "";
      qrRef.current.append(containerRef.current);
    } else {
      qrRef.current.update({
        data: options.data,
        width: options.width,
        height: options.height,
        dotsOptions: { color: options.qrColor, type: options.dotStyle as never },
        backgroundOptions: { color: options.bgColor },
        cornersSquareOptions: { type: options.cornerStyle as never, color: options.qrColor },
        cornersDotOptions: { color: options.qrColor },
        imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: options.logoSize },
        ...(options.logoUrl ? { image: options.logoUrl } : {}),
      });
    }
  }, [options]);

  if (!options.data) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 ${className}`}
        style={{ width: options.width || 300, height: options.height || 300 }}
      >
        <p className="text-sm text-muted-foreground">Enter content to preview</p>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
