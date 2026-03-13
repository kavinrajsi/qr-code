import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logScan } from "@/lib/scan-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: qrCode } = await supabase
    .from("qr_codes")
    .select("id, destination_url, password, expires_at, is_active")
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

  // Validate destination URL scheme
  try {
    const dest = new URL(qrCode.destination_url);
    if (!["http:", "https:"].includes(dest.protocol)) {
      return new NextResponse("Invalid destination", { status: 400 });
    }
  } catch {
    return new NextResponse("Invalid destination URL", { status: 400 });
  }

  // Log scan directly (fire-and-forget, no self HTTP call)
  void logScan(qrCode.id, request.headers);

  return NextResponse.redirect(qrCode.destination_url);
}
