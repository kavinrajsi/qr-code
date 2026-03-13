import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    if (!qrCode) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (qrCode.password !== password) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
