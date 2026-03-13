import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode,
  BarChart3,
  Palette,
  Link2,
  Share2,
  Download,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Full Customization",
    description: "Custom colors, dot styles, corner styles, and logo upload",
  },
  {
    icon: Link2,
    title: "Dynamic QR Codes",
    description: "Update destination URLs anytime without changing the QR code",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Track scans, devices, locations, and trends over time",
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description: "Download as PNG, JPG, or SVG in various resolutions",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share pages, social buttons, and embeddable iframe snippets",
  },
  {
    icon: Shield,
    title: "Password Protection",
    description: "Secure QR codes with passwords and expiration dates",
  },
  {
    icon: Zap,
    title: "Bulk Generation",
    description: "Upload a CSV to create hundreds of QR codes at once",
  },
  {
    icon: QrCode,
    title: "API Access",
    description: "Programmatic QR code creation via REST API",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <QrCode className="h-5 w-5" />
            QR Generator
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/login" />}>
              Sign In
            </Button>
            <Button render={<Link href="/signup" />}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Create Beautiful,{" "}
            <span className="text-primary">Trackable</span> QR Codes
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Generate customizable dynamic QR codes with built-in analytics.
            Track every scan, update destinations anytime, and share everywhere.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" render={<Link href="/signup" />}>
              Start Free
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/50 px-4 py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <feature.icon className="mb-3 h-8 w-8 text-primary" />
                  <h3 className="mb-1 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          Built with Next.js, Supabase, and shadcn/ui
        </div>
      </footer>
    </div>
  );
}
