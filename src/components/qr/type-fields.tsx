"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Trash2 } from "lucide-react";
import type {
  QRType,
  QRContentData,
  MultiURLContentData,
  ContactContentData,
  TextContentData,
  AppContentData,
  SMSContentData,
  EmailContentData,
  PhoneContentData,
} from "@/types";

interface TypeFieldsProps {
  type: QRType;
  data: QRContentData;
  onChange: (data: QRContentData) => void;
  onPdfFile?: (file: File | null) => void;
  pdfFileName?: string;
}

export function TypeFields({ type, data, onChange, onPdfFile, pdfFileName }: TypeFieldsProps) {
  switch (type) {
    case "url":
      return <URLFields data={data as { url: string }} onChange={onChange} />;
    case "pdf":
      return <PDFFields onPdfFile={onPdfFile} pdfFileName={pdfFileName} />;
    case "multi_url":
      return <MultiURLFields data={data as MultiURLContentData} onChange={onChange} />;
    case "contact":
      return <ContactFields data={data as ContactContentData} onChange={onChange} />;
    case "text":
      return <TextField data={data as TextContentData} onChange={onChange} />;
    case "app":
      return <AppFields data={data as AppContentData} onChange={onChange} />;
    case "sms":
      return <SMSFields data={data as SMSContentData} onChange={onChange} />;
    case "email":
      return <EmailFields data={data as EmailContentData} onChange={onChange} />;
    case "phone":
      return <PhoneFields data={data as PhoneContentData} onChange={onChange} />;
  }
}

function URLFields({ data, onChange }: { data: { url: string }; onChange: (d: QRContentData) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="url">Destination URL *</Label>
      <Input
        id="url"
        type="url"
        placeholder="https://example.com"
        value={data.url || ""}
        onChange={(e) => onChange({ url: e.target.value })}
      />
    </div>
  );
}

function PDFFields({ onPdfFile, pdfFileName }: { onPdfFile?: (f: File | null) => void; pdfFileName?: string }) {
  return (
    <div className="space-y-2">
      <Label>Upload PDF *</Label>
      {pdfFileName ? (
        <div className="flex items-center gap-3 rounded-md border px-4 py-3">
          <span className="text-sm truncate flex-1">{pdfFileName}</span>
          <Button variant="ghost" size="sm" onClick={() => onPdfFile?.(null)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground hover:bg-muted/50">
          <Upload className="h-4 w-4" />
          Choose PDF file
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPdfFile?.(file);
            }}
          />
        </label>
      )}
    </div>
  );
}

function MultiURLFields({ data, onChange }: { data: MultiURLContentData; onChange: (d: QRContentData) => void }) {
  const urls = data.urls || [{ title: "", url: "" }];

  const updateUrl = (index: number, field: "title" | "url", value: string) => {
    const updated = urls.map((u, i) => (i === index ? { ...u, [field]: value } : u));
    onChange({ urls: updated });
  };

  const addUrl = () => {
    onChange({ urls: [...urls, { title: "", url: "" }] });
  };

  const removeUrl = (index: number) => {
    if (urls.length <= 1) return;
    onChange({ urls: urls.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Label>URLs *</Label>
      {urls.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            placeholder="Link title"
            value={item.title}
            onChange={(e) => updateUrl(i, "title", e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="https://example.com"
            value={item.url}
            onChange={(e) => updateUrl(i, "url", e.target.value)}
            className="flex-1"
          />
          {urls.length > 1 && (
            <Button variant="ghost" size="icon" onClick={() => removeUrl(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addUrl}>
        <Plus className="mr-1 h-4 w-4" />
        Add URL
      </Button>
    </div>
  );
}

function ContactFields({ data, onChange }: { data: ContactContentData; onChange: (d: QRContentData) => void }) {
  const update = (field: keyof ContactContentData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>First Name *</Label>
          <Input
            placeholder="John"
            value={data.first_name || ""}
            onChange={(e) => update("first_name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Last Name *</Label>
          <Input
            placeholder="Doe"
            value={data.last_name || ""}
            onChange={(e) => update("last_name", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            type="tel"
            placeholder="+1 234 567 8900"
            value={data.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="john@example.com"
            value={data.email || ""}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Company</Label>
          <Input
            placeholder="Acme Inc"
            value={data.company || ""}
            onChange={(e) => update("company", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Job Title</Label>
          <Input
            placeholder="Software Engineer"
            value={data.job_title || ""}
            onChange={(e) => update("job_title", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Input
          placeholder="123 Main St, City, Country"
          value={data.address || ""}
          onChange={(e) => update("address", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Website</Label>
        <Input
          type="url"
          placeholder="https://example.com"
          value={data.website || ""}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>
    </div>
  );
}

function TextField({ data, onChange }: { data: TextContentData; onChange: (d: QRContentData) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="text-content">Text Content *</Label>
      <Textarea
        id="text-content"
        placeholder="Enter any text to encode..."
        value={data.text || ""}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={4}
      />
    </div>
  );
}

function AppFields({ data, onChange }: { data: AppContentData; onChange: (d: QRContentData) => void }) {
  const update = (field: keyof AppContentData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>iOS App Store URL</Label>
        <Input
          type="url"
          placeholder="https://apps.apple.com/app/..."
          value={data.ios_url || ""}
          onChange={(e) => update("ios_url", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Google Play Store URL</Label>
        <Input
          type="url"
          placeholder="https://play.google.com/store/apps/..."
          value={data.android_url || ""}
          onChange={(e) => update("android_url", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Fallback URL</Label>
        <Input
          type="url"
          placeholder="https://yourapp.com"
          value={data.fallback_url || ""}
          onChange={(e) => update("fallback_url", e.target.value)}
        />
      </div>
    </div>
  );
}

function SMSFields({ data, onChange }: { data: SMSContentData; onChange: (d: QRContentData) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Phone Number *</Label>
        <Input
          type="tel"
          placeholder="+1 234 567 8900"
          value={data.phone || ""}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Message (optional)</Label>
        <Textarea
          placeholder="Pre-filled SMS message..."
          value={data.message || ""}
          onChange={(e) => onChange({ ...data, message: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}

function EmailFields({ data, onChange }: { data: EmailContentData; onChange: (d: QRContentData) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Email Address *</Label>
        <Input
          type="email"
          placeholder="hello@example.com"
          value={data.address || ""}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Subject (optional)</Label>
        <Input
          placeholder="Email subject line..."
          value={data.subject || ""}
          onChange={(e) => onChange({ ...data, subject: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Body (optional)</Label>
        <Textarea
          placeholder="Pre-filled email body..."
          value={data.body || ""}
          onChange={(e) => onChange({ ...data, body: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}

function PhoneFields({ data, onChange }: { data: PhoneContentData; onChange: (d: QRContentData) => void }) {
  return (
    <div className="space-y-2">
      <Label>Phone Number *</Label>
      <Input
        type="tel"
        placeholder="+1 234 567 8900"
        value={data.phone || ""}
        onChange={(e) => onChange({ phone: e.target.value })}
      />
    </div>
  );
}
