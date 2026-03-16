import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logScan } from "@/lib/scan-logger";
import { LANDING_PAGE_TYPES } from "@/lib/qr-content";
import type { QRType } from "@/types";

const ALLOWED_PROTOCOLS = ["http:", "https:", "tel:", "sms:", "mailto:"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: qrCode } = await supabase
    .from("qr_codes")
    .select("id, qr_type, destination_url, content_data, password, expires_at, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!qrCode) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
    return new NextResponse("This QR code has expired.", { status: 410 });
  }

  if (qrCode.password) {
    return NextResponse.redirect(
      new URL(`/share/${slug}?verify=true`, request.url)
    );
  }

  // Log scan (fire-and-forget)
  void logScan(qrCode.id, request.headers);

  const qrType: QRType = qrCode.qr_type || "url";

  // Types that need a landing page
  if (LANDING_PAGE_TYPES.includes(qrType)) {
    return NextResponse.redirect(new URL(`/p/${slug}`, request.url));
  }

  // For URL, PDF, phone, sms, email - redirect to destination_url
  const dest = qrCode.destination_url;

  // Validate destination scheme
  try {
    // tel:, sms:, mailto: are valid URI schemes but not full URLs
    // Only validate http/https as URLs
    if (dest.startsWith("http://") || dest.startsWith("https://")) {
      const url = new URL(dest);
      if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
        return new NextResponse("Invalid destination", { status: 400 });
      }
    } else if (!ALLOWED_PROTOCOLS.some((p) => dest.startsWith(p.replace(":", "")))) {
      return new NextResponse("Invalid destination", { status: 400 });
    }
  } catch {
    return new NextResponse("Invalid destination URL", { status: 400 });
  }

  return NextResponse.redirect(dest);
}
