import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logScan } from "@/lib/scan-logger";

export async function POST(request: NextRequest) {
  try {
    const { qr_id } = await request.json();

    if (!qr_id || typeof qr_id !== "string") {
      return NextResponse.json({ error: "Missing qr_id" }, { status: 400 });
    }

    // Verify the QR code exists before logging
    const supabase = await createClient();
    const { data: qrCode } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("id", qr_id)
      .single();

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    await logScan(qr_id, request.headers);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log scan" }, { status: 500 });
  }
}
