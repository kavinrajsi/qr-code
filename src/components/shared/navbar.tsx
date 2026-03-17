"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QrCode, LogOut, ChevronDown, Menu, X, Plus } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand text-brand-foreground">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <QrCode className="h-6 w-6" />
          QR Generator
        </Link>

        {/* Right: User */}
        <div className="flex items-center gap-3">
          {/* Mobile Create Button */}
          <Link
            href="/create"
            className="flex items-center gap-1 rounded-md bg-white/15 px-3 py-1.5 text-sm font-medium hover:bg-white/25 transition-colors lg:hidden"
          >
            <Plus className="h-4 w-4" />
            Create
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden lg:flex items-center gap-2 outline-none text-sm font-medium hover:opacity-90 transition-opacity">
              {user?.email}
              <ChevronDown className="h-4 w-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/20 bg-brand px-4 py-3 lg:hidden space-y-1">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-sm hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/create"
            className="block rounded-md px-3 py-2 text-sm hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Create QR Code
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full text-left rounded-md px-3 py-2 text-sm hover:bg-white/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
