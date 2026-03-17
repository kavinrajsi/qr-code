"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/slug";
import { QR_DEFAULTS } from "@/lib/qr";
import { encodeQRContent, FORCE_DYNAMIC_TYPES } from "@/lib/qr-content";
import { buildDestinationUrl } from "@/lib/qr-content";
import type { QRCode, QRCodeFormData, QRType, QRContentData, ContactContentData, DotStyle, CornerStyle, FrameStyle, FrameFont } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { QRPreview } from "./qr-preview";
import { DownloadPanel } from "./download-panel";
import { ColorPicker } from "./color-picker";
import { TypeFields } from "./type-fields";
import { FolderPicker } from "./folder-picker";
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
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

interface QRFormProps {
  existingQR?: QRCode;
}

const QR_TYPES: { value: QRType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: "url", label: "Website URL", description: "Link to any website URL", icon: <Link className="h-5 w-5" /> },
  { value: "pdf", label: "PDF", description: "Share PDF document", icon: <FileText className="h-5 w-5" /> },
  { value: "multi_url", label: "Multiple Links", description: "Share multiple links", icon: <ListOrdered className="h-5 w-5" /> },
  { value: "contact", label: "Profile Card", description: "Personal custom page", icon: <Contact className="h-5 w-5" /> },
  { value: "text", label: "Plain Text", description: "Share text content", icon: <Type className="h-5 w-5" /> },
  { value: "app", label: "App", description: "Download apps Android & iOS", icon: <Smartphone className="h-5 w-5" /> },
  { value: "sms", label: "SMS", description: "Send a text message", icon: <MessageSquare className="h-5 w-5" /> },
  { value: "email", label: "Email", description: "Send an email", icon: <Mail className="h-5 w-5" /> },
  { value: "phone", label: "Phone", description: "Make a phone call", icon: <Phone className="h-5 w-5" /> },
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

const FRAME_STYLES: { value: FrameStyle; label: string }[] = [
  { value: "none", label: "No Frame" },
  { value: "bottom", label: "Bottom" },
  { value: "top", label: "Top" },
  { value: "balloon-bottom", label: "Balloon Bottom" },
  { value: "balloon-top", label: "Balloon Top" },
  { value: "ribbon-bottom", label: "Ribbon Bottom" },
  { value: "ribbon-top", label: "Ribbon Top" },
  { value: "phone", label: "Phone" },
  { value: "cine", label: "Film Strip" },
];

const FRAME_FONTS: { value: FrameFont; label: string }[] = [
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
  { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
  { value: "'Courier New', Courier, monospace", label: "Courier New" },
];

const STEPS = [
  { number: 1, label: "Choose Type" },
  { number: 2, label: "Additional Information" },
  { number: 3, label: "QR Design" },
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
  return { url: qr.destination_url };
}

export function QRForm({ existingQR }: QRFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(existingQR ? 2 : 1);

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
    outer_frame: existingQR?.outer_frame || QR_DEFAULTS.outer_frame,
    frame_label: existingQR?.frame_label || QR_DEFAULTS.frame_label,
    label_font: existingQR?.label_font || QR_DEFAULTS.label_font,
    frame_color: existingQR?.frame_color || QR_DEFAULTS.frame_color,
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
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    (existingQR?.content_data as ContactContentData | undefined)?.profile_image || null
  );
  const profileBlobRef = useRef<string | null>(null);

  const update = (key: keyof QRCodeFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTypeChange = (newType: QRType) => {
    setForm((prev) => ({
      ...prev,
      qr_type: newType,
      content_data: getDefaultContentData(newType),
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
      outerFrame: form.outer_frame,
      frameLabel: form.frame_label,
      labelFont: form.label_font,
      frameColor: form.frame_color,
    }),
    [previewContent, form.qr_type, form.content_data, form.qr_color, form.bg_color, form.dot_style, form.corner_style, form.logo_size, logoPreview, form.outer_frame, form.frame_label, form.label_font, form.frame_color]
  );

  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      if (profileBlobRef.current) URL.revokeObjectURL(profileBlobRef.current);
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

  const handleProfileImage = (file: File | null) => {
    if (profileBlobRef.current) {
      URL.revokeObjectURL(profileBlobRef.current);
      profileBlobRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      profileBlobRef.current = url;
      setProfileImageFile(file);
      setProfileImagePreview(url);
    } else {
      setProfileImageFile(null);
      setProfileImagePreview(null);
    }
  };

  const validateStep2 = (): string | null => {
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

  const handleContinue = () => {
    if (step === 2) {
      const error = validateStep2();
      if (error) {
        toast.error(error);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let logoUrl = existingQR?.logo_url || null;
      let contentData = form.content_data;

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

      // Upload profile image for contact type
      if (form.qr_type === "contact" && profileImageFile) {
        const ext = profileImageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-profile.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(path, profileImageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(path);
        contentData = { ...contentData, profile_image: urlData.publicUrl };
      } else if (form.qr_type === "contact" && profileImagePreview) {
        contentData = { ...contentData, profile_image: profileImagePreview };
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
        outer_frame: form.outer_frame,
        frame_label: form.frame_label,
        label_font: form.label_font,
        frame_color: form.frame_color,
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
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="space-y-4">
        {/* Steps */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            {STEPS.map((s) => (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (s.number < step) setStep(s.number);
                  if (s.number === step + 1 && step === 1) setStep(s.number);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-colors ${
                  s.number === step
                    ? "text-brand"
                    : s.number < step
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-semibold transition-colors shrink-0 ${
                    s.number === step
                      ? "bg-brand text-white"
                      : s.number < step
                      ? "bg-brand/20 text-brand"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.number < step ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : s.number}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Navigation - desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                className="bg-brand hover:bg-brand/90 text-brand-foreground"
                onClick={handleContinue}
              >
                Continue
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="bg-brand hover:bg-brand/90 text-brand-foreground"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingQR ? "Update QR Code" : "Save QR Code"}
              </Button>
            )}
          </div>
        </div>

        {/* Navigation - mobile (full width) */}
        <div className="flex sm:hidden gap-2">
          {step > 1 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground"
              onClick={handleContinue}
            >
              Continue
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingQR ? "Update QR Code" : "Save QR Code"}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left: Step Content */}
        <div>
          {/* Step 1: Choose Type */}
          {step === 1 && (
            <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-6 lg:p-8">
              <h2 className="mb-6 text-xl font-semibold">Choose your QR Code type</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {QR_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      handleTypeChange(t.value);
                      setStep(2);
                    }}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200 ${
                      form.qr_type === t.value
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-border/50 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <span className={`mt-0.5 ${form.qr_type === t.value ? "text-brand" : "text-muted-foreground"}`}>
                      {t.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${form.qr_type === t.value ? "text-brand" : "text-foreground"}`}>
                        {t.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${form.qr_type === t.value ? "text-brand/70" : "text-muted-foreground"}`}>
                        {t.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Additional Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-6 lg:p-8">
                <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-semibold">Additional Information</h2>
                <div className="space-y-4">
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
                    onProfileImage={handleProfileImage}
                    profileImagePreview={profileImagePreview}
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
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-6 lg:p-8">
                <h2 className="mb-4 sm:mb-6 text-lg font-semibold">Advanced Settings</h2>
                <div className="space-y-4">
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
                  <FolderPicker
                    value={form.folder}
                    onChange={(v) => update("folder", v)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: QR Design */}
          {step === 3 && (
            <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-6 lg:p-8">
              <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-semibold">Customize QR Design</h2>
              <div className="space-y-6">
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
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
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

                <Separator />

                {/* Frame */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Frame</Label>
                  <div className="space-y-2">
                    <Label>Frame Style</Label>
                    <Select
                      value={form.outer_frame}
                      onValueChange={(v) => update("outer_frame", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAME_STYLES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {form.outer_frame !== "none" && (
                    <>
                      <div className="space-y-2">
                        <Label>Frame Label</Label>
                        <Input
                          value={form.frame_label}
                          onChange={(e) => update("frame_label", e.target.value)}
                          placeholder="SCAN ME"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Label Font</Label>
                          <Select
                            value={form.label_font}
                            onValueChange={(v) => update("label_font", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FRAME_FONTS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                  <span style={{ fontFamily: f.value }}>{f.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <ColorPicker
                          label="Frame Color"
                          value={form.frame_color}
                          onChange={(v) => update("frame_color", v)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="order-first lg:order-last">
          <div className="lg:sticky lg:top-20 rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="bg-brand px-5 py-3 text-center">
              <p className="text-sm font-medium text-brand-foreground">Preview</p>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex justify-center [&_canvas]:max-w-full [&_canvas]:h-auto">
                <QRPreview options={qrOptions} />
              </div>

              {form.name && (
                <p className="text-center font-medium text-sm">{form.name}</p>
              )}
              {previewContent && (
                <p className="text-center text-xs text-muted-foreground truncate">
                  {previewContent.length > 50
                    ? previewContent.slice(0, 50) + "..."
                    : previewContent}
                </p>
              )}

              <Separator />

              <DownloadPanel options={qrOptions} name={form.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
