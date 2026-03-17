import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LandingPageClient } from "./landing-client";
import type { QRCode } from "@/types";

export default async function LandingPage({
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
    .eq("is_active", true)
    .single();

  if (!qrCode) notFound();

  if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">This QR code has expired.</p>
      </div>
    );
  }

  return <LandingPageClient qrCode={qrCode as QRCode} />;
}
