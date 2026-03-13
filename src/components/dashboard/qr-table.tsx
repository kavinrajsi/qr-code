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
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search QR codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Destination</TableHead>
              <TableHead className="text-center">Scans</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-5 w-8" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : qrCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {search ? "No QR codes match your search" : "No QR codes yet. Create your first one!"}
                </TableCell>
              </TableRow>
            ) : (
              qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{qr.name}</p>
                      <p className="text-xs text-muted-foreground">/{qr.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px]">
                    <a
                      href={qr.destination_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground truncate"
                    >
                      {qr.destination_url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{qr.scan_count}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {format(new Date(qr.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `/edit/${qr.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/analytics/${qr.id}`}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(qr.slug)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/share/${qr.slug}`, "_blank")}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(qr.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
