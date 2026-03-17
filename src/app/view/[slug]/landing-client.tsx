"use client";

import type {
  QRCode,
  MultiURLContentData,
  ContactContentData,
  TextContentData,
  AppContentData,
} from "@/types";
import { buildVCard } from "@/lib/qr-content";
import { ExternalLink, Download, Phone, Mail, Building2, Globe, MapPin } from "lucide-react";

export function LandingPageClient({ qrCode }: { qrCode: QRCode }) {
  const data = qrCode.content_data;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-background p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-xl font-bold">{qrCode.name}</h1>
          {qrCode.description && (
            <p className="mt-1 text-sm text-muted-foreground">{qrCode.description}</p>
          )}
        </div>

        {qrCode.qr_type === "multi_url" && data && (
          <MultiURLView data={data as MultiURLContentData} />
        )}
        {qrCode.qr_type === "contact" && data && (
          <ContactView data={data as ContactContentData} />
        )}
        {qrCode.qr_type === "text" && data && (
          <TextView data={data as TextContentData} />
        )}
        {qrCode.qr_type === "app" && data && (
          <AppView data={data as AppContentData} />
        )}
      </div>
    </div>
  );
}

function MultiURLView({ data }: { data: MultiURLContentData }) {
  return (
    <div className="space-y-3">
      {data.urls
        ?.filter((u) => u.url)
        .map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <span className="font-medium">{item.title || item.url}</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        ))}
    </div>
  );
}

function ContactView({ data }: { data: ContactContentData }) {
  const fullName = `${data.first_name} ${data.last_name}`.trim();

  const downloadVCard = () => {
    const vcf = buildVCard(data);
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {data.first_name?.[0]}{data.last_name?.[0]}
        </div>
        <h2 className="mt-3 text-lg font-semibold">{fullName}</h2>
        {data.job_title && <p className="text-sm text-muted-foreground">{data.job_title}</p>}
      </div>

      <div className="space-y-2">
        {data.company && (
          <div className="flex items-center gap-3 rounded-lg border px-4 py-2.5">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{data.company}</span>
          </div>
        )}
        {data.phone && (
          <a href={`tel:${data.phone}`} className="flex items-center gap-3 rounded-lg border px-4 py-2.5 hover:bg-muted/50">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{data.phone}</span>
          </a>
        )}
        {data.email && (
          <a href={`mailto:${data.email}`} className="flex items-center gap-3 rounded-lg border px-4 py-2.5 hover:bg-muted/50">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{data.email}</span>
          </a>
        )}
        {data.website && (
          <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border px-4 py-2.5 hover:bg-muted/50">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{data.website}</span>
          </a>
        )}
        {data.address && (
          <div className="flex items-center gap-3 rounded-lg border px-4 py-2.5">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{data.address}</span>
          </div>
        )}
      </div>

      <button
        onClick={downloadVCard}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Download className="h-4 w-4" />
        Save Contact
      </button>
    </div>
  );
}

function TextView({ data }: { data: TextContentData }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="whitespace-pre-wrap text-sm">{data.text}</p>
    </div>
  );
}

function AppView({ data }: { data: AppContentData }) {
  return (
    <div className="space-y-3">
      {data.ios_url && (
        <a
          href={data.ios_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🍎</span>
            <span className="font-medium">Download on App Store</span>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      )}
      {data.android_url && (
        <a
          href={data.android_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <span className="font-medium">Get it on Google Play</span>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      )}
      {data.fallback_url && (
        <a
          href={data.fallback_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
        >
          <Globe className="h-4 w-4" />
          Visit Website
        </a>
      )}
    </div>
  );
}
