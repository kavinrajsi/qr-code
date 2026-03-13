import QRCodeStyling, {
  type DotType,
  type CornerSquareType,
} from "qr-code-styling";
import type { DotStyle, CornerStyle, QRCode } from "@/types";

export const QR_DEFAULTS = {
  qr_color: "#000000",
  bg_color: "#FFFFFF",
  dot_style: "square" as DotStyle,
  corner_style: "square" as CornerStyle,
  logo_size: 0.3,
  is_dynamic: true,
} as const;

const DOT_STYLE_MAP: Record<DotStyle, DotType> = {
  square: "square",
  dots: "dots",
  rounded: "rounded",
  "extra-rounded": "extra-rounded",
  classy: "classy",
  "classy-rounded": "classy-rounded",
};

const CORNER_STYLE_MAP: Record<CornerStyle, CornerSquareType> = {
  square: "square",
  dot: "dot",
  "extra-rounded": "extra-rounded",
};

export interface QRGenerateOptions {
  data: string;
  width?: number;
  height?: number;
  qrColor?: string;
  bgColor?: string;
  dotStyle?: DotStyle;
  cornerStyle?: CornerStyle;
  logoUrl?: string;
  logoSize?: number;
}

export function createQRCode(options: QRGenerateOptions): QRCodeStyling {
  const {
    data,
    width = 300,
    height = 300,
    qrColor = QR_DEFAULTS.qr_color,
    bgColor = QR_DEFAULTS.bg_color,
    dotStyle = QR_DEFAULTS.dot_style,
    cornerStyle = QR_DEFAULTS.corner_style,
    logoUrl,
    logoSize = QR_DEFAULTS.logo_size,
  } = options;

  return new QRCodeStyling({
    width,
    height,
    data,
    dotsOptions: {
      color: qrColor,
      type: DOT_STYLE_MAP[dotStyle],
    },
    backgroundOptions: {
      color: bgColor,
    },
    cornersSquareOptions: {
      type: CORNER_STYLE_MAP[cornerStyle],
      color: qrColor,
    },
    cornersDotOptions: {
      color: qrColor,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 4,
      imageSize: logoSize,
    },
    ...(logoUrl ? { image: logoUrl } : {}),
    qrOptions: {
      errorCorrectionLevel: logoUrl ? "H" : "M",
    },
  });
}

export function buildQROptionsFromRecord(
  qrCode: Pick<QRCode, "slug" | "qr_color" | "bg_color" | "dot_style" | "corner_style" | "logo_url" | "logo_size">,
  baseUrl: string
): QRGenerateOptions {
  return {
    data: `${baseUrl}/qr/${qrCode.slug}`,
    width: 300,
    height: 300,
    qrColor: qrCode.qr_color,
    bgColor: qrCode.bg_color,
    dotStyle: qrCode.dot_style,
    cornerStyle: qrCode.corner_style,
    logoUrl: qrCode.logo_url || undefined,
    logoSize: qrCode.logo_size,
  };
}
