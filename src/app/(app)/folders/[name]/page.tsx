"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQRCodes } from "@/hooks/use-qr-codes";
import { useFolders } from "@/hooks/use-folders";
import { QRTable } from "@/components/dashboard/qr-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function FolderPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const folderName = decodeURIComponent(name);
  const router = useRouter();

  const { qrCodes, loading, search, setSearch, deleteQRCode } = useQRCodes();
  const { renameFolder, deleteFolder } = useFolders();

  const [sort, setSort] = useState("newest");
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(folderName);

  const folderCodes = qrCodes.filter((qr) => qr.folder === folderName);

  const sorted = [...folderCodes].sort((a, b) => {
    if (sort === "newest")
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    if (sort === "oldest")
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    if (sort === "most-scans") return b.scan_count - a.scan_count;
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const handleRename = async () => {
    const ok = await renameFolder(folderName, newName);
    if (ok) {
      toast.success("Folder renamed");
      setRenameOpen(false);
      router.replace(`/folders/${encodeURIComponent(newName.trim())}`);
    } else {
      toast.error("Failed to rename folder");
    }
  };

  const handleDelete = async () => {
    const ok = await deleteFolder(folderName);
    if (ok) {
      toast.success("Folder removed — QR codes moved to unfiled");
      setDeleteOpen(false);
      router.push("/dashboard");
    } else {
      toast.error("Failed to delete folder");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Folder className="h-6 w-6 text-brand" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {folderName}
          </h1>
          <span className="text-sm text-muted-foreground">
            ({folderCodes.length})
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => {
                setNewName(folderName);
                setRenameOpen(true);
              }}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search in folder"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => v && setSort(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Last Created</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-scans">Most Scans</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-brand hover:bg-brand/90 text-brand-foreground"
            render={<Link href="/create" />}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create QR Code
          </Button>
        </div>
      </div>

      {/* Table */}
      {!loading && sorted.length === 0 && !search ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-20">
          <Folder className="h-10 w-10 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold">This folder is empty</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign QR codes to this folder when creating or editing them
          </p>
        </div>
      ) : (
        <QRTable
          qrCodes={sorted}
          loading={loading}
          search={search}
          setSearch={setSearch}
          onDelete={deleteQRCode}
        />
      )}

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              All QR codes in &quot;{folderName}&quot; will be moved to the new
              name.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New folder name"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              This will remove the folder &quot;{folderName}&quot;. The{" "}
              {folderCodes.length} QR code{folderCodes.length !== 1 && "s"} in
              it will become unfiled. They will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
