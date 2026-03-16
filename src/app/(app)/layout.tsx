import { Navbar } from "@/components/shared/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">{children}</main>
    </div>
  );
}
