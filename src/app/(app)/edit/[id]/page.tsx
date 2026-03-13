import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { QRForm } from "@/components/qr/qr-form";
import type { QRCode } from "@/types";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("qr_codes")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit QR Code</h1>
      <QRForm existingQR={data as QRCode} />
    </div>
  );
}
