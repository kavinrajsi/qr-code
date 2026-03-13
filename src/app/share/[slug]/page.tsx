import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SharePageClient } from "@/components/shared/share-page-client";
import type { QRCode } from "@/types";

export default async function SharePage({
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

  // Strip password from client props — only send whether it's protected
  const { password: _password, ...safeQR } = qrCode as QRCode;
  const hasPassword = !!_password;

  return <SharePageClient qrCode={safeQR as QRCode} hasPassword={hasPassword} />;
}
