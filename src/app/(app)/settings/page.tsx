"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/shared/theme-provider";
import { QR_DEFAULTS } from "@/lib/qr";
import { Moon, Sun, Palette, QrCode, Bell } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Customize your experience
        </p>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Appearance</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              {[
                { value: "light" as const, label: "Light", icon: Sun },
                { value: "dark" as const, label: "Dark", icon: Moon },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                    theme === opt.value
                      ? "border-brand bg-brand/5 text-brand font-medium"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Default QR Settings */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Default QR Settings</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          These defaults apply when creating new QR codes.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default QR Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue={QR_DEFAULTS.qr_color}
                  className="h-8 w-8 cursor-pointer rounded border border-border"
                />
                <Input defaultValue={QR_DEFAULTS.qr_color} className="flex-1" readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Default Background</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue={QR_DEFAULTS.bg_color}
                  className="h-8 w-8 cursor-pointer rounded border border-border"
                />
                <Input defaultValue={QR_DEFAULTS.bg_color} className="flex-1" readOnly />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Dot Style</Label>
              <Select defaultValue={QR_DEFAULTS.dot_style}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                  <SelectItem value="classy">Classy</SelectItem>
                  <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Corner Style</Label>
              <Select defaultValue={QR_DEFAULTS.corner_style}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="dot">Dot</SelectItem>
                  <SelectItem value="extra-rounded">Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="default-dynamic" defaultChecked={QR_DEFAULTS.is_dynamic} />
            <Label htmlFor="default-dynamic">Create dynamic QR codes by default</Label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Scan Alerts</p>
              <p className="text-xs text-muted-foreground">Get notified when QR codes are scanned</p>
            </div>
            <Switch id="scan-alerts" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly Reports</p>
              <p className="text-xs text-muted-foreground">Receive weekly scan analytics summary</p>
            </div>
            <Switch id="weekly-reports" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Expiration Reminders</p>
              <p className="text-xs text-muted-foreground">Alert before QR codes expire</p>
            </div>
            <Switch id="expiry-alerts" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
