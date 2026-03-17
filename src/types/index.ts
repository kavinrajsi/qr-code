export type QRType = "url" | "pdf" | "multi_url" | "contact" | "text" | "app" | "sms" | "email" | "phone";

export interface QRCode {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  qr_type: QRType;
  destination_url: string;
  content_data: QRContentData | null;
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
  outer_frame: FrameStyle;
  frame_label: string;
  label_font: FrameFont;
  frame_color: string;
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

export type FrameStyle =
  | "none"
  | "bottom"
  | "top"
  | "balloon-bottom"
  | "balloon-top"
  | "ribbon-bottom"
  | "ribbon-top"
  | "phone"
  | "cine";

export type FrameFont =
  | "Arial, Helvetica, sans-serif"
  | "'Times New Roman', Times, serif"
  | "'Courier New', Courier, monospace";

// Content data shapes per QR type
export interface URLContentData {
  url: string;
}

export interface PDFContentData {
  file_url: string;
}

export interface MultiURLContentData {
  urls: { title: string; url: string }[];
}

export interface ContactContentData {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  company?: string;
  job_title?: string;
  address?: string;
  website?: string;
}

export interface TextContentData {
  text: string;
}

export interface AppContentData {
  ios_url?: string;
  android_url?: string;
  fallback_url?: string;
}

export interface SMSContentData {
  phone: string;
  message?: string;
}

export interface EmailContentData {
  address: string;
  subject?: string;
  body?: string;
}

export interface PhoneContentData {
  phone: string;
}

export type QRContentData =
  | URLContentData
  | PDFContentData
  | MultiURLContentData
  | ContactContentData
  | TextContentData
  | AppContentData
  | SMSContentData
  | EmailContentData
  | PhoneContentData;

export interface QRCodeFormData {
  name: string;
  qr_type: QRType;
  destination_url: string;
  content_data: QRContentData;
  description: string;
  qr_color: string;
  bg_color: string;
  dot_style: DotStyle;
  corner_style: CornerStyle;
  logo_size: number;
  logo_file: File | null;
  pdf_file: File | null;
  is_dynamic: boolean;
  password: string;
  expires_at: string;
  folder: string;
  outer_frame: FrameStyle;
  frame_label: string;
  label_font: FrameFont;
  frame_color: string;
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
