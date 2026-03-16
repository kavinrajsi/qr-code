"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { QRCodeWithScans } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Copy,
  Edit,
  ExternalLink,
  MoreHorizontal,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface QRTableProps {
  qrCodes: QRCodeWithScans[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  onDelete: (id: string) => void;
}

export function QRTable({
  qrCodes,
  loading,
  search,
  setSearch,
  onDelete,
}: QRTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${appUrl}/qr/${slug}`);
    toast.success("Link copied!");
  };

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
      toast.success("QR code deleted");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          placeholder="Search QR codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium">Name</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-medium">Type</TableHead>
              <TableHead className="hidden md:table-cell text-xs font-medium">Destination</TableHead>
              <TableHead className="text-center text-xs font-medium">Scans</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-medium">Created</TableHead>
              <TableHead className="text-right text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-14" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-6 w-6" /></TableCell>
                </TableRow>
              ))
            ) : qrCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                  {search ? "No QR codes match your search" : "No QR codes yet. Create your first one!"}
                </TableCell>
              </TableRow>
            ) : (
              qrCodes.map((qr) => (
                <TableRow key={qr.id} className="group">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{qr.name}</p>
                      <p className="text-xs text-muted-foreground/60">/{qr.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground capitalize">
                      {(qr.qr_type || "url").replace("_", "-")}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px]">
                    <a
                      href={qr.destination_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground truncate"
                    >
                      {qr.destination_url}
                      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs font-medium tabular-nums">{qr.scan_count}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {format(new Date(qr.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity outline-none">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => window.location.href = `/edit/${qr.id}`}>
                          <Edit className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/analytics/${qr.id}`}>
                          <BarChart3 className="mr-2 h-3.5 w-3.5" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(qr.slug)}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/share/${qr.slug}`, "_blank")}>
                          <Share2 className="mr-2 h-3.5 w-3.5" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(qr.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete QR Code</DialogTitle>
            <DialogDescription>
              This will permanently delete the QR code and all associated analytics data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
