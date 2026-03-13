"use client";

import { useState } from "react";
import type { QRCode } from "@/types";
import { QRPreview } from "@/components/qr/qr-preview";
import { DownloadPanel } from "@/components/qr/download-panel";
import { buildQROptionsFromRecord } from "@/lib/qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, Code, Share2, Lock, Loader2 } from "lucide-react";

interface SharePageClientProps {
  qrCode: QRCode;
  hasPassword: boolean;
}

export function SharePageClient({ qrCode, hasPassword }: SharePageClientProps) {
  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(!hasPassword);
  const [verifying, setVerifying] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${appUrl}/share/${qrCode.slug}`;
  const embedCode = `<iframe src="${appUrl}/embed/qr/${qrCode.slug}" width="300" height="300" frameborder="0"></iframe>`;

  const qrOptions = buildQROptionsFromRecord(qrCode, appUrl);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/qr/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: qrCode.slug, password }),
      });

      if (res.ok) {
        setVerified(true);
      } else {
        toast.error("Incorrect password");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Lock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <CardTitle>Password Protected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <Button onClick={handleVerify} className="w-full" disabled={verifying}>
              {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{qrCode.name}</CardTitle>
          {qrCode.description && (
            <p className="text-sm text-muted-foreground">{qrCode.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <QRPreview options={qrOptions} />
          </div>

          <p className="text-center text-sm text-muted-foreground truncate">
            {qrCode.destination_url}
          </p>

          <Separator />

          <DownloadPanel options={qrOptions} name={qrCode.name} />

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Share
            </h3>

            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-sm" />
              <Button variant="outline" size="icon" onClick={() => copy(shareUrl, "Share link")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out ${qrCode.name}`)}`,
                    "_blank"
                  )
                }
              >
                Twitter/X
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                    "_blank"
                  )
                }
              >
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                    "_blank"
                  )
                }
              >
                Facebook
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Code className="h-4 w-4" /> Embed
            </h3>
            <div className="flex gap-2">
              <Input value={embedCode} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copy(embedCode, "Embed code")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
