"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/slug";
import { QR_DEFAULTS } from "@/lib/qr";
import type { QRCode, QRCodeFormData, DotStyle, CornerStyle } from "@/types";
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
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

interface QRFormProps {
  existingQR?: QRCode;
}

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

export function QRForm({ existingQR }: QRFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<QRCodeFormData>({
    name: existingQR?.name || "",
    destination_url: existingQR?.destination_url || "",
    description: existingQR?.description || "",
    qr_color: existingQR?.qr_color || QR_DEFAULTS.qr_color,
    bg_color: existingQR?.bg_color || QR_DEFAULTS.bg_color,
    dot_style: existingQR?.dot_style || QR_DEFAULTS.dot_style,
    corner_style: existingQR?.corner_style || QR_DEFAULTS.corner_style,
    logo_size: existingQR?.logo_size || QR_DEFAULTS.logo_size,
    logo_file: null,
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

  const update = (key: keyof QRCodeFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const slug = existingQR?.slug || "";

  const previewData = useMemo(() => {
    if (!form.destination_url) return "";
    if (form.is_dynamic && slug) {
      return `${appUrl}/qr/${slug}`;
    }
    return form.destination_url;
  }, [form.destination_url, form.is_dynamic, slug, appUrl]);

  const qrOptions = useMemo(
    () => ({
      data: previewData || form.destination_url,
      width: 300,
      height: 300,
      qrColor: form.qr_color,
      bgColor: form.bg_color,
      dotStyle: form.dot_style,
      cornerStyle: form.corner_style,
      logoUrl: logoPreview || undefined,
      logoSize: form.logo_size,
    }),
    [previewData, form.destination_url, form.qr_color, form.bg_color, form.dot_style, form.corner_style, form.logo_size, logoPreview]
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

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter a QR code name");
      return;
    }
    if (!form.destination_url.trim()) {
      toast.error("Please enter a destination URL");
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let logoUrl = existingQR?.logo_url || null;

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

      const qrData = {
        user_id: user.id,
        name: form.name,
        destination_url: form.destination_url,
        description: form.description || null,
        qr_color: form.qr_color,
        bg_color: form.bg_color,
        dot_style: form.dot_style,
        corner_style: form.corner_style,
        logo_url: logoUrl,
        logo_size: form.logo_size,
        is_dynamic: form.is_dynamic,
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Left: Settings */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">QR Code Name *</Label>
              <Input
                id="name"
                placeholder="My Website QR"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Destination URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={form.destination_url}
                onChange={(e) => update("destination_url", e.target.value)}
              />
            </div>
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
              />
              <Label htmlFor="dynamic">Dynamic QR Code (editable destination)</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customization</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Advanced</CardTitle>
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
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <QRPreview options={qrOptions} />
            </div>

            {form.name && (
              <p className="text-center font-medium">{form.name}</p>
            )}
            {form.destination_url && (
              <p className="text-center text-sm text-muted-foreground truncate">
                {form.destination_url}
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
