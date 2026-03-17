"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  QrCode,
  CheckCircle,
  BarChart3,
  User,
  FolderOpen,
  Folder,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";
import { useFolders } from "@/hooks/use-folders";

const qrItems = [
  { label: "Active", href: "/dashboard", icon: CheckCircle },
  { label: "Stats", href: "/dashboard?view=stats", icon: BarChart3 },
];

const bottomItems = [
  { label: "Account", href: "/account", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { folders } = useFolders();

  return (
    <aside className="fixed left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-60 flex-col border-r border-border/50 bg-card lg:flex">
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
        {/* Create Button */}
        <Button
          variant="outline"
          className="w-full justify-center border-brand text-brand hover:bg-brand/5 hover:text-brand font-medium"
          render={<Link href="/create" />}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create QR Code
        </Button>

        {/* Nav Sections */}
        <nav className="mt-8 flex-1 space-y-6">
          {/* QR Codes */}
          <div>
            <div className="flex items-center gap-2 px-2 text-sm font-semibold text-foreground">
              <QrCode className="h-4 w-4" />
              QR Codes
            </div>
            <div className="mt-2 space-y-0.5">
              {qrItems.map((item) => {
                const isActive =
                  pathname === item.href && !item.href.includes("?");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-brand/10 text-brand font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Folders */}
          <div>
            <div className="flex items-center gap-2 px-2 text-sm font-semibold text-foreground">
              <FolderOpen className="h-4 w-4" />
              Folders
            </div>
            {folders.length > 0 ? (
              <div className="mt-2 space-y-0.5">
                {folders.map((folder) => {
                  const href = `/folders/${encodeURIComponent(folder.name)}`;
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={folder.name}
                      href={href}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-brand/10 text-brand font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Folder className="h-4 w-4 shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </span>
                      <span className="ml-2 text-xs tabular-nums opacity-60">
                        {folder.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 px-3 text-xs text-muted-foreground/60">
                Assign folders when creating QR codes
              </p>
            )}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border/50 pt-4 space-y-0.5">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-brand/10 text-brand font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </aside>
  );
}
