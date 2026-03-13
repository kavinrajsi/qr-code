import { NextRequest, NextResponse } from "next/server";
import { logScan } from "@/lib/scan-logger";

export async function POST(request: NextRequest) {
  try {
    const { qr_id } = await request.json();

    if (!qr_id) {
      return NextResponse.json({ error: "Missing qr_id" }, { status: 400 });
    }

    await logScan(qr_id, request.headers);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log scan" }, { status: 500 });
  }
}
