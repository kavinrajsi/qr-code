export interface QRCode {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  destination_url: string;
  description: string | null;
  qr_color: string;
  bg_color: string;
  logo_url: string | null;
  dot_style: DotStyle;
  corner_style: CornerStyle;
  logo_size: number;
  is_dynamic: boolean;
  is_active: boolean;
  password: string | null;
  expires_at: string | null;
  folder: string | null;
  created_at: string;
  updated_at: string;
}

export interface QRScan {
  id: string;
  qr_id: string;
  scanned_at: string;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  ip: string | null;
  referrer: string | null;
  is_unique: boolean;
}

export type DotStyle = "square" | "dots" | "rounded" | "extra-rounded" | "classy" | "classy-rounded";
export type CornerStyle = "square" | "dot" | "extra-rounded";

export interface QRCodeFormData {
  name: string;
  destination_url: string;
  description: string;
  qr_color: string;
  bg_color: string;
  dot_style: DotStyle;
  corner_style: CornerStyle;
  logo_size: number;
  logo_file: File | null;
  is_dynamic: boolean;
  password: string;
  expires_at: string;
  folder: string;
}

export interface QRAnalytics {
  total_scans: number;
  unique_scans: number;
  scans_today: number;
  top_countries: { country: string; count: number }[];
  device_breakdown: { device: string; count: number }[];
  browser_breakdown: { browser: string; count: number }[];
  daily_scans: { date: string; count: number }[];
}

export interface QRCodeWithScans extends QRCode {
  scan_count: number;
}
