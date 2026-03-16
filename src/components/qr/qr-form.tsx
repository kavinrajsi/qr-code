"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/slug";
import { QR_DEFAULTS } from "@/lib/qr";
import { encodeQRContent, FORCE_DYNAMIC_TYPES } from "@/lib/qr-content";
import { buildDestinationUrl } from "@/lib/qr-content";
import type { QRCode, QRCodeFormData, QRType, QRContentData, DotStyle, CornerStyle } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QRPreview } from "./qr-preview";
import { DownloadPanel } from "./download-panel";
import { ColorPicker } from "./color-picker";
import { TypeFields } from "./type-fields";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  X,
  Link,
  FileText,
  ListOrdered,
  Contact,
  Type,
  Smartphone,
  MessageSquare,
  Mail,
  Phone,
} from "lucide-react";

interface QRFormProps {
  existingQR?: QRCode;
}

const QR_TYPES: { value: QRType; label: string; icon: React.ReactNode }[] = [
  { value: "url", label: "URL", icon: <Link className="h-4 w-4" /> },
  { value: "pdf", label: "PDF", icon: <FileText className="h-4 w-4" /> },
  { value: "multi_url", label: "Multi-URL", icon: <ListOrdered className="h-4 w-4" /> },
  { value: "contact", label: "Contact", icon: <Contact className="h-4 w-4" /> },
  { value: "text", label: "Plain Text", icon: <Type className="h-4 w-4" /> },
  { value: "app", label: "App", icon: <Smartphone className="h-4 w-4" /> },
  { value: "sms", label: "SMS", icon: <MessageSquare className="h-4 w-4" /> },
  { value: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { value: "phone", label: "Phone", icon: <Phone className="h-4 w-4" /> },
];

const DOT_STYLES: { value: DotStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots" },
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
];

const CORNER_STYLES: { value: CornerStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "extra-rounded", label: "Rounded" },
];

function getDefaultContentData(type: QRType): QRContentData {
  switch (type) {
    case "url": return { url: "" };
    case "pdf": return { file_url: "" };
    case "multi_url": return { urls: [{ title: "", url: "" }] };
    case "contact": return { first_name: "", last_name: "" };
    case "text": return { text: "" };
    case "app": return { ios_url: "", android_url: "", fallback_url: "" };
    case "sms": return { phone: "" };
    case "email": return { address: "" };
    case "phone": return { phone: "" };
  }
}

function getInitialContentData(qr: QRCode): QRContentData {
  if (qr.content_data) return qr.content_data;
  // Backward compatibility: existing URL-type QR codes
  return { url: qr.destination_url };
}

export function QRForm({ existingQR }: QRFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<QRCodeFormData>({
    name: existingQR?.name || "",
    qr_type: existingQR?.qr_type || "url",
    destination_url: existingQR?.destination_url || "",
    content_data: existingQR ? getInitialContentData(existingQR) : { url: "" },
    description: existingQR?.description || "",
    qr_color: existingQR?.qr_color || QR_DEFAULTS.qr_color,
    bg_color: existingQR?.bg_color || QR_DEFAULTS.bg_color,
    dot_style: existingQR?.dot_style || QR_DEFAULTS.dot_style,
    corner_style: existingQR?.corner_style || QR_DEFAULTS.corner_style,
    logo_size: existingQR?.logo_size || QR_DEFAULTS.logo_size,
    logo_file: null,
    pdf_file: null,
    is_dynamic: existingQR?.is_dynamic ?? QR_DEFAULTS.is_dynamic,
    password: existingQR?.password || "",
    expires_at: existingQR?.expires_at
      ? new Date(existingQR.expires_at).toISOString().slice(0, 16)
      : "",
    folder: existingQR?.folder || "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(
    existingQR?.logo_url || null
  );
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);

  const update = (key: keyof QRCodeFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTypeChange = (newType: QRType) => {
    setForm((prev) => ({
      ...prev,
      qr_type: newType,
      content_data: getDefaultContentData(newType),
      // Force dynamic for types that need landing pages
      is_dynamic: FORCE_DYNAMIC_TYPES.includes(newType) ? true : prev.is_dynamic,
    }));
    setPdfFileName(null);
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const slug = existingQR?.slug || "";

  const previewContent = useMemo(() => {
    const encoded = encodeQRContent(form.qr_type, form.content_data);
    if (!encoded) return "";
    if (form.is_dynamic && slug) {
      return `${appUrl}/qr/${slug}`;
    }
    return encoded;
  }, [form.qr_type, form.content_data, form.is_dynamic, slug, appUrl]);

  const qrOptions = useMemo(
    () => ({
      data: previewContent || encodeQRContent(form.qr_type, form.content_data),
      width: 300,
      height: 300,
      qrColor: form.qr_color,
      bgColor: form.bg_color,
      dotStyle: form.dot_style,
      cornerStyle: form.corner_style,
      logoUrl: logoPreview || undefined,
      logoSize: form.logo_size,
    }),
    [previewContent, form.qr_type, form.content_data, form.qr_color, form.bg_color, form.dot_style, form.corner_style, form.logo_size, logoPreview]
  );

  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    update("logo_file", file);
    setLogoPreview(url);
  };

  const removeLogo = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    update("logo_file", null);
    setLogoPreview(null);
  };

  const handlePdfFile = (file: File | null) => {
    update("pdf_file", file);
    setPdfFileName(file?.name || null);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Please enter a QR code name";

    switch (form.qr_type) {
      case "url":
        if (!(form.content_data as { url: string }).url?.trim()) return "Please enter a destination URL";
        break;
      case "pdf":
        if (!form.pdf_file && !existingQR?.content_data) return "Please upload a PDF file";
        break;
      case "multi_url": {
        const urls = (form.content_data as { urls: { title: string; url: string }[] }).urls;
        if (!urls?.some((u) => u.url.trim())) return "Please add at least one URL";
        break;
      }
      case "contact": {
        const c = form.content_data as { first_name: string; last_name: string };
        if (!c.first_name?.trim() || !c.last_name?.trim()) return "Please enter first and last name";
        break;
      }
      case "text":
        if (!(form.content_data as { text: string }).text?.trim()) return "Please enter text content";
        break;
      case "app": {
        const a = form.content_data as { ios_url?: string; android_url?: string };
        if (!a.ios_url?.trim() && !a.android_url?.trim()) return "Please enter at least one app store URL";
        break;
      }
      case "sms":
      case "phone":
        if (!(form.content_data as { phone: string }).phone?.trim()) return "Please enter a phone number";
        break;
      case "email":
        if (!(form.content_data as { address: string }).address?.trim()) return "Please enter an email address";
        break;
    }
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let logoUrl = existingQR?.logo_url || null;
      let contentData = form.content_data;

      // Upload logo if new file
      if (form.logo_file) {
        const ext = form.logo_file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("qr-logos")
          .upload(path, form.logo_file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("qr-logos")
          .getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      } else if (!logoPreview) {
        logoUrl = null;
      }

      // Upload PDF if applicable
      if (form.qr_type === "pdf" && form.pdf_file) {
        const path = `${user.id}/${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("qr-pdfs")
          .upload(path, form.pdf_file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("qr-pdfs")
          .getPublicUrl(path);
        contentData = { file_url: urlData.publicUrl };
      }

      const destinationUrl = buildDestinationUrl(form.qr_type, contentData);

      const qrData = {
        user_id: user.id,
        name: form.name,
        qr_type: form.qr_type,
        destination_url: destinationUrl,
        content_data: contentData,
        description: form.description || null,
        qr_color: form.qr_color,
        bg_color: form.bg_color,
        dot_style: form.dot_style,
        corner_style: form.corner_style,
        logo_url: logoUrl,
        logo_size: form.logo_size,
        is_dynamic: FORCE_DYNAMIC_TYPES.includes(form.qr_type) ? true : form.is_dynamic,
        password: form.password || null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        folder: form.folder || null,
      };

      if (existingQR) {
        const { error } = await supabase
          .from("qr_codes")
          .update(qrData)
          .eq("id", existingQR.id);

        if (error) throw error;
        toast.success("QR code updated!");
      } else {
        const newSlug = generateSlug();
        const { error } = await supabase.from("qr_codes").insert({
          ...qrData,
          slug: newSlug,
        });

        if (error) throw error;
        toast.success("QR code created!");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save QR code");
    } finally {
      setSaving(false);
    }
  };

  const isDynamicForced = FORCE_DYNAMIC_TYPES.includes(form.qr_type);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Left: Settings */}
      <div className="space-y-6">
        {/* Type Selector */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">QR Code Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
              {QR_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 transition-all duration-200 ${
                    form.qr_type === t.value
                      ? "border-foreground/20 bg-foreground/5 text-foreground"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {t.icon}
                  <span className="text-[11px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Fields */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">QR Code Name *</Label>
              <Input
                id="name"
                placeholder="My QR Code"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <TypeFields
              type={form.qr_type}
              data={form.content_data}
              onChange={(d) => update("content_data", d)}
              onPdfFile={handlePdfFile}
              pdfFileName={pdfFileName || undefined}
            />

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="dynamic"
                checked={form.is_dynamic}
                onCheckedChange={(v) => update("is_dynamic", v)}
                disabled={isDynamicForced}
              />
              <Label htmlFor="dynamic" className={isDynamicForced ? "text-muted-foreground" : ""}>
                Dynamic QR Code (editable destination)
                {isDynamicForced && <span className="ml-1 text-xs">(required for this type)</span>}
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="QR Color"
                value={form.qr_color}
                onChange={(v) => update("qr_color", v)}
              />
              <ColorPicker
                label="Background"
                value={form.bg_color}
                onChange={(v) => update("bg_color", v)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dot Style</Label>
                <Select
                  value={form.dot_style}
                  onValueChange={(v) => update("dot_style", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOT_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Corner Style</Label>
                <Select
                  value={form.corner_style}
                  onValueChange={(v) => update("corner_style", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CORNER_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Logo</Label>
              {logoPreview ? (
                <div className="flex items-center gap-3">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-12 w-12 rounded border object-contain"
                  />
                  <Button variant="ghost" size="sm" onClick={removeLogo}>
                    <X className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50">
                    <Upload className="h-4 w-4" />
                    Upload logo image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              )}
            </div>

            {logoPreview && (
              <div className="space-y-2">
                <Label>
                  Logo Size: {Math.round(form.logo_size * 100)}%
                </Label>
                <Slider
                  value={form.logo_size}
                  onValueChange={(v) => update("logo_size", Array.isArray(v) ? v[0] : v)}
                  min={0.1}
                  max={0.5}
                  step={0.05}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Advanced</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password Protection (optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave empty for no password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">Expiration Date (optional)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => update("expires_at", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder">Folder (optional)</Label>
              <Input
                id="folder"
                placeholder="e.g. Marketing"
                value={form.folder}
                onChange={(e) => update("folder", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Preview & Download */}
      <div className="space-y-6">
        <Card className="sticky top-20 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <QRPreview options={qrOptions} />
            </div>

            {form.name && (
              <p className="text-center font-medium">{form.name}</p>
            )}
            {previewContent && (
              <p className="text-center text-sm text-muted-foreground truncate">
                {previewContent.length > 60
                  ? previewContent.slice(0, 60) + "..."
                  : previewContent}
              </p>
            )}

            <Separator />

            <DownloadPanel options={qrOptions} name={form.name} />

            <Separator />

            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingQR ? "Update QR Code" : "Save QR Code"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
