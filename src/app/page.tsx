import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  BarChart3,
  Palette,
  Link2,
  Share2,
  Download,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Full Customization",
    description: "Colors, dot styles, corners, and logo upload",
  },
  {
    icon: Link2,
    title: "Dynamic QR Codes",
    description: "Update destinations without changing the code",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track scans, devices, and locations",
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description: "PNG, JPG, or SVG at any resolution",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share pages, social links, and embed codes",
  },
  {
    icon: Shield,
    title: "Password Protection",
    description: "Secure codes with passwords and expiry",
  },
  {
    icon: Zap,
    title: "Bulk Generation",
    description: "CSV upload for batch creation",
  },
  {
    icon: QrCode,
    title: "API Access",
    description: "Programmatic creation via REST API",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <QrCode className="h-5 w-5" />
            QR Generator
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Sign In
            </Button>
            <Button size="sm" render={<Link href="/signup" />}>
              Get Started
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Beautiful, trackable
              <br />
              QR codes
            </h1>
            <p className="mx-auto max-w-md text-base text-muted-foreground leading-relaxed">
              Generate dynamic QR codes with analytics. Track every scan,
              update destinations anytime.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/signup" />}>
              Start Free
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border/50 px-4 py-24">
        <div className="container mx-auto">
          <p className="mb-16 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Features
          </p>
          <div className="mx-auto grid max-w-4xl gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="space-y-2">
                <feature.icon className="h-5 w-5 text-foreground/70" />
                <h3 className="text-sm font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto text-center text-xs text-muted-foreground">
          Built with Next.js, Supabase & shadcn/ui
        </div>
      </footer>
    </div>
  );
}
