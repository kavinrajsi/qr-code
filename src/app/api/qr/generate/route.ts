import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/slug";
import { QR_DEFAULTS } from "@/lib/qr";
import { buildDestinationUrl, FORCE_DYNAMIC_TYPES } from "@/lib/qr-content";
import type { QRType } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const isBulk = Array.isArray(body);
    const items = isBulk ? body : [body];

    if (isBulk && items.length > 100) {
      return NextResponse.json({ error: "Bulk limit is 100 items" }, { status: 400 });
    }

    // Validate and prepare all rows up front
    const validRows = [];
    const errors = [];

    for (const item of items) {
      const qrType: QRType = item.qr_type || "url";

      // For URL type, keep backward compatibility
      const contentData = item.content_data || (qrType === "url" ? { url: item.destination_url } : null);

      if (!item.name) {
        errors.push({ error: "Missing name", input: item });
        continue;
      }

      // Compute destination_url from content_data
      const destinationUrl = item.destination_url || (contentData ? buildDestinationUrl(qrType, contentData) : "");

      if (!destinationUrl && !["multi_url", "contact", "text", "app"].includes(qrType)) {
        errors.push({ error: "Missing content data", input: item });
        continue;
      }

      validRows.push({
        user_id: user.id,
        name: item.name,
        slug: generateSlug(),
        qr_type: qrType,
        destination_url: destinationUrl || "",
        content_data: contentData,
        description: item.description || null,
        qr_color: item.qr_color || QR_DEFAULTS.qr_color,
        bg_color: item.bg_color || QR_DEFAULTS.bg_color,
        dot_style: item.dot_style || QR_DEFAULTS.dot_style,
        corner_style: item.corner_style || QR_DEFAULTS.corner_style,
        logo_size: item.logo_size || QR_DEFAULTS.logo_size,
        is_dynamic: FORCE_DYNAMIC_TYPES.includes(qrType) ? true : (item.is_dynamic ?? QR_DEFAULTS.is_dynamic),
        folder: item.folder || null,
        outer_frame: item.outer_frame || QR_DEFAULTS.outer_frame,
        frame_label: item.frame_label || QR_DEFAULTS.frame_label,
        label_font: item.label_font || QR_DEFAULTS.label_font,
        frame_color: item.frame_color || QR_DEFAULTS.frame_color,
      });
    }

    // Batch insert all valid rows at once
    let inserted: typeof validRows = [];
    if (validRows.length > 0) {
      const { data, error } = await supabase
        .from("qr_codes")
        .insert(validRows)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      inserted = (data || []).map((row) => ({
        ...row,
        qr_url: `/qr/${row.slug}`,
      }));
    }

    const results = [...inserted, ...errors];

    return NextResponse.json(
      isBulk ? results : results[0],
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
