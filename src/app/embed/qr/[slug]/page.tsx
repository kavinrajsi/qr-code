import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EmbedClient } from "./embed-client";
import type { QRCode } from "@/types";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: qrCode } = await supabase
    .from("qr_codes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!qrCode) notFound();

  return <EmbedClient qrCode={qrCode as QRCode} />;
}
