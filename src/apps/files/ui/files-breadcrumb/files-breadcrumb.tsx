"use client";

import { ChevronRight, HardDrive } from "lucide-react";

import type { FileSystemNode } from "@/entities/file-system";
import { cn } from "@/shared/lib";

type FilesBreadcrumbProps = {
  trail: FileSystemNode[];
  onNavigate: (nodeId: string | null) => void;
};

export function FilesBreadcrumb({ trail, onNavigate }: FilesBreadcrumbProps) {
  return (
    <div className="flex h-7 items-center gap-0.5 overflow-x-auto px-3 text-[12px]">
      <button
        type="button"
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[var(--files-text-secondary)] transition-colors hover:bg-[var(--files-hover)] hover:text-[var(--files-text)]"
      >
        <HardDrive className="h-3 w-3" />
        <span>Root</span>
      </button>

      {trail.map((node) => (
        <span key={node.id} className="flex items-center gap-0.5">
          <ChevronRight className="h-3 w-3 text-[var(--files-text-secondary)]/50" />
          <button
            type="button"
            onClick={() => onNavigate(node.id)}
            className="rounded px-1.5 py-0.5 text-[var(--files-text-secondary)] transition-colors hover:bg-[var(--files-hover)] hover:text-[var(--files-text)]"
          >
            {node.name}
          </button>
        </span>
      ))}
    </div>
  );
}
