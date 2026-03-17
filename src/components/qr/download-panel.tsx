"use client";

import { useRef, useState } from "react";
import { createQRCode, QR_DEFAULTS, type QRGenerateOptions } from "@/lib/qr";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { QRFrame } from "./qr-frame";

interface DownloadPanelProps {
  options: QRGenerateOptions;
  name: string;
}

export function DownloadPanel({ options, name }: DownloadPanelProps) {
  const [format, setFormat] = useState<"png" | "jpeg" | "svg">("png");
  const [size, setSize] = useState("1024");
  const frameRef = useRef<HTMLDivElement>(null);

  const hasFrame = options.outerFrame && options.outerFrame !== "none";

  const handleDownload = async () => {
    if (!options.data) return;

    const sizeNum = parseInt(size);

    if (hasFrame) {
      // Render frame + QR to canvas
      await downloadWithFrame(options, sizeNum, name, format);
    } else {
      const qrCode = createQRCode({
        ...options,
        width: sizeNum,
        height: sizeNum,
      });

      await qrCode.download({
        name: `${name || "qr-code"}-${sizeNum}px`,
        extension: format,
      });
    }
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

async function downloadWithFrame(
  options: QRGenerateOptions,
  size: number,
  name: string,
  format: "png" | "jpeg" | "svg"
) {
  const frame = options.outerFrame || "none";
  const label = options.frameLabel || QR_DEFAULTS.frame_label;
  const font = options.labelFont || QR_DEFAULTS.label_font;
  const frameColor = options.frameColor || QR_DEFAULTS.frame_color;

  // Generate QR code as blob
  const qrCode = createQRCode({ ...options, width: size, height: size });
  const qrRaw = await qrCode.getRawData("png");
  if (!qrRaw) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrBlob = qrRaw instanceof Blob ? qrRaw : new Blob([qrRaw as any], { type: "image/png" });

  const qrImg = await loadImage(URL.createObjectURL(qrBlob));

  // Calculate frame dimensions
  const padding = Math.round(size * 0.06);
  const labelHeight = Math.round(size * 0.1);
  const isVerticalFrame = ["bottom", "top", "balloon-bottom", "balloon-top", "ribbon-bottom", "ribbon-top"].includes(frame);
  const isPhone = frame === "phone";
  const isCine = frame === "cine";

  let canvasW = size;
  let canvasH = size;
  let qrX = 0;
  let qrY = 0;

  if (isVerticalFrame) {
    canvasH = size + labelHeight + padding;
    qrX = 0;
    qrY = frame.includes("top") ? labelHeight + padding : 0;
  } else if (isPhone) {
    canvasW = size + padding * 2;
    canvasH = size + padding * 2 + labelHeight;
    qrX = padding;
    qrY = padding;
  } else if (isCine) {
    canvasW = size + padding * 4;
    canvasH = size + padding + labelHeight;
    qrX = padding * 2;
    qrY = 0;
  }

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;

  // White background for jpeg
  if (format === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  const textColor = getContrastColor(frameColor);
  const fontSize = Math.round(size * 0.045);

  if (isPhone) {
    // Phone frame background
    const r = Math.round(size * 0.12);
    roundRect(ctx, 0, 0, canvasW, canvasH, r);
    ctx.fillStyle = frameColor;
    ctx.fill();

    // Inner white area
    const ir = Math.round(size * 0.08);
    roundRect(ctx, padding - 2, padding - 2, size + 4, size + 4, ir);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // QR
    ctx.drawImage(qrImg, qrX, qrY, size, size);

    // Label
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(label, canvasW / 2, qrY + size + padding + fontSize);
  } else if (isCine) {
    // Film strip background
    ctx.fillStyle = frameColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Film holes
    const holeW = Math.round(padding * 0.8);
    const holeH = Math.round(size * 0.06);
    const holeCount = 6;
    for (let i = 0; i < holeCount; i++) {
      const y = Math.round((i + 0.5) * (size / holeCount)) - holeH / 2;
      ctx.fillStyle = textColor + "66";
      roundRect(ctx, padding * 0.6, y, holeW, holeH, 2);
      ctx.fill();
      roundRect(ctx, canvasW - padding * 0.6 - holeW, y, holeW, holeH, 2);
      ctx.fill();
    }

    // QR
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(qrX, qrY, size, size);
    ctx.drawImage(qrImg, qrX, qrY, size, size);

    // Label
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(label, canvasW / 2, size + fontSize + padding * 0.3);
  } else if (frame === "bottom" || frame === "top") {
    // QR
    ctx.drawImage(qrImg, qrX, qrY, size, size);

    // Bar
    const barY = frame === "top" ? 0 : size;
    const r = Math.round(size * 0.02);
    roundRect(ctx, 0, barY, size, labelHeight + padding, r);
    ctx.fillStyle = frameColor;
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(label, size / 2, barY + (labelHeight + padding) / 2 + fontSize / 3);
  } else if (frame.includes("balloon")) {
    // QR
    ctx.drawImage(qrImg, qrX, qrY, size, size);

    // Balloon pill
    const pillW = Math.min(size * 0.7, ctx.measureText(label).width + padding * 3);
    ctx.font = `bold ${fontSize}px ${font}`;
    const measuredW = ctx.measureText(label).width + padding * 2;
    const pillH = labelHeight;
    const pillX = (size - measuredW) / 2;
    const isTop2 = frame === "balloon-top";
    const pillY = isTop2 ? 0 : size + padding * 0.5;

    roundRect(ctx, pillX, pillY, measuredW, pillH, pillH / 2);
    ctx.fillStyle = frameColor;
    ctx.fill();

    // Triangle
    const triSize = Math.round(size * 0.03);
    const triY = isTop2 ? pillY + pillH : pillY;
    ctx.beginPath();
    if (isTop2) {
      ctx.moveTo(size / 2 - triSize, triY);
      ctx.lineTo(size / 2, triY + triSize);
      ctx.lineTo(size / 2 + triSize, triY);
    } else {
      ctx.moveTo(size / 2 - triSize, triY);
      ctx.lineTo(size / 2, triY - triSize);
      ctx.lineTo(size / 2 + triSize, triY);
    }
    ctx.fillStyle = frameColor;
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(label, size / 2, pillY + pillH / 2 + fontSize / 3);
  } else if (frame.includes("ribbon")) {
    // QR
    ctx.drawImage(qrImg, qrX, qrY, size, size);

    // Ribbon
    const ribbonH = labelHeight;
    const isTop2 = frame === "ribbon-top";
    const ribbonY = isTop2 ? 0 : size + padding * 0.3;
    const notchW = Math.round(size * 0.04);

    ctx.fillStyle = frameColor;
    ctx.beginPath();
    ctx.moveTo(notchW, ribbonY);
    ctx.lineTo(size - notchW, ribbonY);
    ctx.lineTo(size, ribbonY + ribbonH / 2);
    ctx.lineTo(size - notchW, ribbonY + ribbonH);
    ctx.lineTo(notchW, ribbonY + ribbonH);
    ctx.lineTo(0, ribbonY + ribbonH / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(label, size / 2, ribbonY + ribbonH / 2 + fontSize / 3);
  }

  // Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "qr-code"}-${size}px.${format === "jpeg" ? "jpg" : format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, format === "jpeg" ? "image/jpeg" : "image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function getContrastColor(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
