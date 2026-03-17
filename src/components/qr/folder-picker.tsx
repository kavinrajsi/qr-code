"use client";

import { useState, useRef, useEffect } from "react";
import { useFolders } from "@/hooks/use-folders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, Plus } from "lucide-react";

interface FolderPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function FolderPicker({ value, onChange }: FolderPickerProps) {
  const { folders } = useFolders();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value
    ? folders.filter((f) =>
        f.name.toLowerCase().includes(value.toLowerCase())
      )
    : folders;

  const exactMatch = folders.some(
    (f) => f.name.toLowerCase() === value.toLowerCase()
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-2" ref={ref}>
      <Label htmlFor="folder">Folder (optional)</Label>
      <div className="relative">
        <Input
          id="folder"
          placeholder="e.g. Marketing"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {open && (filtered.length > 0 || (value && !exactMatch)) && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-40 overflow-auto rounded-md border bg-popover p-1 shadow-md">
            {filtered.map((f) => (
              <button
                key={f.name}
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left"
                onClick={() => {
                  onChange(f.name);
                  setOpen(false);
                }}
              >
                <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {f.count}
                </span>
              </button>
            ))}
            {value && !exactMatch && (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left text-brand"
                onClick={() => setOpen(false)}
              >
                <Plus className="h-3.5 w-3.5" />
                Create &quot;{value}&quot;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
