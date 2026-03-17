import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare against self to keep constant time, then return false
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  try {
    const { slug, password } = await request.json();

    if (!slug || !password) {
      return NextResponse.json({ error: "Missing slug or password" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: qrCode } = await supabase
      .from("qr_codes")
      .select("password")
      .eq("slug", slug)
      .single();

    if (!qrCode || !qrCode.password || !safeCompare(qrCode.password, password)) {
      return NextResponse.json({ error: "Invalid slug or password" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
