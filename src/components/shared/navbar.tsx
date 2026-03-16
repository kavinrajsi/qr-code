"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { QrCode, Plus, LogOut, LayoutDashboard, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";

export function Navbar() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <QrCode className="h-4 w-4" />
          QR Generator
        </Link>

        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="default" className="h-8 text-xs" render={<Link href="/create" />}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            New QR
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
